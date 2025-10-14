import React, { useState, useEffect } from 'react';
import './Modal.css';

interface ClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClosureData) => void;
  date: Date;
  timeSlot?: string;
  isFullDay: boolean;
  initialData?: ClosureData | null;
  isEditing?: boolean;
  onDelete?: () => void;
}

export interface ClosureData {
  reason?: string;
}

const ClosureModal: React.FC<ClosureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  date,
  timeSlot,
  isFullDay,
  initialData,
  isEditing = false,
  onDelete,
}) => {
  const [formData, setFormData] = useState<ClosureData>({
    reason: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ reason: '' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData({ reason: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
      <div className="modal-content closure-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Closure' : (isFullDay ? 'Close Full Day' : 'Close Hour')}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="time-slot-info">
            <p className="slot-date">{formattedDate}</p>
            {timeSlot && <p className="slot-time">{timeSlot}</p>}
            {isFullDay && <p className="full-day-badge">Full Day Closure</p>}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reason">Reason (Optional)</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                placeholder="You can optionally add a reason for this closure..."
                maxLength={200}
              />
              <small className="char-count">
                {formData.reason?.length || 0} / 200 characters
              </small>
            </div>

            <div className="closure-warning">
              <p>⚠️ This will block appointments for this {isFullDay ? 'entire day' : 'time slot'}.</p>
            </div>

            <div className="modal-footer">
              {isEditing ? (
                <>
                  <button type="button" className="btn btn-danger" onClick={onDelete}>
                    Delete
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Update Closure
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Confirm Closure
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

export default ClosureModal;

