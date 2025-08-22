const {status: httpStatus} = require('http-status');
const ApiResponse = require('../utils/apiResponse');
const SubscriptionService = require('../services/subscription.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { UserSubscription, BillingPlan } = require('../models');

const createCheckoutSession = async (req, res, next) => {

  try {
      const { planId, successUrl, cancelUrl } = req.body;
      const userId = req.user.id;
      
      const plan = await BillingPlan.findByPk(planId);
      if (!plan) {
        return new ApiResponse(res, httpStatus[404], { error: 'Plan not found' }, 'error');
        
      }

      let stripeCustomerId,existingStripeCustomers;

      existingStripeCustomers  = await stripe.customers.search({
        query: `metadata['userId']:'${userId}'`,
      });

      if (existingStripeCustomers.data.length > 0) {
        stripeCustomerId = existingStripeCustomers.data[0].id;
        console.log(`Found existing Stripe customer: ${stripeCustomerId}`);
      } else {
        const customer = await stripe.customers.create({
          email: req.user?.email,
          name:  `${req.user?.firstName} ${req.user?.lastName}`,
          metadata: { 
            userId: userId.toString(),
            internalUserId: userId.toString(),
            planId:planId.toString() // Avoids Stripe metadata key restrictions
          }
        });
        stripeCustomerId = customer.id;
      }

      const priceId = await SubscriptionService.createStripeProduct(plan);

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId.toString(),
          planId: planId.toString()
        },
        subscription_data: {
          metadata: {
            userId: userId.toString(),
            planId: planId.toString()
          }
        }
      });
      //console.log('session--->', session);
      return new ApiResponse(res, httpStatus.OK, { sessionId: session.id,url: session?.url }, 'success')
      
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new ApiResponse(res, httpStatus['500_NAME'], { error: error.message }, 'error')
  }
  
};

const verifyStripeSession = async (req, res, next) =>{
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    //console.log('---session-->',session)
    if (session?.payment_status === 'paid') {
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
      const existingSubscription = await SubscriptionService.getCurrentSubscription(userId);


      try{
        if(existingSubscription){
          await SubscriptionService.upgradeSubscription(
            userId, 
            parseInt(session?.metadata?.planId), 
            stripeSubscription
          );
        }else{
           await SubscriptionService.createSubscription(req.user.id,parseInt(session?.metadata?.planId),stripeSubscription);
        }
       
      }
      catch(error){
         console.error(existingSubscription ? 'Subscription upgrade failed' :'Subscription creation failed:', error.message, error.stack);
        return new ApiResponse(res, httpStatus.INTERNAL_SERVER_ERROR, { error: (existingSubscription ? 'Subscription upgrade failed': 'payment failed')  }, 'error');
      }
      return new ApiResponse(res, httpStatus.OK, { paymentStatus: 'paid', customerEmail: session.customer_email,upgrade:!!existingSubscription }, 'success')
    } else {
      return new ApiResponse(res, httpStatus.INTERNAL_SERVER_ERROR, { error: 'Payment not completed' }, 'error');
      r//es.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Subscription creation failed:', error.message, error.stack);
    return new ApiResponse(res, httpStatus.INTERNAL_SERVER_ERROR, { error: 'Invalid session ID' }, 'error');
  }
}

const webhookCallbackHandler = async (req, res, next) =>{
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook error:', err.message);
        return new ApiResponse(res, httpStatus[400], { error: `Webhook Error: ${err.message}` }, 'error');
    }

    try {
        await SubscriptionService.handleStripeWebhook(event);
        return new ApiResponse(res, httpStatus[200], { received: true }, 'success');
    } catch (error) {
        console.error('Error handling webhook:', error);
        return new ApiResponse(res, httpStatus[500], { error: error.message }, 'error');
    }
}

const customerPortal = async (req,res, next)=>{
    try {
        const subscription = await SubscriptionService.getCurrentSubscription(req.user.id);
        if (!subscription || !subscription.stripeCustomerId) {
            
            return new ApiResponse(res, httpStatus[400], { error: 'No active subscription found' }, 'error');
        }

        const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: req.body.returnUrl,
        });

        //res.json({ url: portalSession.url });
        return new ApiResponse(res, httpStatus.OK, { url: portalSession.url }, 'success');
    } catch (error) {
        console.error('Error creating customer portal session:', error);
        //res.status(500).json({ error: error.message });
        return new ApiResponse(res, httpStatus[500], { error: error.message }, 'error');
    }
}

module.exports = {
  createCheckoutSession,
  webhookCallbackHandler,
  customerPortal,
  verifyStripeSession
};