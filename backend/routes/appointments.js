const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Closure = require('../models/Closure');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { autoCancelExpiredAppointments } = require('../middleware/autoCancelMiddleware');
const { 
  sendVisitorRequestConfirmation, 
  sendOwnerNewRequestNotification,
  sendVisitorApprovalConfirmation,
  sendVisitorDeclineNotification,
  sendVisitorCancellationConfirmation,
  sendOwnerCancellationNotification
} = require('../services/emailService');
const { generateActionToken } = require('./appointmentActions');
const router = express.Router();

// Apply auto-cancel middleware to all appointment routes
router.use(autoCancelExpiredAppointments);

// @route   GET /api/appointments/public/:userId
// @desc    Get user's appointments for public booking (no client details)
// @access  Public
router.get('/public/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId } = req.params;
    
    let query = { user: userId, status: { $ne: 'cancelled' } };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Only return minimal info for public view (no client details)
    // Use the new findActiveAppointments method to exclude cancelled appointments
    const appointments = await Appointment.findActiveAppointments(query)
      .select('date startTime endTime status')
      .sort({ date: 1, startTime: 1 });
    
    res.json({
      message: 'Appointments retrieved successfully',
      data: {
        appointments
      }
    });
    
  } catch (error) {
    console.error('Get public appointments error:', error);
    res.status(500).json({
      message: 'Server error retrieving appointments',
      code: 'GET_APPOINTMENTS_ERROR'
    });
  }
});

// @route   GET /api/appointments
// @desc    Get user's appointments (optionally filtered by date range)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { user: req.user._id, status: { $ne: 'cancelled' } };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const appointments = await Appointment.findActiveAppointments(query).sort({ date: 1, startTime: 1 });
    
    res.json({
      message: 'Appointments retrieved successfully',
      data: {
        appointments
      }
    });
    
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      message: 'Server error retrieving appointments',
      code: 'GET_APPOINTMENTS_ERROR'
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }
    
    // Check if user owns this appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    res.json({
      message: 'Appointment retrieved successfully',
      data: {
        appointment
      }
    });
    
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      message: 'Server error retrieving appointment',
      code: 'GET_APPOINTMENT_ERROR'
    });
  }
});

