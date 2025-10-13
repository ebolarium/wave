const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'client/public/images/blog/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// @route   GET /api/blog
// @desc    Get all published blog posts
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = { status: 'published' };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      message: 'Blog posts retrieved successfully',
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      message: 'Server error retrieving blog posts',
      code: 'GET_BLOGS_ERROR'
    });
  }
});

// @route   GET /api/blog/draft
// @desc    Get draft blog posts (author only)
// @access  Private
router.get('/draft', authenticateToken, async (req, res) => {
  try {
    const blogs = await Blog.find({
      author: req.user._id,
      status: 'draft'
    })
      .populate('author', 'username firstName lastName avatar')
      .sort({ updatedAt: -1 });

    res.json({
      message: 'Draft posts retrieved successfully',
      blogs
    });

  } catch (error) {
    console.error('Get drafts error:', error);
    res.status(500).json({
      message: 'Server error retrieving draft posts',
      code: 'GET_DRAFTS_ERROR'
    });
  }
});

// @route   GET /api/blog/:slug
// @desc    Get blog post by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug,
      status: 'published'
    }).populate('author', 'username firstName lastName avatar bio');

    if (!blog) {
      return res.status(404).json({
        message: 'Blog post not found',
        code: 'BLOG_NOT_FOUND'
      });
    }

    // Increment view count
    await blog.incrementViews();

    res.json({
      message: 'Blog post retrieved successfully',
      blog
    });

  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      message: 'Server error retrieving blog post',
      code: 'GET_BLOG_ERROR'
    });
  }
});

// @route   POST /api/blog/upload-image
// @desc    Upload blog image
// @access  Private
router.post('/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided',
        code: 'NO_IMAGE_FILE'
      });
    }

    const imageUrl = `/images/blog/${req.file.filename}`;

    res.json({
      message: 'Image uploaded successfully',
      imageUrl
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      message: error.message || 'Server error uploading image',
      code: 'UPLOAD_IMAGE_ERROR'
    });
  }
});

// @route   POST /api/blog
// @desc    Create new blog post
// @access  Private
router.post('/', [
  authenticateToken,
  body('title')
    .notEmpty()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters'),
  body('excerpt')
    .notEmpty()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt is required and cannot exceed 300 characters'),
  body('content')
    .notEmpty()
    .isLength({ min: 100 })
    .withMessage('Content is required and must be at least 100 characters'),
  body('category')
    .isIn(['Technology', 'Design', 'Trends', 'Innovation', 'Tutorial', 'News'])
    .withMessage('Invalid category'),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published'])
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

    const blogData = {
      ...req.body,
      author: req.user._id,
      publishedAt: req.body.status === 'published' ? new Date() : null
    };

    const blog = new Blog(blogData);
    await blog.save();

    await blog.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Blog post created successfully',
      blog
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      message: 'Server error creating blog post',
      code: 'CREATE_BLOG_ERROR'
    });
  }
});

// @route   PUT /api/blog/:id
// @desc    Update blog post
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('title').optional().trim().isLength({ max: 200 }),
  body('excerpt').optional().trim().isLength({ max: 300 }),
  body('content').optional().isLength({ min: 100 }),
  body('category').optional().isIn(['Technology', 'Design', 'Trends', 'Innovation', 'Tutorial', 'News']),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published'])
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

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: 'Blog post not found',
        code: 'BLOG_NOT_FOUND'
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const updates = req.body;

    // Set publishedAt if status is being changed to published
    if (updates.status === 'published' && blog.status !== 'published') {
      updates.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Blog post updated successfully',
      blog: updatedBlog
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      message: 'Server error updating blog post',
      code: 'UPDATE_BLOG_ERROR'
    });
  }
});

// @route   DELETE /api/blog/:id
// @desc    Delete blog post
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: 'Blog post not found',
        code: 'BLOG_NOT_FOUND'
      });
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      message: 'Server error deleting blog post',
      code: 'DELETE_BLOG_ERROR'
    });
  }
});

// @route   POST /api/blog/:id/like
// @desc    Toggle like on blog post
// @access  Private
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: 'Blog post not found',
        code: 'BLOG_NOT_FOUND'
      });
    }

    await blog.toggleLike(req.user._id);

    res.json({
      message: 'Like toggled successfully',
      likeCount: blog.likeCount
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      message: 'Server error toggling like',
      code: 'TOGGLE_LIKE_ERROR'
    });
  }
});

module.exports = router;
