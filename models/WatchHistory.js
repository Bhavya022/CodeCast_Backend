const mongoose = require('mongoose');

const WatchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  watchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WatchHistory', WatchHistorySchema); 