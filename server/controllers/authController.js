import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail.js';
import logger from '../utils/logger.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      ipAddress,
      userAgent,
      accountStatus: 'pending', // Will be activated after email verification
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Generate JWT tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Send verification email (in development, this will log to console)
    try {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
      
      const emailMessage = `
        Welcome to TradePro Trading Platform!
        
        Please verify your email address by clicking the link below:
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        TradePro Team
      `;

      await sendEmail({
        email: user.email,
        subject: 'Email Verification - TradePro Trading Platform',
        message: emailMessage,
      });

      logger.info(`Verification email sent to ${user.email}`);
    } catch (error) {
      logger.error('Email sending failed:', error.message);
      // Don't fail registration if email fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        tradingLevel: user.tradingLevel,
      },
      message: 'Registration successful! Please check your email for verification link.',
    });

    logger.info(`New user registered: ${user.email}`);
  } catch (error) {
    logger.error('Registration error:', error.message);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.',
      });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account suspended. Please contact support.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      logger.warn(`Failed login attempt for ${email} from ${ipAddress}`);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
      });
    }

    // Update last login info
    user.lastLogin = Date.now();
    user.ipAddress = ipAddress;
    user.userAgent = userAgent;
    
    // Activate account on first successful login if email not verified
    if (user.accountStatus === 'pending') {
      user.accountStatus = 'active';
    }
    
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        tradingLevel: user.tradingLevel,
        twoFactorEnabled: user.twoFactorEnabled,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
      },
      message: 'Login successful',
    });

    logger.info(`User logged in: ${user.email} from ${ipAddress}`);
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        tradingLevel: user.tradingLevel,
        twoFactorEnabled: user.twoFactorEnabled,
        preferences: user.preferences,
        kycStatus: user.kycStatus,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    user.isEmailVerified = true;
    user.accountStatus = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Your account is now active.',
    });
  } catch (error) {
    logger.error('Email verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      const emailMessage = `
        You requested a password reset for your TradePro account.
        
        Click the link below to reset your password:
        ${resetUrl}
        
        This link will expire in 10 minutes.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        TradePro Team
      `;

      await sendEmail({
        email: user.email,
        subject: 'Password Reset - TradePro Trading Platform',
        message: emailMessage,
      });

      logger.info(`Password reset email sent to ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error('Password reset email failed:', error.message);

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.',
      });
    }
  } catch (error) {
    logger.error('Forgot password error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password',
      });
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    logger.info(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      token,
      message: 'Password reset successful',
    });
  } catch (error) {
    logger.error('Password reset error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Password change failed',
    });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (preferences) updateData.preferences = preferences;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        preferences: user.preferences,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Profile update failed',
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Refresh token error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

export { 
  register, 
  login, 
  getProfile, 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  updateProfile, 
  refreshToken 
};