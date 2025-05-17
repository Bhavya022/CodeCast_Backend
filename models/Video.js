const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  tags: { type: [String], default: [] },
  difficulty: { type: String, required: true },
  category: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  duration: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  codeSnippets: { type: [Object], default: [] }, // [{timestamp, code, language}]
  quiz: { type: [Object], default: [] },
  isPublic: { type: Boolean, default: true },
}, { timestamps: false });

module.exports = mongoose.model('Video', VideoSchema); 