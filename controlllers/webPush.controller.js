const {status: httpStatus} = require('http-status');
const ApiResponse = require('../utils/apiResponse');
const WebPushService = require('../services/webPushService')

const subscribe = async (req, res, next) => {
    try {
        const { subscription } = req.body;
        await WebPushService.saveSubscription(req.user.id, subscription);
        res.status(201).json({ success: true });
      } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ error: 'Failed to save subscription' });
      }
};

module.exports = {
    subscribe
};