const sequelize = require('../config/database');
const User  = require('./user.model');
const WebPushSubscription = require('./webPushSubscription');

const models = {
  User,
  WebPushSubscription
};

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