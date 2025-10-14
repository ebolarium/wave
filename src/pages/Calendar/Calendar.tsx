import React, { useState, useEffect } from 'react';
import { appointmentAPI, closureAPI, usersAPI } from '../../services/api';
import AppointmentModal, { AppointmentData } from '../../components/Modals/AppointmentModal';
import './Calendar.css';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

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

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [closures, setClosures] = useState<Closure[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedHour, setSelectedHour] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchAppointmentsAndClosures();
    }
  }, [currentDate, selectedUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getPublicUsers();
      const users = response.data.data?.users || [];
      setUsers(users);
      if (users.length > 0) {
        setSelectedUser(users[0]._id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentsAndClosures = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [appointmentsRes, closuresRes] = await Promise.all([
        appointmentAPI.getPublicAppointments(selectedUser, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        closureAPI.getPublicClosures(selectedUser, {
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

      // Count available slots (9-18 = 10 slots)
      const totalSlots = 10;
      const bookedSlots = dayAppointments.length;
      const availableSlots = totalSlots - bookedSlots;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${
            hasFullDayClosure ? 'full-day-closed' : ''
          } ${isPast ? 'past' : ''}`}
          onClick={() => !isPast && setSelectedDate(date)}
        >
          <span className="day-number">{day}</span>
          {!hasFullDayClosure && !isPast && availableSlots > 0 && (
            <span className="day-badge available-badge">{availableSlots}</span>
          )}
          {hasFullDayClosure && (
            <span className="day-badge closure-badge">🚫</span>
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
    setAppointmentModalOpen(true);
  };

  const getAppointmentForTimeSlot = (date: Date, startTime: string): Appointment | null => {
    return (
      appointments.find(
        (a) =>
          new Date(a.date).toDateString() === date.toDateString() && a.startTime === startTime
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

  const handleSaveAppointment = async (data: AppointmentData) => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    try {
      const startTime = `${selectedHour.toString().padStart(2, '0')}:00`;
      const endTime = `${(selectedHour + 1).toString().padStart(2, '0')}:00`;

      await appointmentAPI.createPublicAppointment(selectedUser, {
        ...data,
        date: selectedDate.toISOString(),
        startTime,
        endTime,
      });

      setAppointmentModalOpen(false);
      alert('Appointment booked successfully!');
      fetchAppointmentsAndClosures();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error booking appointment');
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
      const isAvailable = !appointment && !isClosed && !isPastHour;

      slots.push(
        <div
          key={hour}
          className={`time-slot ${appointment ? 'has-appointment' : ''} ${isClosed ? 'closed' : ''} ${isPastHour ? 'past' : ''} ${isAvailable ? 'available' : ''}`}
          onClick={() => isAvailable && handleTimeSlotClick(hour)}
        >
          <div className="time-label">{hour.toString().padStart(2, '0')}:00</div>
          <div className="time-content">
            {isPastHour ? (
              <div className="slot-past">
                <span>Past</span>
              </div>
            ) : isClosed ? (
              <div className="slot-closed">
                <span className="closed-icon">🚫</span>
                <span>Closed</span>
              </div>
            ) : appointment ? (
              <div className="slot-booked">
                <span className="booked-icon">📅</span>
                <span>Booked</span>
              </div>
            ) : (
              <div className="slot-available">
                <span className="available-icon">✓</span>
                <span>Available - Click to book</span>
              </div>
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

  const selectedUserInfo = users.find((u) => u._id === selectedUser);

  return (
    <div className="calendar-page public-calendar">
      <div className="page-content">
        <div className="container">
          {/* User Selection */}
          <div className="user-selection">
            <label htmlFor="user-select">Select Professional:</label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select --</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          {selectedUser && selectedUserInfo && (
            <>
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

                  <div className="calendar-legend">
                    <div className="legend-item">
                      <span className="legend-badge available-badge">5</span>
                      <span>Available slots</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-badge closure-badge">🚫</span>
                      <span>Not available</span>
                    </div>
                  </div>
                </div>

                <div className="working-hours">
                  <div className="working-hours-header">
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
                  <div className="time-slots">{generateTimeSlots()}</div>
                </div>
              </div>
            </>
          )}

          {!selectedUser && (
            <div className="no-selection">
              <p>👆 Please select a professional to view available time slots</p>
            </div>
          )}
        </div>
      </div>

      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
        date={selectedDate}
        timeSlot={selectedTimeSlot}
        initialData={null}
        isEditing={false}
      />
    </div>
  );
};

export default Calendar;
