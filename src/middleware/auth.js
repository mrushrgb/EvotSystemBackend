const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined in environment variables!');
      return res.status(500).json({ msg: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  next();
};
