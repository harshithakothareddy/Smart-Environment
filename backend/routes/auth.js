const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const {
  hashPassword,
  verifyPassword,
  signToken,
  authMiddleware,
} = require('../utils/auth');

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

function getClientMeta(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : (req.ip || req.socket?.remoteAddress || 'unknown');
  const userAgent = (req.headers['user-agent'] || 'unknown').slice(0, 200);
  return { timestamp: new Date(), ip, userAgent };
}

function recordLoginEvent(user, req) {
  const event = getClientMeta(req);
  user.loginCount = (user.loginCount || 0) + 1;
  user.lastLoginAt = event.timestamp;
  user.loginHistory = [...(user.loginHistory || []), event].slice(-20);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database is currently unavailable. Please try again shortly.',
      });
    }

    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (name.length < 2) {
      return res.status(400).json({ success: false, error: 'Full name must be at least 2 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      });
    }

    const loginEvent = getClientMeta(req);
    const user = await User.create({
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'Citizen',
      loginCount: 1,
      lastLoginAt: loginEvent.timestamp,
      loginHistory: [loginEvent],
    });

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database is currently unavailable. Please try again shortly.',
      });
    }

    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    recordLoginEvent(user, req);
    await user.save();

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });

    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Sign in failed. Please try again.' });
  }
});

// POST /api/auth/demo - Persists demo citizen login in MongoDB
router.post('/demo', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database is currently unavailable. Please try again shortly.',
      });
    }

    const demoEmail = 'citizen@econexus.in';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const loginEvent = getClientMeta(req);
      user = await User.create({
        name: 'Citizen Steward',
        email: demoEmail,
        passwordHash: hashPassword('econexus-demo-123'),
        role: 'Citizen',
        loginCount: 1,
        lastLoginAt: loginEvent.timestamp,
        loginHistory: [loginEvent],
      });
    } else {
      recordLoginEvent(user, req);
      await user.save();
    }

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });

    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, error: 'Demo login failed. Please try again.' });
  }
});

// GET /api/auth/me - Fetch authenticated user profile & login details
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database unavailable.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ success: false, error: 'Failed to load profile.' });
  }
});

// PATCH /api/auth/profile - Update user profile, saved locations, and notification preferences
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database unavailable.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    if (typeof req.body.name === 'string' && req.body.name.trim().length >= 2) {
      user.name = req.body.name.trim();
    }
    if (typeof req.body.phone === 'string') {
      user.phone = req.body.phone.trim();
    }
    if (Array.isArray(req.body.savedLocations)) {
      user.savedLocations = req.body.savedLocations;
    }
    if (req.body.notificationPreferences && typeof req.body.notificationPreferences === 'object') {
      user.notificationPreferences = {
        ...user.notificationPreferences?.toObject?.(),
        ...user.notificationPreferences,
        ...req.body.notificationPreferences,
      };
    }

    await user.save();

    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, error: 'Database unavailable.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Current password and a new password (at least 6 characters) are required.',
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    user.passwordHash = hashPassword(newPassword);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, error: 'Failed to update password.' });
  }
});

module.exports = router;

