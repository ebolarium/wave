const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, generateRefreshToken, authenticateToken } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .notEmpty()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters')
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

    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('login')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('🔐 LOGIN ATTEMPT:', { login: req.body.login, timestamp: new Date().toISOString() });
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { login, password } = req.body;
    console.log('🔍 Searching for user with login:', login);

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { username: login }
      ]
    });

    if (!user) {
      console.log('❌ User not found for login:', login);
      return res.status(401).json({
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log('✅ User found:', { 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role,
      isActive: user.isActive 
    });

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account is deactivated for user:', user.username);
      return res.status(401).json({
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    console.log('🔑 Verifying password...');
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.username);
      return res.status(401).json({
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log('✅ Password verified successfully');
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    console.log('📝 Last login updated');

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    console.log('🎫 Tokens generated');

    console.log('✅ LOGIN SUCCESSFUL for user:', user.username);
    
    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({
      message: 'Server error during login',
      code: 'LOGIN_ERROR'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      message: 'User profile retrieved successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error retrieving user profile',
      code: 'GET_USER_ERROR'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // In a more secure implementation, you might maintain a blacklist
  res.json({
    message: 'Logout successful'
  });
});

module.exports = router;
