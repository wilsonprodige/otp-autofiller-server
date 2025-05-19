const express = require('express');
const router = express.Router();
const authController = require('../controlllers/auth.controller');

router.post('/login', authController.login);
router.post('/google', authController.googleAuth);

module.exports = router;