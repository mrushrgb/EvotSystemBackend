const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' },
  phoneNumber: { type: String },
  address: { type: String },
  dob: { type: Date },
  gender: { type: String },
  voterId: { type: String, unique: true, sparse: true },
  isEligible: { type: Boolean, default: false },
  hasVoted: { type: Boolean, default: false },
  constituency: { type: String },
  district: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
