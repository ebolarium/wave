const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'tentative'],
      default: 'pending'
    },
    respondedAt: {
      type: Date,
      default: null
    }
  }],
  category: {
    type: String,
    enum: ['Workshop', 'Conference', 'Meetup', 'Webinar', 'Training', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxAttendees: {
    type: Number,
    default: null,
    min: [1, 'Max attendees must be at least 1']
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: {
    type: Date,
    default: null
  },
  meetingLink: {
    type: String,
    default: null
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'notification', 'sms'],
      required: true
    },
    minutesBefore: {
      type: Number,
      required: true,
      min: [1, 'Reminder must be at least 1 minute before']
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: null
    },
    interval: {
      type: Number,
      default: 1,
      min: [1, 'Interval must be at least 1']
    },
    endDate: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
calendarSchema.index({ startDate: 1 });
calendarSchema.index({ endDate: 1 });
calendarSchema.index({ organizer: 1 });
calendarSchema.index({ status: 1 });
calendarSchema.index({ isPublic: 1 });
calendarSchema.index({ category: 1 });

// Validate that end date is after start date
calendarSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Virtual for attendee count
calendarSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

// Virtual for available spots
calendarSchema.virtual('availableSpots').get(function() {
  if (!this.maxAttendees) return null;
  return Math.max(0, this.maxAttendees - this.attendees.length);
});

// Virtual for event duration in minutes
calendarSchema.virtual('duration').get(function() {
  return Math.round((this.endDate - this.startDate) / (1000 * 60));
});

// Static method to find upcoming events
calendarSchema.statics.findUpcoming = function() {
  return this.find({
    status: { $in: ['scheduled', 'ongoing'] },
    startDate: { $gte: new Date() },
    isPublic: true
  }).populate('organizer', 'username firstName lastName').sort({ startDate: 1 });
};

// Static method to find events by date range
calendarSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    startDate: { $gte: startDate },
    endDate: { $lte: endDate },
    isPublic: true
  }).populate('organizer', 'username firstName lastName').sort({ startDate: 1 });
};

// Static method to find events by category
calendarSchema.statics.findByCategory = function(category) {
  return this.findUpcoming().where({ category });
};

// Instance method to add attendee
calendarSchema.methods.addAttendee = function(userId) {
  // Check if user is already an attendee
  const existingAttendee = this.attendees.find(
    attendee => attendee.user.toString() === userId.toString()
  );
  
  if (existingAttendee) {
    throw new Error('User is already an attendee');
  }
  
  // Check if event is full
  if (this.maxAttendees && this.attendees.length >= this.maxAttendees) {
    throw new Error('Event is full');
  }
  
  this.attendees.push({
    user: userId,
    status: 'accepted',
    respondedAt: new Date()
  });
  
  return this.save();
};

// Instance method to remove attendee
calendarSchema.methods.removeAttendee = function(userId) {
  this.attendees = this.attendees.filter(
    attendee => attendee.user.toString() !== userId.toString()
  );
  return this.save();
};

// Instance method to update attendee status
calendarSchema.methods.updateAttendeeStatus = function(userId, status) {
  const attendee = this.attendees.find(
    attendee => attendee.user.toString() === userId.toString()
  );
  
  if (!attendee) {
    throw new Error('User is not an attendee');
  }
  
  attendee.status = status;
  attendee.respondedAt = new Date();
  
  return this.save();
};

module.exports = mongoose.model('Calendar', calendarSchema);
