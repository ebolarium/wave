import React, { useState, useEffect } from 'react';
import './Modal.css';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AppointmentData) => void;
  date: Date;
  timeSlot: string;
  initialData?: AppointmentData | null;
  isEditing?: boolean;
  isPending?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
}

export interface AppointmentData {
  clientName: string;
  clientSurname: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  date,
  timeSlot,
  initialData,
  isEditing = false,
  isPending = false,
  onApprove,
  onReject,
  onDelete,
}) => {
  const [formData, setFormData] = useState<AppointmentData>({
    clientName: '',
    clientSurname: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<AppointmentData>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        clientName: '',
        clientSurname: '',
        clientEmail: '',
        clientPhone: '',
        notes: '',
      });
    }
    setErrors({});
    setIsLoading(false); // Reset loading state when modal opens
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof AppointmentData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<AppointmentData> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Name is required';
    }

    if (!formData.clientSurname.trim()) {
      newErrors.clientSurname = 'Surname is required';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Invalid email format';
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        await onSave(formData);
        // Loading will continue until modal closes (handled by parent component)
      } catch (error) {
        setIsLoading(false); // Reset loading state on error
        console.error('Error saving appointment:', error);
      }
    }
  };

  if (!isOpen) return null;

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content appointment-modal" onClick={(e) => e.stopPropagation()}>
        {isLoading && (
          <div className="modal-loading-overlay">
            <div className="spinner">
              <div className="spinner-inner"></div>
            </div>
            <p className="loading-text">Booking your appointment...</p>
          </div>
        )}
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Appointment' : 'Book Appointment'}</h2>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="time-slot-info">
            <p className="slot-date">{formattedDate}</p>
            <p className="slot-time">{timeSlot}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientName">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className={errors.clientName ? 'error' : ''}
                  placeholder="Enter client's name"
                  disabled={isLoading}
                />
                {errors.clientName && <span className="error-message">{errors.clientName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="clientSurname">
                  Surname <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="clientSurname"
                  name="clientSurname"
                  value={formData.clientSurname}
                  onChange={handleChange}
                  className={errors.clientSurname ? 'error' : ''}
                  placeholder="Enter client's surname"
                  disabled={isLoading}
                />
                {errors.clientSurname && <span className="error-message">{errors.clientSurname}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="clientEmail">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                className={errors.clientEmail ? 'error' : ''}
                placeholder="client@example.com"
                disabled={isLoading}
              />
              {errors.clientEmail && <span className="error-message">{errors.clientEmail}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="clientPhone">
                Phone <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                className={errors.clientPhone ? 'error' : ''}
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
              />
              {errors.clientPhone && <span className="error-message">{errors.clientPhone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes about this appointment..."
                disabled={isLoading}
              />
            </div>

            <div className="modal-footer">
              {isPending && isEditing ? (
                <>
                  <button type="button" className="btn btn-danger" onClick={onReject} disabled={isLoading}>
                    ✕ Reject
                  </button>
                  <button type="button" className="btn btn-success" onClick={onApprove} disabled={isLoading}>
                    ✓ Approve
                  </button>
                </>
              ) : isEditing ? (
                <>
                  <button type="button" className="btn btn-danger" onClick={onDelete} disabled={isLoading}>
                    Delete
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    Update Appointment
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    Book Appointment
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;

