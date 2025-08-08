const { BillingPlan } = require('../models');
const SubscriptionService = require('../services/subscription.service');

async function syncPlans() {
  const plans = await BillingPlan.findAll();
  
  for (const plan of plans) {
    if(plan?.billingCycle !== 'trial'){
         try {
            console.log(`Syncing plan: ${plan.name}`);
            await SubscriptionService.createStripeProduct(plan);
            console.log(`Successfully synced plan: ${plan.name}`);
        } catch (error) {
            console.error(`Error syncing plan ${plan.name}:`, error);
        }
    }
   
  }
  
  console.log('Plan sync completed');
  process.exit(0);
}

syncPlans();