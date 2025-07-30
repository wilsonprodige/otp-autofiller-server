const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database.js')

module.exports = (sequelize, DataTypes)=>{
  const BillingPlan = sequelize.define(
    'BillingPlan',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
        name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
        },
        price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
        },
        billingCycle: {
        type: DataTypes.ENUM('trial', 'monthly', 'yearly'),
        allowNull: false
        },
        durationDays: {
        type: DataTypes.INTEGER,
        allowNull: false
        },
        features: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
        },
        isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
        }
    },
    {
       tableName: 'billing_plans',
        timestamps: true
    }
  );

  return BillingPlan;
}
  

  //module.exports = BillingPlan;
