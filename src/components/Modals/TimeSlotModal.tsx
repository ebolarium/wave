import React from 'react';
import './Modal.css';

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  timeSlot: string;
  onBookAppointment: () => void;
  onCloseHour: () => void;
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isOpen,
  onClose,
  date,
  timeSlot,
  onBookAppointment,
  onCloseHour,
}) => {
  if (!isOpen) return null;

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Time Slot Actions</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="time-slot-info">
            <p className="slot-date">{formattedDate}</p>
            <p className="slot-time">{timeSlot}</p>
          </div>

          <div className="action-buttons">
            <button className="action-btn appointment-btn" onClick={onBookAppointment}>
              <span className="btn-icon">📅</span>
              <span className="btn-text">
                <strong>Book Appointment</strong>
                <small>Create a new appointment for this time slot</small>
              </span>
            </button>

            <button className="action-btn close-hour-btn" onClick={onCloseHour}>
              <span className="btn-icon">🚫</span>
              <span className="btn-text">
                <strong>Close This Hour</strong>
                <small>Block this specific time slot</small>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotModal;

