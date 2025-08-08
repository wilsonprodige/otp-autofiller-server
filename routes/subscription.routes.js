const express = require('express');
const router = express.Router();
const subscriptioController = require('../controlllers/subscription.controller');
const stripeController = require('../controlllers/stripe.controller');

router.get('/plans', subscriptioController.plans);
router.post('/my-subscription', subscriptioController.mySubscription);
// router.post('/my-subscription', subscriptioController.mySubscription);
router.post('/subscribe', subscriptioController.subscribe);
router.post('/upgrade', subscriptioController.upgrade);
router.post('/cancel', subscriptioController.cancel);
//stripe
router.post('/stripe/create-checkout-session', stripeController.createCheckoutSession);
router.post('/stripe/webhook', stripeController.webhookCallbackHandler);
router.post('/stripe/customer-portal', stripeController.customerPortal);


module.exports = router;