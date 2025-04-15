const express = require('express');
const auth = require('../middleware/auth.middleware');
const { getAllUsers, createUser, login } = require('../controllers/user.controller');
const router = express.Router();

//


module.exports = router;