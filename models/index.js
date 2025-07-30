const sequelize = require('../config/database');
const requireAll = require('require-all');
const Sequelize = require('sequelize');
const fs = require('fs');
const path =require('path');

// const path = require('path');

// const User  = require('./user.model');
// const BillingPlan = require('./billingPlan.model');
// const UserSubscription = require('./userSubscription.model');
// const WebPushSubscription = require('./webPushSubscription');

// const models = {
//   User,
//   WebPushSubscription,
//   BillingPlan,
//   UserSubscription
// };
const models={};

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file !== 'index.js' &&           // Exclude this file
      file.endsWith('.js') &&          // Only JavaScript files
      !file.endsWith('.test.js')       // Exclude test files
    );
  })
  .forEach(file => {
    const modelPath = path.join(__dirname, file);
    const modelModule = require(modelPath);
    
    // Handle both function and class exports
    if (typeof modelModule === 'function') {
      // For traditional Sequelize model functions
      const model =  modelModule(sequelize, Sequelize.DataTypes);
      models[model.name] = model;
      console.log(`✓ Loaded model: ${model.name}`);
    } else if (modelModule.default && typeof modelModule.default.init === 'function') {
      // For ES6 class-based models
      const model = modelModule.default.init(sequelize, Sequelize.DataTypes);
      models[model.name] = model;
      console.log(`✓ Loaded class model: ${model.name}`);
    } else {
      console.warn(`⚠ File ${file} does not export a valid Sequelize model`);
    }
  });

console.log('Loaded models:', Object.keys(models));

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

sequelize.sync().catch((err) => {
  console.error('Database sync error:', err);
});

module.exports = {
  ...models,
  sequelize,
};