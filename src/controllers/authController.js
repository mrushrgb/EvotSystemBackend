const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { name, email, password, phoneNumber, address, dob, gender, constituency, adminSecretKey } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

  // allow role in payload but normalize unknown/legacy values (e.g., 'voter') to 'user'
  const requestedRole = (req.body.role || '').toString().toLowerCase();
  
  // Validate admin secret key if trying to register as admin
  if (requestedRole === 'admin') {
    const correctAdminKey = process.env.ADMIN_SECRET_KEY;
    if (!correctAdminKey) {
      return res.status(500).json({ msg: 'Admin registration is not configured' });
    }
    if (!adminSecretKey || adminSecretKey !== correctAdminKey) {
      return res.status(403).json({ msg: 'Invalid admin secret key. Admin registration denied.' });
    }
  }
  
  const role = requestedRole === 'admin' ? 'admin' : 'user';

  // compute eligibility (simple age check >= 18) if dob provided
  let isEligible = false;
  if (dob) {
    const dobDate = new Date(dob);
    const ageMs = Date.now() - dobDate.getTime();
    const age = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25));
    isEligible = age >= 18;
  }

  // generate a simple voterId if not admin
  const voterId = role === 'admin' ? undefined : `VTR${Math.floor(100000 + Math.random() * 900000)}`;

  user = new User({
    name,
    email,
    password: hashed,
    role,
    phoneNumber,
    address,
    dob: dob ? new Date(dob) : undefined,
    gender,
    constituency,
    voterId,
    isEligible
  });
    await user.save();

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined!');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const expiresIn = process.env.JWT_EXPIRY || '7d';
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    // return token and user info (omit password)
    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      voterId: user.voterId,
      isEligible: user.isEligible,
      constituency: user.constituency,
      hasVoted: user.hasVoted,
      createdAt: user.createdAt
    };
    res.json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password, adminSecretKey } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Verify admin secret key if user is admin
    if (user.role === 'admin') {
      const correctAdminKey = process.env.ADMIN_SECRET_KEY;
      if (!correctAdminKey) {
        return res.status(500).json({ msg: 'Admin login is not configured' });
      }
      if (!adminSecretKey || adminSecretKey !== correctAdminKey) {
        return res.status(403).json({ msg: 'Invalid admin secret key. Admin login denied.' });
      }
    }

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined!');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const expiresIn = process.env.JWT_EXPIRY || '7d';
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      voterId: user.voterId,
      isEligible: user.isEligible,
      constituency: user.constituency,
      hasVoted: user.hasVoted,
      createdAt: user.createdAt
    };
    res.json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
