const { UserSubscription, BillingPlan } = require('../models');
const moment = require('moment');

class SubscriptionService {
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

  static async createSubscription(userId, planId, paymentData = {}) {
    const plan = await BillingPlan.findByPk(planId);
    if (!plan) throw new Error('Plan not found');

    const startDate = new Date();
    const endDate = moment(startDate).add(plan.durationDays, 'days').toDate();

    // In a real app, you would integrate with Stripe/PayPal here
    // For now, we'll just create the subscription record
    return UserSubscription.create({
      userId,
      planId,
      startDate,
      endDate,
      status: 'active',
      paymentMethod: paymentData.method || 'free',
      stripeSubscriptionId: paymentData.stripeId || null
    });
  }

  static async upgradeSubscription(userId, newPlanId, paymentData = {}) {
    const currentSub = await this.getCurrentSubscription(userId);
    const newPlan = await BillingPlan.findByPk(newPlanId);
    if (!newPlan) throw new Error('New plan not found');

    // Cancel current subscription if exists
    if (currentSub) {
      await currentSub.update({ status: 'canceled' });
    }

    // Create new subscription
    return this.createSubscription(userId, newPlanId, paymentData);
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
}

module.exports = SubscriptionService;