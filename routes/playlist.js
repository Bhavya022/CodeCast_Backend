const express = require('express');
const Playlist = require('../models/Playlist');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Create playlist
router.post('/', authenticateToken, async (req, res) => {
  console.log('POST /api/playlists', req.body);
  try {
    const { name } = req.body;
    const playlist = await Playlist.create({ userId: req.user.id, name });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create playlist', error: err.message });
  }
});

// Get all playlists for user
router.get('/', authenticateToken, async (req, res) => {
  console.log('GET /api/playlists');
  try {
    const playlists = await Playlist.find({ userId: req.user.id });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch playlists', error: err.message });
  }
});

// Add video to playlist
router.post('/:id/add', authenticateToken, async (req, res) => {
  console.log(`POST /api/playlists/${req.params.id}/add`, req.body);
  try {
    const { videoId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(videoId)) return res.status(404).json({ message: 'Not found' });
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist || playlist.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (!playlist.videos.includes(videoId)) playlist.videos.push(videoId);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add video', error: err.message });
  }
});

// Remove video from playlist
router.post('/:id/remove', authenticateToken, async (req, res) => {
  console.log(`POST /api/playlists/${req.params.id}/remove`, req.body);
  try {
    const { videoId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(videoId)) return res.status(404).json({ message: 'Not found' });
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist || playlist.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove video', error: err.message });
  }
});

// Delete playlist
router.delete('/:id', authenticateToken, async (req, res) => {
  console.log(`DELETE /api/playlists/${req.params.id}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Not found' });
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist || playlist.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await playlist.deleteOne();
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete playlist', error: err.message });
  }
});

module.exports = router; 