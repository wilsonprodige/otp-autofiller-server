const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database.js')


  const WebPushSubscription = sequelize.define(
    'WebPushSubscription',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', 
            key: 'id'
        }
      },
      endpoint: {
        type: DataTypes.STRING(512),
        allowNull: false,
        unique: true
      },
      keys: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('keys');
            return rawValue ? JSON.parse(rawValue) : null;
          },
          set(value) {
            this.setDataValue('keys', JSON.stringify(value));
          }
      }
    },
    {
        tableName: 'WebPushSubscriptions',
        timestamps: true,
        indexes: [
            {
              unique: true,
              fields: ['endpoint']
            },
            {
              fields: ['userId']
            }
        ]
    }
  );

  WebPushSubscription.associate = (models) => {
    WebPushSubscription.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE' 
    });
  };

 

  module.exports = WebPushSubscription;
