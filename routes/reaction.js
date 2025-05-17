const express = require('express');
const Reaction = require('../models/Reaction');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Add or update reaction
router.post('/:videoId', authenticateToken, async (req, res) => {
  console.log(`POST /api/reactions/${req.params.videoId}`, req.body);
  try {
    const { type } = req.body; // like, dislike, emoji
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) return res.status(404).json({ message: 'Video not found' });
    let reaction = await Reaction.findOne({ videoId: req.params.videoId, userId: req.user.id });
    if (reaction) {
      reaction.type = type;
      await reaction.save();
    } else {
      reaction = await Reaction.create({ videoId: req.params.videoId, userId: req.user.id, type });
    }
    res.json(reaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to react', error: err.message });
  }
});

// Get reactions for a video
router.get('/:videoId', async (req, res) => {
  console.log(`GET /api/reactions/${req.params.videoId}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) return res.json([]);
    const reactions = await Reaction.find({ videoId: req.params.videoId });
    res.json(reactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reactions', error: err.message });
  }
});

module.exports = router; 