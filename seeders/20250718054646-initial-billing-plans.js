'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert('billing_plans', [
      {
        name: '14-Day Trial',
        price: 0.00,
        billingCycle: 'trial',
        durationDays: 14,
        features: JSON.stringify([
          '5 OTP detections per day',
          '14 days trial',
          'Basic email monitoring',
          'Chrome extension',
          'Standard support'
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Monthly Pro',
        price: 1.90,
        billingCycle: 'monthly',
        durationDays: 30,
        features: JSON.stringify([
          'Unlimited OTP detections',
          'Advanced email monitoring',
          'Multi-account support',
          'Real-time notifications',
          'Priority support',
          'Custom filters'
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Yearly Pro',
        price: 20.00,
        billingCycle: 'yearly',
        durationDays: 365,
        features: JSON.stringify([
          'Everything in Pro',
          'Team management',
          'API access',
          'Advanced analytics',
          'White-label solution',
          '24/7 dedicated support'
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('billing_plans', null, {});
  }
};
