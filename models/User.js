const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['viewer', 'creator', 'admin'], default: 'viewer' },
  isPortfolioPublic: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('User', UserSchema); 