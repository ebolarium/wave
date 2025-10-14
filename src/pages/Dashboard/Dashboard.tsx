import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI, closureAPI } from '../../services/api';
import TimeSlotModal from '../../components/Modals/TimeSlotModal';
import AppointmentModal, { AppointmentData } from '../../components/Modals/AppointmentModal';
import ClosureModal, { ClosureData } from '../../components/Modals/ClosureModal';
import './Dashboard.css';

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientSurname: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  status: string;
}

interface Closure {
  _id: string;
  date: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [closures, setClosures] = useState<Closure[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [timeSlotModalOpen, setTimeSlotModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedHour, setSelectedHour] = useState(0);
  const [isFullDayClosure, setIsFullDayClosure] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingClosure, setEditingClosure] = useState<Closure | null>(null);

  useEffect(() => {
    fetchAppointmentsAndClosures();
  }, [currentDate]);

  // Auto-refresh every 30 seconds to check for new appointments
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointmentsAndClosures();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentDate]);

  const fetchAppointmentsAndClosures = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [appointmentsRes, closuresRes] = await Promise.all([
        appointmentAPI.getAppointments({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        closureAPI.getClosures({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      ]);

      setAppointments(appointmentsRes.data.data?.appointments || []);
      setClosures(closuresRes.data.data?.closures || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const generateCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const isPast = date < today;
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
      const isSelected =
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      const dayClosures = closures.filter(
        (c) => new Date(c.date).toDateString() === date.toDateString()
      );
      const hasFullDayClosure = dayClosures.some((c) => c.isFullDay);
      const dayAppointments = appointments.filter(
        (a) => new Date(a.date).toDateString() === date.toDateString()
      );
      const pendingCount = dayAppointments.filter((a) => a.status === 'pending').length;
      const confirmedCount = dayAppointments.filter((a) => a.status === 'confirmed').length;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${
            hasFullDayClosure ? 'full-day-closed' : ''
          } ${isPast ? 'past' : ''}`}
          onClick={() => !isPast && setSelectedDate(date)}
        >
          <span className="day-number">{day}</span>
          {/* Top left - Closure */}
          {dayClosures.length > 0 && !hasFullDayClosure && (
            <span className="day-badge closure-badge-left">🚫</span>
          )}
          {/* Top center - Pending */}
          {pendingCount > 0 && (
            <span className="day-badge pending-badge-center">{pendingCount}</span>
          )}
          {/* Top right - Confirmed */}
          {confirmedCount > 0 && (
            <span className="day-badge confirmed-badge-right">{confirmedCount}</span>
          )}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleTimeSlotClick = (hour: number) => {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
    setSelectedTimeSlot(timeSlot);
    setSelectedHour(hour);

    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const existingAppointment = getAppointmentForTimeSlot(selectedDate, startTime);
    const existingClosure = getClosureForTimeSlot(selectedDate, startTime);

    if (existingAppointment) {
      setEditingAppointment(existingAppointment);
      setAppointmentModalOpen(true);
    } else if (existingClosure) {
      setEditingClosure(existingClosure);
      setClosureModalOpen(true);
    } else {
      setTimeSlotModalOpen(true);
    }
  };

  const getAppointmentForTimeSlot = (date: Date, startTime: string): Appointment | null => {
    return (
      appointments.find(
        (a) =>
          new Date(a.date).toDateString() === date.toDateString() && a.startTime === startTime
      ) || null
    );
  };

  const getClosureForTimeSlot = (date: Date, startTime: string): Closure | null => {
    return (
      closures.find(
        (c) =>
          new Date(c.date).toDateString() === date.toDateString() &&
          (c.isFullDay || c.startTime === startTime)
      ) || null
    );
  };

  const isTimeSlotClosed = (date: Date, hour: number): boolean => {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

    return closures.some((c) => {
      if (new Date(c.date).toDateString() !== date.toDateString()) return false;
      if (c.isFullDay) return true;
      if (c.startTime && c.endTime) {
        return c.startTime <= startTime && c.endTime >= endTime;
      }
      return false;
    });
  };

  const handleBookAppointment = () => {
    setTimeSlotModalOpen(false);
    setAppointmentModalOpen(true);
  };

  const handleCloseHour = () => {
    setTimeSlotModalOpen(false);
    setIsFullDayClosure(false);
    setClosureModalOpen(true);
  };

  const handleFullDayToggle = async () => {
    const dayClosures = closures.filter(
      (c) => new Date(c.date).toDateString() === selectedDate.toDateString() && c.isFullDay
    );
    
    if (dayClosures.length > 0) {
      // Day is currently closed, remove the closure
      const closure = dayClosures[0];
      if (window.confirm('Are you sure you want to open this day?')) {
        try {
          await closureAPI.deleteClosure(closure._id);
          fetchAppointmentsAndClosures();
        } catch (error: any) {
          alert(error.response?.data?.message || 'Error removing closure');
        }
      }
    } else {
      // Day is open, close it
      setIsFullDayClosure(true);
      setClosureModalOpen(true);
    }
  };

  const isFullDayClosed = () => {
    return closures.some(
      (c) => new Date(c.date).toDateString() === selectedDate.toDateString() && c.isFullDay
    );
  };

  const getNextAppointment = () => {
    const now = new Date();
    const upcomingAppointments = appointments
      .filter((a) => {
        const appointmentDate = new Date(a.date);
        const [hours, minutes] = a.startTime.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes));
        return appointmentDate > now && a.status === 'confirmed';
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.startTime);
        const dateB = new Date(b.date + ' ' + b.startTime);
        return dateA.getTime() - dateB.getTime();
      });
    
    return upcomingAppointments[0] || null;
  };

  const getPendingAppointmentsCount = () => {
    return appointments.filter((a) => a.status === 'pending').length;
  };

  const handleSaveAppointment = async (data: AppointmentData) => {
    try {
      const startTime = `${selectedHour.toString().padStart(2, '0')}:00`;
      const endTime = `${(selectedHour + 1).toString().padStart(2, '0')}:00`;

      if (editingAppointment) {
        await appointmentAPI.updateAppointment(editingAppointment._id, {
          ...data,
          date: selectedDate.toISOString(),
          startTime,
          endTime,
        });
      } else {
        await appointmentAPI.createAppointment({
          ...data,
          date: selectedDate.toISOString(),
          startTime,
          endTime,
        });
      }

      setAppointmentModalOpen(false);
      setEditingAppointment(null);
      fetchAppointmentsAndClosures();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving appointment');
    }
  };

  const handleSaveClosure = async (data: ClosureData) => {
    try {
      const closureData: any = {
        date: selectedDate.toISOString(),
        isFullDay: isFullDayClosure,
        reason: data.reason,
      };

      if (!isFullDayClosure) {
        closureData.startTime = `${selectedHour.toString().padStart(2, '0')}:00`;
        closureData.endTime = `${(selectedHour + 1).toString().padStart(2, '0')}:00`;
      }

      if (editingClosure) {
        await closureAPI.updateClosure(editingClosure._id, closureData);
      } else {
        await closureAPI.createClosure(closureData);
      }

      setClosureModalOpen(false);
      setEditingClosure(null);
      fetchAppointmentsAndClosures();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving closure');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!editingAppointment) return;
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await appointmentAPI.deleteAppointment(editingAppointment._id);
      setAppointmentModalOpen(false);
      setEditingAppointment(null);
      fetchAppointmentsAndClosures();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting appointment');
    }
  };

  const handleApproveAppointment = async () => {
    if (!editingAppointment) return;

    try {
      await appointmentAPI.updateAppointment(editingAppointment._id, {
        status: 'confirmed'
      });
      setAppointmentModalOpen(false);
      setEditingAppointment(null);
      fetchAppointmentsAndClosures();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error approving appointment');
    }
  };

  const handleRejectAppointment = async () => {
    if (!editingAppointment) return;
    if (!window.confirm('Are you sure you want to reject this appointment?')) return;

    try {
      await appointmentAPI.updateAppointment(editingAppointment._id, {
        status: 'cancelled'
      });
      setAppointmentModalOpen(false);
      setEditingAppointment(null);
      fetchAppointmentsAndClosures();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error rejecting appointment');
    }
  };

  const handleDeleteClosure = async () => {
    if (!editingClosure) return;
    if (!window.confirm('Are you sure you want to delete this closure?')) return;

    try {
      await closureAPI.deleteClosure(editingClosure._id);
      setClosureModalOpen(false);
      setEditingClosure(null);
      fetchAppointmentsAndClosures();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting closure');
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    const isSelectedDateToday = selectedDateOnly.getTime() === today.getTime();
    const currentHour = now.getHours();

    for (let hour = 9; hour <= 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const appointment = getAppointmentForTimeSlot(selectedDate, startTime);
      const isClosed = isTimeSlotClosed(selectedDate, hour);
      const isPastHour = isSelectedDateToday && hour <= currentHour;
      const isPending = appointment?.status === 'pending';

      slots.push(
        <div
          key={hour}
          className={`time-slot ${appointment ? 'has-appointment' : ''} ${isClosed ? 'closed' : ''} ${isPastHour ? 'past' : ''} ${isPending ? 'pending' : ''}`}
          onClick={() => !isPastHour && handleTimeSlotClick(hour)}
        >
          <div className="time-label">{hour.toString().padStart(2, '0')}:00</div>
          <div className="time-content">
            {isPastHour && !appointment ? (
              <div className="slot-past">
                <span>Past</span>
              </div>
            ) : isClosed ? (
              <div className="slot-closed">
                <span className="closed-icon">🚫</span>
                <span>Closed</span>
              </div>
            ) : appointment ? (
              <div className="appointment-info">
                {isPending && <span className="pending-badge">⏳ Pending</span>}
                <strong>
                  {appointment.clientName} {appointment.clientSurname}
                </strong>
                <small>{appointment.clientEmail}</small>
                <small>{appointment.clientPhone}</small>
              </div>
            ) : (
              <div className="slot-available">Click to book</div>
            )}
          </div>
        </div>
      );
    }
    return slots;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const nextAppointment = getNextAppointment();
  const pendingCount = getPendingAppointmentsCount();

  return (
    <div className="dashboard-page">
      <div className="page-content">
        <div className="container">
          <div className="dashboard-content">
            {/* Appointment Info Section */}
            <div className="appointment-info-section">
              <div className="info-card next-appointment">
                <div className="info-label">Next Appointment</div>
                {nextAppointment ? (
                  <div className="info-content">
                    <span className="info-date">
                      {new Date(nextAppointment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="info-separator">|</span>
                    <span className="info-time">{nextAppointment.startTime}</span>
                    <span className="info-separator">|</span>
                    <span className="info-name">
                      {nextAppointment.clientName} {nextAppointment.clientSurname}
                    </span>
                  </div>
                ) : (
                  <div className="info-content">
                    <span className="no-data">No upcoming appointments</span>
                  </div>
                )}
              </div>

              <div className="info-card pending-appointments">
                <div className="info-label">Approval Waiting Appointments</div>
                <div className="info-content">
                  <span className="pending-count">{pendingCount}</span>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="calendar-layout">
              <div className="calendar-view">
                <div className="calendar-header">
                  <button onClick={() => changeMonth(-1)} className="nav-button">
                    &#8249;
                  </button>
                  <h2 className="current-month">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button onClick={() => changeMonth(1)} className="nav-button">
                    &#8250;
                  </button>
                </div>

                <div className="calendar-grid">
                  <div className="day-names">
                    {dayNames.map((day) => (
                      <div key={day} className="day-name">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="calendar-days">{generateCalendarDays()}</div>
                </div>
              </div>

              <div className="working-hours">
                <div className="working-hours-header">
                  <div className="header-info">
                    <h3>
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <p>Working Hours (09:00 - 18:00)</p>
                  </div>
                  <div className="full-day-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isFullDayClosed()}
                        onChange={handleFullDayToggle}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="toggle-label">Close Full Day</span>
                  </div>
                </div>
                <div className="time-slots">{generateTimeSlots()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TimeSlotModal
        isOpen={timeSlotModalOpen}
        onClose={() => setTimeSlotModalOpen(false)}
        date={selectedDate}
        timeSlot={selectedTimeSlot}
        onBookAppointment={handleBookAppointment}
        onCloseHour={handleCloseHour}
      />

      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => {
          setAppointmentModalOpen(false);
          setEditingAppointment(null);
        }}
        onSave={handleSaveAppointment}
        date={selectedDate}
        timeSlot={selectedTimeSlot}
        initialData={
          editingAppointment
            ? {
                clientName: editingAppointment.clientName,
                clientSurname: editingAppointment.clientSurname,
                clientEmail: editingAppointment.clientEmail,
                clientPhone: editingAppointment.clientPhone,
                notes: editingAppointment.notes,
              }
            : null
        }
        isEditing={!!editingAppointment}
        isPending={editingAppointment?.status === 'pending'}
        onApprove={handleApproveAppointment}
        onReject={handleRejectAppointment}
        onDelete={handleDeleteAppointment}
      />

      <ClosureModal
        isOpen={closureModalOpen}
        onClose={() => {
          setClosureModalOpen(false);
          setEditingClosure(null);
        }}
        onSave={handleSaveClosure}
        date={selectedDate}
        timeSlot={isFullDayClosure ? undefined : selectedTimeSlot}
        isFullDay={isFullDayClosure}
        initialData={editingClosure ? { reason: editingClosure.reason } : null}
        isEditing={!!editingClosure}
        onDelete={handleDeleteClosure}
      />
    </div>
  );
};

export default Dashboard;
