const {status: httpStatus} = require('http-status');
const ApiResponse = require('../utils/apiResponse');
const WebPushService = require('../services/webPushService')

const subscribe = async (req, res, next) => {
    try {
      //console.log('incoming request--->',req);
        const { subscription } = req.body;
        await WebPushService.saveSubscription(req.user.id, subscription);
        return res.status(201).json({ success: true });
      } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({ error: 'Failed to save subscription' });
      }
};

module.exports = {
    subscribe
};