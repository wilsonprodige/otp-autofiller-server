require('dotenv').config();
const webpush= require('web-push');
const { WebPushSubscription } = require('../models');

webpush.setVapidDetails(
    process.env.VAPID_MAIL_TO,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

class WebPushService {
    static async saveSubscription(userId, subscription) {
        return WebPushSubscription.upsert({
          userId,
          endpoint: subscription.endpoint,
          keys: JSON.stringify(subscription.keys)
        });
    }

    static async sendNotification(userId, payload) {
        const subscriptions = await WebPushSubscription.findAll({ where: { userId } });
        //console.log('---subscriptions-->', subscriptions);
        const results = await Promise.allSettled(
          subscriptions.map(sub => {
            const subscription = {
              endpoint: sub.endpoint,
              keys: JSON.parse(sub.keys)
            };
            return webpush.sendNotification(subscription, JSON.stringify(payload))
              .catch(err => {
                // Remove invalid subscriptions
                if (err.statusCode === 410) {
                  return sub.destroy();
                }
                throw err;
              });
          })
        );
    
        return results;
      }
}

module.exports = WebPushService;