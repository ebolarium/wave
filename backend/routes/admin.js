const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Calendar = require('../models/Calendar');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalEvents,
      upcomingEvents,
      recentUsers,
      recentBlogs,
      recentEvents
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Calendar.countDocuments(),
      Calendar.countDocuments({ 
        startDate: { $gte: new Date() },
        status: 'scheduled'
      }),
      User.find().sort({ createdAt: -1 }).limit(5).select('-password'),
      Blog.find().sort({ createdAt: -1 }).limit(5).populate('author', 'username firstName lastName'),
      Calendar.find().sort({ createdAt: -1 }).limit(5).populate('organizer', 'username firstName lastName')
    ]);

    res.json({
      message: 'Admin statistics retrieved successfully',
      data: {
        stats: {
          users: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers
          },
          blogs: {
            total: totalBlogs,
            published: publishedBlogs,
            draft: draftBlogs
          },
          events: {
            total: totalEvents,
            upcoming: upcomingEvents
          }
        },
        recent: {
          users: recentUsers,
          blogs: recentBlogs,
          events: recentEvents
        }
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving admin statistics',
      code: 'GET_ADMIN_STATS_ERROR'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with admin controls
// @access  Private/Admin
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;
    const status = req.query.status;

    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status
    if (status) {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

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
    console.error('Get admin users error:', error);
    res.status(500).json({
      message: 'Server error retrieving users',
      code: 'GET_ADMIN_USERS_ERROR'
    });
  }
});

// @route   GET /api/admin/blogs
// @desc    Get all blogs with admin controls
// @access  Private/Admin
router.get('/blogs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      message: 'Blogs retrieved successfully',
      data: {
        blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({
      message: 'Server error retrieving blogs',
      code: 'GET_ADMIN_BLOGS_ERROR'
    });
  }
});

// @route   GET /api/admin/events
// @desc    Get all events with admin controls
// @access  Private/Admin
router.get('/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const events = await Calendar.find(query)
      .populate('organizer', 'username firstName lastName email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Calendar.countDocuments(query);

    res.json({
      message: 'Events retrieved successfully',
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get admin events error:', error);
    res.status(500).json({
      message: 'Server error retrieving events',
      code: 'GET_ADMIN_EVENTS_ERROR'
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put('/users/:id/role', [
  authenticateToken,
  requireAdmin,
  body('role').isIn(['user', 'admin']).withMessage('Invalid role')
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

    const { role } = req.body;
    const userId = req.params.id;

    // Prevent changing own role
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        message: 'Cannot change your own role',
        code: 'CANNOT_CHANGE_OWN_ROLE'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      message: 'User role updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      message: 'Server error updating user role',
      code: 'UPDATE_USER_ROLE_ERROR'
    });
  }
});

// @route   PUT /api/admin/blogs/:id/status
// @desc    Update blog status (admin only)
// @access  Private/Admin
router.put('/blogs/:id/status', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
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

    const { status } = req.body;
    const blogId = req.params.id;

    const updates = { status };
    
    // Set publishedAt if status is being changed to published
    if (status === 'published') {
      updates.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      updates,
      { new: true }
    ).populate('author', 'username firstName lastName');

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found',
        code: 'BLOG_NOT_FOUND'
      });
    }

    res.json({
      message: 'Blog status updated successfully',
      data: {
        blog
      }
    });

  } catch (error) {
    console.error('Update blog status error:', error);
    res.status(500).json({
      message: 'Server error updating blog status',
      code: 'UPDATE_BLOG_STATUS_ERROR'
    });
  }
});

// @route   PUT /api/admin/events/:id/status
// @desc    Update event status (admin only)
// @access  Private/Admin
router.put('/events/:id/status', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed']).withMessage('Invalid status')
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

    const { status } = req.body;
    const eventId = req.params.id;

    const event = await Calendar.findByIdAndUpdate(
      eventId,
      { status },
      { new: true }
    ).populate('organizer', 'username firstName lastName');

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    res.json({
      message: 'Event status updated successfully',
      data: {
        event
      }
    });

  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({
      message: 'Server error updating event status',
      code: 'UPDATE_EVENT_STATUS_ERROR'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
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

module.exports = router;
