const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  clientSurname: {
    type: String,
    required: [true, 'Client surname is required'],
    trim: true,
    maxlength: [100, 'Surname cannot exceed 100 characters']
  },
  clientEmail: {
    type: String,
    required: [true, 'Client email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  clientPhone: {
    type: String,
    required: [true, 'Client phone is required'],
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ user: 1, date: 1 });
appointmentSchema.index({ user: 1, status: 1 });
appointmentSchema.index({ date: 1, startTime: 1 });

// Validate that end time is after start time
appointmentSchema.pre('save', function(next) {
  const start = parseInt(this.startTime.replace(':', ''));
  const end = parseInt(this.endTime.replace(':', ''));
  
  if (end <= start) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

// Virtual for full client name
appointmentSchema.virtual('clientFullName').get(function() {
  return `${this.clientName} ${this.clientSurname}`;
});

// Static method to find appointments by user and date range
appointmentSchema.statics.findByUserAndDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' }
  }).sort({ date: 1, startTime: 1 });
};

// Static method to check for conflicts
appointmentSchema.statics.checkConflict = async function(userId, date, startTime, endTime, excludeId = null) {
  const query = {
    user: userId,
    date: date,
    status: { $ne: 'cancelled' },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflict = await this.findOne(query);
  return !!conflict;
};

module.exports = mongoose.model('Appointment', appointmentSchema);

