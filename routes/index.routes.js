const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const pushNotificationRoutes = require('./pushNotification.routes');
const subscriptionRoutes = require('./subscription.routes');

router.use('/auth', authRoutes);
router.use('/push-notification', pushNotificationRoutes);
router.use('/billing',subscriptionRoutes);



module.exports = router;