'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      planId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'billing_plans',
          key: 'id'
        }
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'expired', 'canceled'),
        allowNull: false,
        defaultValue: 'active'
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripeSubscriptionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('user_subscriptions', ['userId']);
    await queryInterface.addIndex('user_subscriptions', ['planId']);
    await queryInterface.addIndex('user_subscriptions', ['endDate']);
    await queryInterface.addIndex('user_subscriptions', ['status']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_subscriptions');
  }
};
