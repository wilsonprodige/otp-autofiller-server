'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Add previousSubscriptionId column
      await queryInterface.addColumn(
        'user_subscriptions',
        'previousSubscriptionId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'user_subscriptions',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        { transaction }
      );

      // 2. Add stripeCustomerId column
      await queryInterface.addColumn(
        'user_subscriptions',
        'stripeCustomerId',
        {
          type: Sequelize.STRING,
          allowNull: true
        },
        { transaction }
      );

      // 3. Add cancellationReason column
      await queryInterface.addColumn(
        'user_subscriptions',
        'cancellationReason',
        {
          type: Sequelize.STRING,
          allowNull: true
        },
        { transaction }
      );

      // 4. Add trialEndsAt column
      await queryInterface.addColumn(
        'user_subscriptions',
        'trialEndsAt',
        {
          type: Sequelize.DATE,
          allowNull: true
        },
        { transaction }
      );

      // 5. Update ENUM values for status column
      // Note: This might require special handling depending on your database
      // For PostgreSQL, we need to create a new type and change the column
      if (queryInterface.sequelize.options.dialect === 'postgres') {
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_user_subscriptions_status" 
           ADD VALUE 'trialing'`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_user_subscriptions_status" 
           ADD VALUE 'past_due'`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_user_subscriptions_status" 
           ADD VALUE 'incomplete'`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_user_subscriptions_status" 
           ADD VALUE 'incomplete_expired'`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TYPE "enum_user_subscriptions_status" 
           ADD VALUE 'paused'`,
          { transaction }
        );
      } else {
        // For other databases, you might need to recreate the table
        // or use a different approach
        console.log('Note: You may need to manually update the ENUM values for your database');
      }

      // 6. Add index for stripeCustomerId
      await queryInterface.addIndex(
        'user_subscriptions',
        ['stripeCustomerId'],
        { transaction }
      );
    });
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.sequelize.transaction(async (transaction) => {
      // Remove columns in reverse order
      await queryInterface.removeColumn(
        'user_subscriptions',
        'trialEndsAt',
        { transaction }
      );
      await queryInterface.removeColumn(
        'user_subscriptions',
        'cancellationReason',
        { transaction }
      );
      await queryInterface.removeColumn(
        'user_subscriptions',
        'stripeCustomerId',
        { transaction }
      );
      await queryInterface.removeColumn(
        'user_subscriptions',
        'previousSubscriptionId',
        { transaction }
      );

      // Remove index
      await queryInterface.removeIndex(
        'user_subscriptions',
        'user_subscriptions_stripe_customer_id',
        { transaction }
      );
    });
  }
};
