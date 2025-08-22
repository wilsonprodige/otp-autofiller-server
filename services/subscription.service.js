const { UserSubscription, BillingPlan } = require('../models');
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class SubscriptionService {

  static async handleStripeWebhook(event) {
    const { type, data } = event;
    info('--->stripe data-->', data?.object,type);

    switch(type){

          case 'invoice.payment_succeeded':
            await this.handlePaymentSucceeded(data.object);
            break;

          
          case 'invoice.payment_failed':
            await this.handlePaymentFailed(data.object);
            break;

          
          case 'customer.subscription.deleted':
            await this.handleSubscriptionDeleted(data.object);
            break;

          
          case 'customer.subscription.updated':
            await this.handleSubscriptionUpdated(data.object);
            break;

          // case 'customer.subscription.trial_will_end':
          //   // Notify user before trial ends
          //   break;
          // case 'checkout.session.completed':
          //   // Handle one-time payments
          //   break;

          
          default:
            console.log(`Unhandled Stripe event type: ${type}`);
      
    }
  }
  static async getPlans() {
    return BillingPlan.findAll({
      where: { isActive: true },
      order: [['price', 'ASC']]
    });
  }

  static async getCurrentSubscription(userId) {
    return UserSubscription.findOne({
      where: {
        userId,
        status: 'active',
        endDate: { [Op.gte]: new Date() }
      },
      include: [{
        model: BillingPlan,
        as: 'plan'
      }],
      order: [['endDate', 'DESC']]
    });
  }

  

  static async upgradeSubscription(userId, newPlanId, stripeSubscription = {}) {
    const currentSub = await  this.getCurrentSubscription(userId);
    const newPlan = await BillingPlan.findByPk(newPlanId);
    if (!newPlan) throw new Error('New plan not found');

    if (!currentSub) {
      throw new Error('No existing subscription found for upgrade');
    }

    if (currentSub?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.del(currentSub.stripeSubscriptionId);
      } catch (error) {
        console.error('Error canceling old Stripe subscription:', error);
      }
    }

    await currentSub.update({ 
      status: 'canceled',
      endDate: new Date()
    });

    const startDate = new Date(stripeSubscription.items.data[0].current_period_start * 1000);
    const endDate = new Date(stripeSubscription.items.data[0].current_period_end * 1000);

    return UserSubscription.create({
      userId,
      planId,
      startDate,
      endDate,
      status: stripeSubscription.status,
      paymentMethod: 'stripe',
      stripeSubscriptionId: stripeSubscription?.id ,
      previousSubscriptionId: currentSub.id 
    });
  }

  static async cancelSubscription(userId) {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription) throw new Error('No active subscription found');

    // In a real app, you would cancel with Stripe/PayPal here
    return subscription.update({ 
      status: 'canceled',
      endDate: new Date() // Ends immediately
    });
  }

  static async checkExpiredSubscriptions() {
    const expiredSubs = await UserSubscription.findAll({
      where: {
        status: 'active',
        endDate: { [Op.lt]: new Date() }
      }
    });

    for (const sub of expiredSubs) {
      await sub.update({ status: 'expired' });
    }

    return expiredSubs.length;
  }

  static async createStripeProduct(plan) {
    try {
      // Check if product already exists in Stripe
      let stripeProduct = await stripe.products.search({
        query: `metadata['planId']:'${plan.id}'`,
      });

      if (stripeProduct.data.length === 0) {
        //console.log('product', stripeProduct);
        // Create product in Stripe
        stripeProduct = await stripe.products.create({
          name: plan.name,
          description: plan.description || `Subscription for ${plan.name}`,
          metadata: { planId: plan.id },
        });
      } else {
        stripeProduct = stripeProduct.data[0];
      }

      // Check if price exists
      let stripePrice = await stripe.prices.search({
        query: `product:'${stripeProduct.id}' AND metadata['planId']:'${plan.id}'`,
      });

      if (stripePrice.data.length === 0) {
        //console.log('price', stripePrice);
        // Create price in Stripe
        stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: plan.price * 100, // Stripe uses cents
          currency: 'usd',
          recurring: {
            interval: plan.billingCycle === 'monthly' ? 'month' : 'year',
          },
          metadata: { planId: plan.id },
        });
      } else {
        stripePrice = stripePrice.data[0];
      }

      return stripePrice.id;
    } catch (error) {
      console.error('Error creating Stripe product:', error);
      throw error;
    }
  }

  static async createSubscription(userId, planId, stripeSubscription={}) {
    console.log('--create subscription', userId,planId,stripeSubscription);
    const plan = await BillingPlan.findByPk(planId);
    if (!plan) throw new Error('Plan not found');

    const startDate = new Date(stripeSubscription.items.data[0].current_period_start * 1000);
    const endDate = new Date(stripeSubscription.items.data[0].current_period_end * 1000);

    return UserSubscription.create({
      userId,
      planId,
      startDate,
      endDate,
      status: stripeSubscription.status,
      paymentMethod: 'stripe',
      stripeSubscriptionId: stripeSubscription?.id 
      // stripeCustomerId: stripeSubscription?.customer
    });
  }

  static async cancelSubscription(userId) {
    const subscription = await this.getCurrentSubscription(userId);
    if (!subscription) throw new Error('No active subscription found');

    // Cancel Stripe subscription
    try {
      await stripe.subscriptions.del(subscription.stripeSubscriptionId);
    } catch (error) {
      console.error('Error canceling Stripe subscription:', error);
      throw error;
    }

    return subscription.update({ 
      status: 'canceled',
      endDate: new Date() // Ends immediately
    });
  }

   static async handlePaymentSucceeded(invoice) {
    const subscriptionId = invoice.subscription;
    const subscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: subscriptionId }
    });

    if (subscription) {
      const periodEnd = new Date(invoice.period_end * 1000);
      await subscription.update({
        status: 'active',
        endDate: periodEnd
      });
    }
  }

  static async handlePaymentFailed(invoice) {
    const subscriptionId = invoice.subscription;
    const subscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: subscriptionId }
    });

    if (subscription) {
      await subscription.update({ status: 'past_due' });
    }
  }

  static async handleSubscriptionDeleted(stripeSubscription) {
    const subscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      await subscription.update({ 
        status: 'canceled',
        endDate: new Date()
      });
    }

    
  }
  //subscription change
  static async handleSubscriptionUpdated(stripeSubscription) {
    const subscription = await UserSubscription.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id }
    });

    if (subscription) {
      const endDate = new Date(stripeSubscription.current_period_end * 1000);
      await subscription.update({
        status: stripeSubscription.status,
        endDate: endDate,
        // Update planId if changed (extract from Stripe metadata)
        planId: stripeSubscription.metadata?.planId || subscription.planId
      });
    }
  }
}

module.exports = SubscriptionService;