// @route   POST /api/appointments/public/:userId
// @desc    Create new appointment (public booking)
// @access  Public
router.post('/public/:userId', [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM)'),
  body('endTime').matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM)'),
  body('clientName').trim().notEmpty().withMessage('Client name is required').isLength({ max: 100 }),
  body('clientSurname').trim().notEmpty().withMessage('Client surname is required').isLength({ max: 100 }),
  body('clientEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('clientPhone').trim().notEmpty().withMessage('Client phone is required').isLength({ max: 20 }),
  body('notes').optional().trim().isLength({ max: 500 })
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
    
    const { userId } = req.params;
    const { date, startTime, endTime, clientName, clientSurname, clientEmail, clientPhone, notes } = req.body;
    
    // Check for appointment conflicts
    const hasConflict = await Appointment.checkConflict(userId, new Date(date), startTime, endTime);
    if (hasConflict) {
      return res.status(400).json({
        message: 'Time slot conflicts with existing appointment',
        code: 'APPOINTMENT_CONFLICT'
      });
    }
    
    // Check if time is closed
    const isClosed = await Closure.isTimeClosed(userId, new Date(date), startTime, endTime);
    if (isClosed) {
      return res.status(400).json({
        message: 'Time slot is closed',
        code: 'TIME_SLOT_CLOSED'
      });
    }
    
    const appointment = new Appointment({
      user: userId,
      date: new Date(date),
      startTime,
      endTime,
      clientName,
      clientSurname,
      clientEmail,
      clientPhone,
      notes,
      status: 'pending'  // Public bookings require approval
    });
    
    await appointment.save();
    await appointment.populate('user', 'firstName lastName email');

    // Send confirmation email to visitor
    await sendVisitorRequestConfirmation(appointment, appointment.user);

    // Send notification email to owner with action links
    const confirmToken = generateActionToken(appointment._id, 'confirm');
    const declineToken = generateActionToken(appointment._id, 'decline');
    const confirmUrl = `${process.env.API_URL}/api/appointment-actions/confirm/${confirmToken}`;
    const declineUrl = `${process.env.API_URL}/api/appointment-actions/decline/${declineToken}`;
    
    await sendOwnerNewRequestNotification(appointment, appointment.user.email, confirmUrl, declineUrl);
    
    res.status(201).json({
      message: 'Appointment created successfully',
      data: {
        appointment: {
          _id: appointment._id,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime
        }
      }
    });
    
  } catch (error) {
    console.error('Create public appointment error:', error);
    res.status(500).json({
      message: 'Server error creating appointment',
      code: 'CREATE_APPOINTMENT_ERROR'
    });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', [
  authenticateToken,
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM)'),
  body('endTime').matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM)'),
  body('clientName').trim().notEmpty().withMessage('Client name is required').isLength({ max: 100 }),
  body('clientSurname').trim().notEmpty().withMessage('Client surname is required').isLength({ max: 100 }),
  body('clientEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('clientPhone').trim().notEmpty().withMessage('Client phone is required').isLength({ max: 20 }),
  body('notes').optional().trim().isLength({ max: 500 })
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
    
    const { date, startTime, endTime, clientName, clientSurname, clientEmail, clientPhone, notes } = req.body;
    
    // Check for appointment conflicts
    const hasConflict = await Appointment.checkConflict(req.user._id, new Date(date), startTime, endTime);
    if (hasConflict) {
      return res.status(400).json({
        message: 'Time slot conflicts with existing appointment',
        code: 'APPOINTMENT_CONFLICT'
      });
    }
    
    // Check if time is closed
    const isClosed = await Closure.isTimeClosed(req.user._id, new Date(date), startTime, endTime);
    if (isClosed) {
      return res.status(400).json({
        message: 'Time slot is closed',
        code: 'TIME_SLOT_CLOSED'
      });
    }
    
    const appointment = new Appointment({
      user: req.user._id,
      date: new Date(date),
      startTime,
      endTime,
      clientName,
      clientSurname,
      clientEmail,
      clientPhone,
      notes,
      status: 'confirmed'
    });
    
    await appointment.save();
    
    res.status(201).json({
      message: 'Appointment created successfully',
      data: {
        appointment
      }
    });
    
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      message: 'Server error creating appointment',
      code: 'CREATE_APPOINTMENT_ERROR'
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('date').optional().isISO8601(),
  body('startTime').optional().matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').optional().matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
  body('clientName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('clientSurname').optional().trim().notEmpty().isLength({ max: 100 }),
  body('clientEmail').optional().isEmail().normalizeEmail(),
  body('clientPhone').optional().trim().notEmpty().isLength({ max: 20 }),
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
  body('notes').optional().trim().isLength({ max: 500 })
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
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }
    
    // Check if user owns this appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    // If time is being changed, check for conflicts
    if (req.body.date || req.body.startTime || req.body.endTime) {
      const newDate = req.body.date ? new Date(req.body.date) : appointment.date;
      const newStartTime = req.body.startTime || appointment.startTime;
      const newEndTime = req.body.endTime || appointment.endTime;
      
      const hasConflict = await Appointment.checkConflict(
        req.user._id,
        newDate,
        newStartTime,
        newEndTime,
        appointment._id
      );
      
      if (hasConflict) {
        return res.status(400).json({
          message: 'Time slot conflicts with existing appointment',
          code: 'APPOINTMENT_CONFLICT'
        });
      }
      
      const isClosed = await Closure.isTimeClosed(req.user._id, newDate, newStartTime, newEndTime);
      if (isClosed) {
        return res.status(400).json({
          message: 'Time slot is closed',
          code: 'TIME_SLOT_CLOSED'
        });
      }
    }
    
    // Check if status is changing for email notifications
    const oldStatus = appointment.status;
    const newStatus = req.body.status;
    
    // Update appointment
    Object.assign(appointment, req.body);
    await appointment.save();
    await appointment.populate('user', 'firstName lastName email');

    // Send email notifications based on status change
    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === 'confirmed' && oldStatus === 'pending') {
        // Appointment approved - send confirmation to visitor with cancel link
        const cancelToken = generateActionToken(appointment._id, 'cancel');
        const cancelUrl = `${process.env.API_URL}/api/appointment-actions/cancel/${cancelToken}`;
        await sendVisitorApprovalConfirmation(appointment, appointment.user, cancelUrl);
      } else if (newStatus === 'cancelled' && oldStatus === 'pending') {
        // Appointment declined - send decline notification to visitor
        await sendVisitorDeclineNotification(appointment, appointment.user);
      } else if (newStatus === 'cancelled' && oldStatus === 'confirmed') {
        // Appointment cancelled by owner - send cancellation notification
        await sendVisitorCancellationConfirmation(appointment, appointment.user);
      }
    }
    
    res.json({
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });
    
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      message: 'Server error updating appointment',
      code: 'UPDATE_APPOINTMENT_ERROR'
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }
    
    // Check if user owns this appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await appointment.populate('user', 'firstName lastName email');
    
    // If appointment was confirmed, notify visitor about cancellation
    if (appointment.status === 'confirmed') {
      await sendVisitorCancellationConfirmation(appointment, appointment.user);
    }
    
    await Appointment.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Appointment deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      message: 'Server error deleting appointment',
      code: 'DELETE_APPOINTMENT_ERROR'
    });
  }
});

// @route   POST /api/appointments/admin/auto-cancel
// @desc    Manually trigger auto-cancellation of expired pending appointments (Admin only)
// @access  Private (Admin)
router.post('/admin/auto-cancel', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin privileges required.',
        code: 'ACCESS_DENIED'
      });
    }

    // Trigger auto-cancellation
    const result = await Appointment.cancelExpiredPendingAppointments();
    
    res.json({
      message: 'Auto-cancellation completed',
      data: {
        cancelled: result.cancelled,
        appointments: result.appointments.map(apt => ({
          id: apt._id,
          clientName: apt.clientName,
          clientSurname: apt.clientSurname,
          date: apt.date,
          startTime: apt.startTime,
          endTime: apt.endTime
        }))
      }
    });

  } catch (error) {
    console.error('Manual auto-cancel error:', error);
    res.status(500).json({
      message: 'Server error during auto-cancellation',
      code: 'AUTO_CANCEL_ERROR'
    });
  }
});

module.exports = router;

