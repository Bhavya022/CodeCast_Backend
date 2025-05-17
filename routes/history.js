const express = require('express');
const WatchHistory = require('../models/WatchHistory');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');
const Video = require('../models/Video');

const router = express.Router();

// Add to watch history
router.post('/:videoId', authenticateToken, async (req, res) => {
  console.log(`POST /api/history/${req.params.videoId}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) return res.status(404).json({ message: 'Video not found' });
    const entry = await WatchHistory.create({
      userId: req.user.id,
      videoId: req.params.videoId,
      watchedAt: new Date()
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to history', error: err.message });
  }
});

// Get user's watch history
router.get('/', authenticateToken, async (req, res) => {
  console.log('GET /api/history');
  try {
    const history = await WatchHistory.find({ userId: req.user.id })
      .sort({ watchedAt: -1 })
      .limit(20)
      .populate('videoId');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
});

module.exports = router; 