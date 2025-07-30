const {status: httpStatus} = require('http-status');
const ApiResponse = require('../utils/apiResponse');
const SubscriptionService = require('../services/subscription.service');

const plans = async (req, res, next) => {
  try {
    const plans = await SubscriptionService.getPlans();
    //res.json(plans);
    
    return new ApiResponse(res, httpStatus.OK, plans, 'success');
  } catch (error) {
    next(error);
  }
};

const mySubscription = async (req, res) =>{
    try {
    const subscription = await SubscriptionService.getCurrentSubscription(req.user.id);
    
    return new ApiResponse(res, httpStatus.OK, subscription || { message: 'No active subscription' }, 'success');
  } catch (error) {
    next(error);
  }
}

const subscribe = async (req, res) =>{
    try{
        const { planId, paymentMethod } = req.body;
        const subscription = await SubscriptionService.createSubscription(
        req.user.id, 
        planId, 
            { method: paymentMethod }
        );

        return new ApiResponse(res, httpStatus.OK, subscription, 'success');
    }
    catch (error) {
        next(error);
    }
}

const upgrade = async (req, res)=>{
    try{
        const { newPlanId, paymentMethod } = req.body;
        const subscription = await SubscriptionService.upgradeSubscription(
        req.user.id, 
        newPlanId, 
        { method: paymentMethod }
        );
        res.json(subscription);

        return new ApiResponse(res, httpStatus.OK, subscription, 'success');
    }
    catch (error) {
        next(error);
    }
}

const cancel = async (req, res)=>{
    try{
        await SubscriptionService.cancelSubscription(req.user.id);
        return new ApiResponse(res, httpStatus.OK, { message: 'Subscription canceled' }, 'success');
    }
    catch(error){
        next(error);
    }
}



module.exports = {
  plans,
  mySubscription,
  subscribe,
  upgrade,
  cancel
};