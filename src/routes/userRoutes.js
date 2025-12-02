const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getElections, getElectionById, vote, getProfile } = require('../controllers/userController');

router.get('/elections', protect, getElections);
router.get('/elections/:id', protect, getElectionById);
router.post('/vote', protect, vote);
router.get('/me', protect, getProfile);

module.exports = router;
