const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js')

module.exports= (sequelize, DataTypes)=>{
  const UserSubscription = sequelize.define(
    'UserSubscription',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
        userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
        },
        planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'billing_plans',
            key: 'id'
        }
        },
        startDate: {
        type: DataTypes.DATE,
        allowNull: false
        },
        endDate: {
        type: DataTypes.DATE,
        allowNull: false
        },
        status: {
        type: DataTypes.ENUM('active', 'expired', 'canceled'),
        allowNull: false,
        defaultValue: 'active'
        },
        paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
        },
        stripeSubscriptionId: {
        type: DataTypes.STRING,
        allowNull: true
        }
    },
    {
        tableName: 'user_subscriptions',
        timestamps: true,
        indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['planId']
        },
        {
            fields: ['endDate']
        },
        {
            fields: ['status']
        }
        ]
    }
  );

  UserSubscription.associate = (models) => {
    UserSubscription.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    UserSubscription.belongsTo(models.BillingPlan, {
      foreignKey: 'planId',
      as: 'plan'
    });
  };
return UserSubscription;
  
}
  //module.exports = UserSubscription;
