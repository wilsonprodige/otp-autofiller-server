require('dotenv').config();
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const db_config = require('./config')[env];


const sequelize = new Sequelize(
  db_config.database,
  db_config.username,
  db_config.password,
  {
    host: db_config.host,
    dialect: db_config.dialect,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;