const express = require('express');
const WatchParty = require('../models/WatchParty');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Create a watch party
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(videoId)) return res.status(404).json({ message: 'Video not found' });
    const party = await WatchParty.create({
      videoId,
      hostId: req.user.id,
      participants: [req.user.id],
    });
    res.status(201).json(party);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create watch party', error: err.message });
  }
});

// Join a watch party
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Party not found' });
    const party = await WatchParty.findById(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    if (!party.participants.includes(req.user.id)) party.participants.push(req.user.id);
    await party.save();
    res.json(party);
  } catch (err) {
    res.status(500).json({ message: 'Failed to join watch party', error: err.message });
  }
});

// List all watch parties (for admin or debug)
router.get('/', async (req, res) => {
  try {
    const parties = await WatchParty.find({});
    res.json(parties);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch watch parties', error: err.message });
  }
});

module.exports = router; 