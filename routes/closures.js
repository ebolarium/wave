const express = require('express');
const { body, validationResult } = require('express-validator');
const Closure = require('../models/Closure');
const Appointment = require('../models/Appointment');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/closures/public/:userId
// @desc    Get user's closures for public view (no reasons)
// @access  Public
router.get('/public/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId } = req.params;
    
    let query = { user: userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Only return minimal info for public view (no reasons)
    const closures = await Closure.find(query)
      .select('date isFullDay startTime endTime')
      .sort({ date: 1, startTime: 1 });
    
    res.json({
      message: 'Closures retrieved successfully',
      data: {
        closures
      }
    });
    
  } catch (error) {
    console.error('Get public closures error:', error);
    res.status(500).json({
      message: 'Server error retrieving closures',
      code: 'GET_CLOSURES_ERROR'
    });
  }
});

// @route   GET /api/closures
// @desc    Get user's closures (optionally filtered by date range)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { user: req.user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const closures = await Closure.find(query).sort({ date: 1, startTime: 1 });
    
    res.json({
      message: 'Closures retrieved successfully',
      data: {
        closures
      }
    });
    
  } catch (error) {
    console.error('Get closures error:', error);
    res.status(500).json({
      message: 'Server error retrieving closures',
      code: 'GET_CLOSURES_ERROR'
    });
  }
});

// @route   GET /api/closures/:id
// @desc    Get single closure
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const closure = await Closure.findById(req.params.id);
    
    if (!closure) {
      return res.status(404).json({
        message: 'Closure not found',
        code: 'CLOSURE_NOT_FOUND'
      });
    }
    
    // Check if user owns this closure
    if (closure.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    res.json({
      message: 'Closure retrieved successfully',
      data: {
        closure
      }
    });
    
  } catch (error) {
    console.error('Get closure error:', error);
    res.status(500).json({
      message: 'Server error retrieving closure',
      code: 'GET_CLOSURE_ERROR'
    });
  }
});

// @route   POST /api/closures
// @desc    Create new closure
// @access  Private
router.post('/', [
  authenticateToken,
  body('date').isISO8601().withMessage('Valid date is required'),
  body('isFullDay').isBoolean().withMessage('isFullDay must be boolean'),
  body('startTime').if(body('isFullDay').equals('false'))
    .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time required (HH:MM) for partial closure'),
  body('endTime').if(body('isFullDay').equals('false'))
    .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time required (HH:MM) for partial closure'),
  body('reason').optional().trim().isLength({ max: 200 })
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
    
    const { date, isFullDay, startTime, endTime, reason } = req.body;
    
    // Check if there are existing appointments during this closure period
    const dateObj = new Date(date);
    let conflictQuery = {
      user: req.user._id,
      date: dateObj,
      status: 'confirmed'
    };
    
    if (!isFullDay) {
      conflictQuery.startTime = { $lt: endTime };
      conflictQuery.endTime = { $gt: startTime };
    }
    
    const conflictingAppointments = await Appointment.find(conflictQuery);
    
    if (conflictingAppointments.length > 0) {
      return res.status(400).json({
        message: `Cannot close time slot. ${conflictingAppointments.length} existing appointment(s) found`,
        code: 'EXISTING_APPOINTMENTS',
        count: conflictingAppointments.length
      });
    }
    
    const closureData = {
      user: req.user._id,
      date: dateObj,
      isFullDay,
      reason
    };
    
    if (!isFullDay) {
      closureData.startTime = startTime;
      closureData.endTime = endTime;
    }
    
    const closure = new Closure(closureData);
    await closure.save();
    
    res.status(201).json({
      message: 'Closure created successfully',
      data: {
        closure
      }
    });
    
  } catch (error) {
    console.error('Create closure error:', error);
    res.status(500).json({
      message: 'Server error creating closure',
      code: 'CREATE_CLOSURE_ERROR'
    });
  }
});

// @route   PUT /api/closures/:id
// @desc    Update closure
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('date').optional().isISO8601(),
  body('isFullDay').optional().isBoolean(),
  body('startTime').optional().matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').optional().matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
  body('reason').optional().trim().isLength({ max: 200 })
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
    
    const closure = await Closure.findById(req.params.id);
    
    if (!closure) {
      return res.status(404).json({
        message: 'Closure not found',
        code: 'CLOSURE_NOT_FOUND'
      });
    }
    
    // Check if user owns this closure
    if (closure.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    // Update closure
    Object.assign(closure, req.body);
    await closure.save();
    
    res.json({
      message: 'Closure updated successfully',
      data: {
        closure
      }
    });
    
  } catch (error) {
    console.error('Update closure error:', error);
    res.status(500).json({
      message: 'Server error updating closure',
      code: 'UPDATE_CLOSURE_ERROR'
    });
  }
});

// @route   DELETE /api/closures/:id
// @desc    Delete closure
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const closure = await Closure.findById(req.params.id);
    
    if (!closure) {
      return res.status(404).json({
        message: 'Closure not found',
        code: 'CLOSURE_NOT_FOUND'
      });
    }
    
    // Check if user owns this closure
    if (closure.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    await Closure.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Closure deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete closure error:', error);
    res.status(500).json({
      message: 'Server error deleting closure',
      code: 'DELETE_CLOSURE_ERROR'
    });
  }
});

module.exports = router;

