#!/usr/bin/env node
/* Seed sample data: voters, an election with candidates, and some votes
   Usage: node scripts/seedData.js
*/
const connectDB = require('../src/config/db');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Election = require('../src/models/Election');

const run = async () => {
  try {
    await connectDB();

    // Create two voter users
    const voters = [
      { name: 'Voter One', email: 'voter1@example.com', password: 'Voter@123' },
      { name: 'Voter Two', email: 'voter2@example.com', password: 'Voter@123' }
    ];

    const createdVoters = [];
    for (const v of voters) {
      let user = await User.findOne({ email: v.email });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(v.password, salt);
        user = new User({ name: v.name, email: v.email.toLowerCase(), password: hash, role: 'user' });
        await user.save();
        console.log('Created user', v.email);
      } else {
        console.log('User already exists', v.email);
      }
      createdVoters.push(user || (await User.findOne({ email: v.email })));
    }

    // Find or create an admin to be the creator
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Admin@123', salt);
      admin = new User({ name: 'Administrator', email: 'admin@example.com', password: hash, role: 'admin' });
      await admin.save();
      console.log('Created admin admin@example.com');
    }

    // Create an election if not present
    const title = 'Presidential Election 2025';
    let election = await Election.findOne({ title });
    if (!election) {
      const now = new Date();
      const startsAt = new Date(now.getTime() - 24 * 60 * 60 * 1000); // started yesterday
      const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // ends in 7 days

      const candidates = [
        { name: 'Alice Johnson', party: 'Blue Party' },
        { name: 'Bob Smith', party: 'Green Party' },
        { name: 'Carlos Reyes', party: 'Independent' }
      ];

      election = new Election({
        title,
        description: 'National election for the next term',
        startsAt,
        endsAt,
        candidates,
        votes: [],
        createdBy: admin._id
      });

      await election.save();
      console.log('Created election:', title);
    } else {
      console.log('Election already exists:', title);
    }

    // Add sample votes by our voters if none exist
    if (!election.votes || election.votes.length === 0) {
      // vote for first candidate by voter1, second candidate by voter2
      const c0 = election.candidates[0]._id;
      const c1 = election.candidates[1]._id;

      election.votes.push({ candidateId: c0, userId: createdVoters[0]._id });
      election.votes.push({ candidateId: c1, userId: createdVoters[1]._id });
      await election.save();
      console.log('Added sample votes to election');
    } else {
      console.log('Election already has votes, skipping vote seeding');
    }

    console.log('\nSeeding complete.');
    console.log('Voter accounts: voter1@example.com / Voter@123, voter2@example.com / Voter@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed data error', err);
    process.exit(1);
  }
};

run();
