const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: String,
  party: String
});

const ElectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startsAt: Date,
  endsAt: Date,
  candidates: [CandidateSchema],
  votes: [{ candidateId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Election', ElectionSchema);
