const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize({
  dialect: config.db.dialect,
  storage: config.db.storage,
  logging: config.db.logging,
});

module.exports = sequelize; 