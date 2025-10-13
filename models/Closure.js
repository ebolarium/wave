const mongoose = require('mongoose');

const closureSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Closure date is required']
  },
  isFullDay: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String,
    required: function() { return !this.isFullDay; },
    match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: function() { return !this.isFullDay; },
    match: [/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [200, 'Reason cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
closureSchema.index({ user: 1, date: 1 });
closureSchema.index({ user: 1, isFullDay: 1 });

// Validate that end time is after start time for partial day closures
closureSchema.pre('save', function(next) {
  if (!this.isFullDay) {
    const start = parseInt(this.startTime.replace(':', ''));
    const end = parseInt(this.endTime.replace(':', ''));
    
    if (end <= start) {
      return next(new Error('End time must be after start time'));
    }
  }
  next();
});

// Static method to find closures by user and date range
closureSchema.statics.findByUserAndDateRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1, startTime: 1 });
};

// Static method to check if a time slot is closed
closureSchema.statics.isTimeClosed = async function(userId, date, startTime, endTime) {
  // Check for full day closure
  const fullDayClosure = await this.findOne({
    user: userId,
    date: date,
    isFullDay: true
  });
  
  if (fullDayClosure) {
    return true;
  }
  
  // Check for partial closures that overlap with the given time
  const partialClosure = await this.findOne({
    user: userId,
    date: date,
    isFullDay: false,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  });
  
  return !!partialClosure;
};

module.exports = mongoose.model('Closure', closureSchema);

