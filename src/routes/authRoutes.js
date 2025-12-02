const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/register', [
	check('name', 'Name is required').notEmpty(),
	check('email', 'Please include a valid email').isEmail(),
	check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], validate, register);

router.post('/login', [
	check('email', 'Please include a valid email').isEmail(),
	check('password', 'Password is required').exists()
], validate, login);

module.exports = router;
