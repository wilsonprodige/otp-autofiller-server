'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up (queryInterface, Sequelize) {
      await queryInterface.createTable('WebPushSubscriptions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        endpoint: {
          type: Sequelize.STRING(512),
          allowNull: false,
          unique: true
        },
        keys: {
          type: Sequelize.TEXT,
          allowNull: false
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
  
      await queryInterface.addIndex('WebPushSubscriptions', ['userId']);
      await queryInterface.addIndex('WebPushSubscriptions', ['endpoint'], {
        unique: true
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('WebPushSubscriptions');
  }
};
