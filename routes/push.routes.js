const express = require('express');
const router = express.Router();
const WebPushContoller = require('../controlllers/webPush.controller');
const auth = require('../middlewares/auth.middleware')

router.post('/subscribe',auth, WebPushContoller.subscribe);

module.exports = router;