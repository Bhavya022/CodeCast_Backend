const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'dislike', 'emoji'], required: true },
}, { timestamps: false });

module.exports = mongoose.model('Reaction', ReactionSchema); 