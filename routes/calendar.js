const express = require('express');
const { body, validationResult } = require('express-validator');
const Calendar = require('../models/Calendar');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/calendar
// @desc    Get all public upcoming events
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = { isPublic: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    } else {
      // Default to upcoming events
      query.startDate = { $gte: new Date() };
    }

    const events = await Calendar.find(query)
      .populate('organizer', 'username firstName lastName avatar')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Calendar.countDocuments(query);

    res.json({
      message: 'Events retrieved successfully',
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      message: 'Server error retrieving events',
      code: 'GET_EVENTS_ERROR'
    });
  }
});

// @route   GET /api/calendar/my-events
// @desc    Get user's events (organized and attending)
// @access  Private
router.get('/my-events', authenticateToken, async (req, res) => {
  try {
    const organizedEvents = await Calendar.find({
      organizer: req.user._id
    }).populate('organizer', 'username firstName lastName avatar')
      .sort({ startDate: 1 });

    const attendingEvents = await Calendar.find({
      'attendees.user': req.user._id
    }).populate('organizer', 'username firstName lastName avatar')
      .sort({ startDate: 1 });

    res.json({
      message: 'User events retrieved successfully',
      organized: organizedEvents,
      attending: attendingEvents
    });

  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      message: 'Server error retrieving user events',
      code: 'GET_USER_EVENTS_ERROR'
    });
  }
});

// @route   GET /api/calendar/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id)
      .populate('organizer', 'username firstName lastName avatar bio');

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // Check if event is public or user has access
    if (!event.isPublic && (!req.user || req.user._id.toString() !== event.organizer._id.toString())) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({
      message: 'Event retrieved successfully',
      event
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      message: 'Server error retrieving event',
      code: 'GET_EVENT_ERROR'
    });
  }
});

// @route   POST /api/calendar
// @desc    Create new event
// @access  Private
router.post('/', [
  authenticateToken,
  body('title')
    .notEmpty()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters'),
  body('description')
    .notEmpty()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description is required and cannot exceed 1000 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('category')
    .optional()
    .isIn(['Workshop', 'Conference', 'Meetup', 'Webinar', 'Training', 'Other']),
  body('location').optional().trim().isLength({ max: 200 }),
  body('maxAttendees').optional().isInt({ min: 1 }),
  body('registrationRequired').optional().isBoolean()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id
    };

    const event = new Calendar(eventData);
    await event.save();

    await event.populate('organizer', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      message: 'Server error creating event',
      code: 'CREATE_EVENT_ERROR'
    });
  }
});

// @route   PUT /api/calendar/:id
// @desc    Update event
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('title').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('category').optional().isIn(['Workshop', 'Conference', 'Meetup', 'Webinar', 'Training', 'Other']),
  body('location').optional().trim().isLength({ max: 200 }),
  body('maxAttendees').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'])
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const updatedEvent = await Calendar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'username firstName lastName avatar');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      message: 'Server error updating event',
      code: 'UPDATE_EVENT_ERROR'
    });
  }
});

// @route   DELETE /api/calendar/:id
// @desc    Delete event
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // Check if user is the organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await Calendar.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      message: 'Server error deleting event',
      code: 'DELETE_EVENT_ERROR'
    });
  }
});

// @route   POST /api/calendar/:id/register
// @desc    Register for event
// @access  Private
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    if (!event.isPublic) {
      return res.status(403).json({
        message: 'Event is not open for registration',
        code: 'EVENT_NOT_PUBLIC'
      });
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({
        message: 'Registration deadline has passed',
        code: 'REGISTRATION_DEADLINE_PASSED'
      });
    }

    await event.addAttendee(req.user._id);

    res.json({
      message: 'Successfully registered for event',
      attendeeCount: event.attendeeCount
    });

  } catch (error) {
    if (error.message === 'User is already an attendee') {
      return res.status(400).json({
        message: 'You are already registered for this event',
        code: 'ALREADY_REGISTERED'
      });
    }

    if (error.message === 'Event is full') {
      return res.status(400).json({
        message: 'Event is full',
        code: 'EVENT_FULL'
      });
    }

    console.error('Register for event error:', error);
    res.status(500).json({
      message: 'Server error registering for event',
      code: 'REGISTER_EVENT_ERROR'
    });
  }
});

// @route   DELETE /api/calendar/:id/register
// @desc    Unregister from event
// @access  Private
router.delete('/:id/register', authenticateToken, async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    await event.removeAttendee(req.user._id);

    res.json({
      message: 'Successfully unregistered from event',
      attendeeCount: event.attendeeCount
    });

  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      message: 'Server error unregistering from event',
      code: 'UNREGISTER_EVENT_ERROR'
    });
  }
});

module.exports = router;
