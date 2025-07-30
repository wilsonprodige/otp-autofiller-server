const express = require('express');
const router = express.Router();
const subscriptioController = require('../controlllers/subscription.controller');

router.get('/plans', subscriptioController.plans);
router.post('/my-subscription', subscriptioController.mySubscription);
// router.post('/my-subscription', subscriptioController.mySubscription);
router.post('/subscribe', subscriptioController.subscribe);
router.post('/upgrade', subscriptioController.upgrade);
router.post('/cancel', subscriptioController.cancel);

module.exports = router;