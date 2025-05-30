const sequelize = require('../config/database');
const User  = require('./user.model');

const models = {
  User
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});
sequelize.sync({ alter: true }).catch((err) => {
  console.error('Database sync error:', err);
});

module.exports = {
  ...models,
  sequelize,
};