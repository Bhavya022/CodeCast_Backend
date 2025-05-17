const express = require('express');
const { Video } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Add quiz to video (creator only)
router.post('/:videoId', authenticateToken, requireRole('creator'), async (req, res) => {
  console.log(`POST /api/quiz/${req.params.videoId}`, req.body);
  try {
    const { quiz } = req.body; // Array of questions
    const video = await Video.findByPk(req.params.videoId);
    if (!video || video.creatorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    video.quiz = quiz;
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add quiz', error: err.message });
  }
});

// Get quiz for a video
router.get('/:videoId', async (req, res) => {
  console.log(`GET /api/quiz/${req.params.videoId}`);
  try {
    const video = await Video.findByPk(req.params.videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video.quiz || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz', error: err.message });
  }
});

module.exports = router; 