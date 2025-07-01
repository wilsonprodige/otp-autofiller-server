const express = require('express');
const router = express.Router();
const gmailController = require('../controlllers/gmail.controller.js');
const WebPushContoller = require('../controlllers/webPush.controller');

const {auth} = require('../middlewares/auth.middleware')

router.post('/subscribe',auth, WebPushContoller.subscribe);
//auth

router.post('/gmail', gmailController.pushNotificationCallback);

module.exports = router;