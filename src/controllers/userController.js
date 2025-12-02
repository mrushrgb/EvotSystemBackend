const Election = require('../models/Election');
const User = require('../models/User');

exports.getElections = async (req, res) => {
  try {
    const { active } = req.query;
    const now = new Date();
    let q = {};
    if (active === 'true') {
      q = { startsAt: { $lte: now }, endsAt: { $gte: now } };
    }
    const elections = await Election.find(q);
    res.json(elections);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ msg: 'Election not found' });
    res.json(election);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.vote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ msg: 'Election not found' });

    // prevent double voting by same user
    const already = election.votes.find(v => v.userId?.toString() === req.user.id);
    if (already) return res.status(400).json({ msg: 'User already voted' });

    election.votes.push({ candidateId, userId: req.user.id });
    await election.save();
    res.json({ msg: 'Vote recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
