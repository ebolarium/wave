const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/public
// @desc    Get public list of professionals (non-admin users)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' }, isActive: true })
      .select('firstName lastName username')
      .sort({ firstName: 1, lastName: 1 });

    res.json({
      message: 'Users retrieved successfully',
      data: {
        users
      }
    });

  } catch (error) {
    console.error('Get public users error:', error);
    res.status(500).json({
      message: 'Server error retrieving users',
      code: 'GET_PUBLIC_USERS_ERROR'
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error retrieving users',
      code: 'GET_USERS_ERROR'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Users can only view their own profile unless they're admin
    if (req.user._id.toString() !== req.params.id && req.user.role === 'user') {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({
      message: 'User retrieved successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error retrieving user',
      code: 'GET_USER_ERROR'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('firstName').optional().trim().isLength({ max: 50 }),
  body('lastName').optional().trim().isLength({ max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('preferences.theme').optional().isIn(['light', 'dark', 'auto'])
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

    const userId = req.params.id;
    const updates = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user._id.toString() !== userId && req.user.role === 'user') {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Remove restricted fields for non-admin users
    if (req.user.role === 'user') {
      delete updates.role;
      delete updates.isActive;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'User updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Server error updating user',
      code: 'UPDATE_USER_ERROR'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        message: 'Cannot delete your own account',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Server error deleting user',
      code: 'DELETE_USER_ERROR'
    });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate/deactivate user (admin only)
// @access  Private/Admin
router.put('/:id/activate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === userId && !isActive) {
      return res.status(400).json({
        message: 'Cannot deactivate your own account',
        code: 'CANNOT_DEACTIVATE_SELF'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      message: 'Server error updating user status',
      code: 'UPDATE_USER_STATUS_ERROR'
    });
  }
});

module.exports = router;
