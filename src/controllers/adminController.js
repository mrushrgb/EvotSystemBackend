const Election = require('../models/Election');

exports.createElection = async (req, res) => {
  try {
    const election = new Election({ ...req.body, createdBy: req.user.id });
    await election.save();
    res.json(election);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!election) return res.status(404).json({ msg: 'Not found' });
    res.json(election);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteElection = async (req, res) => {
  try {
    await Election.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.listElections = async (req, res) => {
  try {
    const elections = await Election.find().populate('createdBy', 'name email');
    res.json(elections);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('createdBy', 'name email');
    if (!election) return res.status(404).json({ msg: 'Not found' });
    res.json(election);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ msg: 'Not found' });

    // tally votes per candidate
    const counts = {};
    election.candidates.forEach(c => { counts[c._id] = 0; });
    election.votes.forEach(v => {
      const id = v.candidateId?.toString();
      if (id && counts.hasOwnProperty(id)) counts[id]++;
    });

    const results = election.candidates.map(c => ({
      candidateId: c._id,
      name: c.name,
      party: c.party,
      votes: counts[c._id]
    }));

    res.json({ electionId: election._id, title: election.title, results });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const User = require('../models/User');
exports.promoteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// GET /api/admin/stats - aggregate stats for admin dashboard
exports.stats = async (req, res) => {
  try {
    const totalElections = await Election.countDocuments();
    const now = new Date();
    const activeElections = await Election.countDocuments({ startsAt: { $lte: now }, endsAt: { $gte: now } });
    const totalVoters = await User.countDocuments();

    // sum votes across elections
    const elections = await Election.find({}, 'votes');
    let totalVotes = 0;
    elections.forEach(e => { if (Array.isArray(e.votes)) totalVotes += e.votes.length; });

    // placeholder values for features not modeled yet
    const pendingDisputes = 0;
    const systemAlerts = 0;

    res.json({ totalElections, activeElections, totalVoters, totalVotes, pendingDisputes, systemAlerts });
  } catch (err) {
    console.error('admin stats error', err);
    res.status(500).send('Server error');
  }
};

// GET /api/admin/stats - aggregated dashboard stats for admin
exports.stats = async (req, res) => {
  try {
    const now = new Date();
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    const elections = await Election.find();

    // total votes across all elections
    let totalVotes = 0;
    elections.forEach(e => { if (Array.isArray(e.votes)) totalVotes += e.votes.length; });

    const totalVoters = await User.countDocuments();

    // pendingDisputes and systemAlerts are implementation-specific; return 0 as placeholders
    const pendingDisputes = 0;
    const systemAlerts = 0;

    res.json({ totalElections, activeElections, totalVoters, totalVotes, pendingDisputes, systemAlerts });
  } catch (err) {
    console.error('admin stats error', err);
    res.status(500).send('Server error');
  }
};

// GET /api/admin/turnout/:electionId - get real-time turnout data for an election
exports.getTurnout = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) return res.status(404).json({ msg: 'Election not found' });

    const totalVoters = await User.countDocuments();
    const votedCount = election.votes ? election.votes.length : 0;
    const percentage = totalVoters > 0 ? ((votedCount / totalVoters) * 100).toFixed(1) : 0;

    // Calculate votes per candidate
    const candidateVotes = {};
    election.candidates.forEach(c => {
      candidateVotes[c._id.toString()] = 0;
    });
    
    if (election.votes) {
      election.votes.forEach(v => {
        const cId = v.candidateId?.toString();
        if (cId && candidateVotes.hasOwnProperty(cId)) {
          candidateVotes[cId]++;
        }
      });
    }

    const candidateResults = election.candidates.map(c => ({
      id: c._id,
      name: c.name,
      party: c.party,
      votes: candidateVotes[c._id.toString()] || 0,
      percentage: votedCount > 0 ? ((candidateVotes[c._id.toString()] || 0) / votedCount * 100).toFixed(1) : 0
    }));

    // Calculate district distribution
    const districtVotes = {};
    if (election.votes) {
      election.votes.forEach(v => {
        const district = v.district || 'Unknown';
        if (!districtVotes[district]) {
          districtVotes[district] = { district, votes: 0, candidates: {} };
        }
        districtVotes[district].votes++;
        
        const cId = v.candidateId?.toString();
        if (cId) {
          if (!districtVotes[district].candidates[cId]) {
            districtVotes[district].candidates[cId] = 0;
          }
          districtVotes[district].candidates[cId]++;
        }
      });
    }

    // Format district distribution with candidate breakdown
    const districtDistribution = Object.values(districtVotes).map(d => {
      const candidateBreakdown = election.candidates.map(c => ({
        name: c.name,
        party: c.party,
        votes: d.candidates[c._id.toString()] || 0
      }));
      return {
        district: d.district,
        totalVotes: d.votes,
        percentage: votedCount > 0 ? ((d.votes / votedCount) * 100).toFixed(1) : 0,
        candidates: candidateBreakdown
      };
    }).sort((a, b) => b.totalVotes - a.totalVotes);

    res.json({
      electionId: election._id,
      title: election.title,
      status: election.status,
      overall: {
        totalVoters,
        votedCount,
        percentage: parseFloat(percentage)
      },
      candidates: candidateResults,
      districtDistribution,
      lastUpdated: new Date()
    });
  } catch (err) {
    console.error('turnout error', err);
    res.status(500).send('Server error');
  }
};

// DELETE /api/admin/elections/:electionId/votes/:userId - Remove a user's vote (for testing)
exports.removeUserVote = async (req, res) => {
  try {
    const { electionId, userId } = req.params;
    const election = await Election.findById(electionId);
    
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    // Remove user's vote from the election
    const beforeCount = election.votes.length;
    election.votes = election.votes.filter(v => v.userId?.toString() !== userId);
    await election.save();

    res.json({ 
      msg: 'Vote removed successfully', 
      removedVotes: beforeCount - election.votes.length,
      remainingVotes: election.votes.length 
    });
  } catch (err) {
    console.error('remove vote error', err);
    res.status(500).send('Server error');
  }
};

// DELETE /api/admin/elections/:electionId/clear-votes - Clear all votes from election (for testing)
exports.clearAllVotes = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    
    if (!election) {
      return res.status(404).json({ msg: 'Election not found' });
    }

    const previousCount = election.votes.length;
    election.votes = [];
    await election.save();

    res.json({ msg: 'All votes cleared successfully', previousCount, currentCount: 0 });
  } catch (err) {
    console.error('clear votes error', err);
    res.status(500).send('Server error');
  }
};
