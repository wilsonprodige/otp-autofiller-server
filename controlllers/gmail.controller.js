const {status: httpStatus} = require('http-status');
const ApiResponse = require('../utils/apiResponse');
const { User } = require('../models');
const WebPushService = require('../services/webPushService');


const pushNotificationCallback = async (req, res, next) => {
  try {
    // Verify Google Pub/Sub message
    if (!req.body.message || !req.body.message.data) {
      return res.status(400).send('Bad Request');
    }

    const message = Buffer.from(req.body.message.data, 'base64').toString();
    const pushData = JSON.parse(message);
    //console.log('---push data--->', pushData);

    // Get user ID from email (implement according to your DB structure)
    const user = await User.findOne({ where: { email: pushData.emailAddress } });
    if (!user) return res.status(200).send('OK');

    // Send notification to user's devices
    await WebPushService.sendNotification(user.id, {
      title: 'New OTP Email',
      body: 'You have received a new OTP code',
      data: { 
        type: 'gmail-update',
        historyId: pushData.historyId
      }
    });

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Push handler error:', error);
    return res.status(500).send('Internal Server Error');
  }
};



module.exports = {
    pushNotificationCallback
};