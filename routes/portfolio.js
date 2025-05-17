const express = require('express');
const { User, Video } = require('../models');

const router = express.Router();

// Public creator portfolio by username
router.get('/:username', async (req, res) => {
  console.log(`GET /api/portfolio/${req.params.username}`);
  try {
    const user = await User.findOne({ username: req.params.username, isPortfolioPublic: true });
    if (!user) return res.status(404).json({ message: 'Creator not found or portfolio not public' });
    const videos = await Video.find({ creatorId: user._id, isPublic: true })
      .sort({ views: -1 })
      .limit(10);
    // Featured stack journey: top 3 tags
    const tagCounts = {};
    videos.forEach(v => {
      (v.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const featuredStack = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
    res.json({
      creator: { username: user.username, id: user._id },
      topVideos: videos,
      featuredStack,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch portfolio', error: err.message });
  }
});

module.exports = router; 