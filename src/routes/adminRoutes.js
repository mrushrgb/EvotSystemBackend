const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { createElection, updateElection, deleteElection, listElections, getElection, getResults, promoteUser, stats, getTurnout } = require('../controllers/adminController');

router.use(protect, adminOnly);

router.post('/elections', createElection);
router.get('/stats', stats);
router.get('/elections', listElections);
router.put('/elections/:id', updateElection);
router.delete('/elections/:id', deleteElection);
router.get('/elections/:id', getElection);
router.get('/elections/:id/results', getResults);
router.get('/turnout/:electionId', getTurnout);

// promote a user to admin
router.post('/users/:id/promote', promoteUser);

module.exports = router;
