const express = require('express');
const Video = require('../models/Video');
const { authenticateToken, requireRole } = require('../middleware/auth');
const mongoose = require('mongoose');
const TagStats = require('../models/TagStats');
const OpenAI = require('openai');

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create video (creator only)
router.post('/', authenticateToken, requireRole('creator'), async (req, res) => {
  console.log('POST /api/videos', req.body);
  try {
    const { title, description, url, tags, difficulty, category, duration, codeSnippets, quiz, isPublic } = req.body;
    const video = await Video.create({
      title, description, url, tags, difficulty, category, duration, codeSnippets, quiz, isPublic,
      creatorId: req.user.id,
    });
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: 'Video upload failed', error: err.message });
  }
});

// Get all videos (with filter, search, pagination)
router.get('/', async (req, res) => {
  console.log('GET /api/videos', req.query);
  try {
    const { tag, category, difficulty, search, page = 1, limit = 10, sort = 'uploadDate' } = req.query;
    const query = {};
    if (tag) query.tags = tag;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.title = { $regex: search, $options: 'i' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const videos = await Video.find(query)
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch videos', error: err.message });
  }
});

// Get single video (and increment views)
router.get('/:id', async (req, res) => {
  console.log(`GET /api/videos/${req.params.id}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Video not found' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    video.views += 1;
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch video', error: err.message });
  }
});

// Update video (creator only)
router.put('/:id', authenticateToken, requireRole('creator'), async (req, res) => {
  console.log(`PUT /api/videos/${req.params.id}`, req.body);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Video not found' });
    const video = await Video.findById(req.params.id);
    if (!video || video.creatorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    Object.assign(video, req.body);
    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update video', error: err.message });
  }
});

// Delete video (creator only)
router.delete('/:id', authenticateToken, requireRole('creator'), async (req, res) => {
  console.log(`DELETE /api/videos/${req.params.id}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Video not found' });
    const video = await Video.findById(req.params.id);
    if (!video || video.creatorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await video.deleteOne();
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete video', error: err.message });
  }
});

// Trending tags leaderboard
router.get('/leaderboard/tags', async (req, res) => {
  console.log('GET /api/videos/leaderboard/tags', req.query);
  try {
    const { week } = req.query;
    const query = week ? { week } : {};
    const stats = await TagStats.find(query).sort({ viewCount: -1 }).limit(10);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tag leaderboard', error: err.message });
  }
});

// AI-generated summary for a video
router.get('/:id/ai-summary', async (req, res) => {
  console.log(`GET /api/videos/${req.params.id}/ai-summary`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Video not found' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const prompt = `Summarize the following video for a developer audience in 2-3 sentences.\nTitle: ${video.title}\nDescription: ${video.description}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for summarizing developer videos.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 120
    });
    const summary = completion.choices[0].message.content.trim();
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate summary', error: err.message });
  }
});

module.exports = router; 