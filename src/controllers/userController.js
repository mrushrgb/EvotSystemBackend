const Election = require('../models/Election');
const User = require('../models/User');

exports.getElections = async (req, res) => {
  try {
    const { active } = req.query;
    let q = {};
    if (active === 'true') {
      // Only show elections with status 'active'
      q = { status: 'active' };
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

    // Check if election is active
    if (election.status !== 'active') {
      return res.status(400).json({ msg: 'This election is not currently active for voting' });
    }

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
