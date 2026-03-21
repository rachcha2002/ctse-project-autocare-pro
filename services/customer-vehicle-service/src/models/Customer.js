const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  address: { type: DataTypes.TEXT },
  nic: { type: DataTypes.STRING },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  totalServices: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSpent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, { tableName: 'customers', timestamps: true });

module.exports = Customer;
