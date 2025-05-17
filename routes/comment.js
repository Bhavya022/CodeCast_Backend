const express = require('express');
const Comment = require('../models/Comment');
const Video = require('../models/Video');
const { authenticateToken, requireRole } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

const BANNED_KEYWORDS = ['spam', 'scam', 'hack', 'cheat'];

// Add comment (anonymous or authenticated)
router.post('/:videoId', authenticateToken, async (req, res) => {
  console.log(`POST /api/comments/${req.params.videoId}`, req.body);
  try {
    const { content } = req.body;
    const userId = req.user ? req.user.id : null;
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) return res.status(404).json({ message: 'Video not found' });
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const isSpam = BANNED_KEYWORDS.some(word => content.toLowerCase().includes(word));
    const comment = await Comment.create({
      videoId: video._id,
      userId,
      content,
      isSpam,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
});

// List comments for a video
router.get('/:videoId', async (req, res) => {
  console.log(`GET /api/comments/${req.params.videoId}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) return res.json([]);
    const comments = await Comment.find({ videoId: req.params.videoId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
});

// Admin: mark as spam or delete
router.put('/moderate/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  console.log(`PUT /api/comments/moderate/${req.params.id}`, req.body);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Comment not found' });
    const { isSpam } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.isSpam = isSpam;
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to moderate comment', error: err.message });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  console.log(`DELETE /api/comments/${req.params.id}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Comment not found' });
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
});

// List all comments (admin moderation)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  console.log('GET /api/comments (admin)');
  try {
    const comments = await Comment.find({}).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
});

module.exports = router; 