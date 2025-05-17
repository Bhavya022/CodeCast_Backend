const mongoose = require('mongoose');

const TagStatsSchema = new mongoose.Schema({
  tag: { type: String, required: true },
  week: { type: String, required: true }, // e.g. '2024-05-16'
  viewCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('TagStats', TagStatsSchema); 