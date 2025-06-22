const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const pushNotificationRoutes = require('./pushNotification.routes');

router.use('/auth', authRoutes);
router.use('/push-notification', pushNotificationRoutes);



module.exports = router;