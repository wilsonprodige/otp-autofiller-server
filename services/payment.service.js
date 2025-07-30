const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  static async createCustomer(user) {
    return stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id }
    });
  }

  static async createSubscription(customerId, planId) {
    return stripe.subscriptions.create({
      customer: customerId,
      items: [{ plan: planId }],
      expand: ['latest_invoice.payment_intent']
    });
  }

  static async cancelSubscription(stripeSubscriptionId) {
    return stripe.subscriptions.del(stripeSubscriptionId);
  }

  static async handleWebhook(event) {
    // Handle different Stripe webhook events
    switch (event.type) {
      case 'invoice.payment_succeeded':
        // Update subscription in your database
        break;
      case 'customer.subscription.deleted':
        // Handle canceled subscription
        break;
      // Add more cases as needed
    }
  }
}

module.exports = PaymentService;
