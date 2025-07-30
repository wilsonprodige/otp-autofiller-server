const SubscriptionService = require('../services/subscription.service');
const cron = require('node-cron');

// Run daily at midnight
function setupSubscriptionChecks() {
  cron.schedule('0 0 * * *', async () => {
    console.log('Checking for expired subscriptions...');
    const expiredCount = await SubscriptionService.checkExpiredSubscriptions();
    console.log(`Marked ${expiredCount} subscriptions as expired`);
  });
}

module.exports = setupSubscriptionChecks;