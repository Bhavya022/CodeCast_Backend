const express = require('express');
const { User, Video, Comment, TagStats } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  console.log('GET /api/admin/users');
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Suspend or ban user
router.put('/users/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  console.log(`PUT /api/admin/users/${req.params.id}/status`, req.body);
  try {
    const { status } = req.body; // suspended, banned
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = status;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status', error: err.message });
  }
});

// Get all videos
router.get('/videos', authenticateToken, requireRole('admin'), async (req, res) => {
  console.log('GET /api/admin/videos');
  try {
    const videos = await Video.findAll();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos', error: err.message });
  }
});

// Platform analytics: most-viewed video this week, most-used tags, top creators
router.get('/analytics', authenticateToken, requireRole('admin'), async (req, res) => {
  console.log('GET /api/admin/analytics');
  try {
    // Most-viewed video this week
    const week = new Date().toISOString().slice(0, 10);
    const topVideo = await Video.findOne({ order: [['views', 'DESC']] });
    // Most-used tags
    const tags = await TagStats.findAll({ where: { week }, order: [['viewCount', 'DESC']], limit: 5 });
    // Top creators
    const creators = await User.findAll({ where: { role: 'creator' } });
    res.json({ topVideo, tags, creators });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
});

module.exports = router; 