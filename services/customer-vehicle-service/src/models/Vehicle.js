const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  registrationNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  brand: { type: DataTypes.STRING },
  model: { type: DataTypes.STRING },
  year: { type: DataTypes.INTEGER },
  fuelType: { type: DataTypes.STRING },
  currentMileage: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  lastServiceDate: { type: DataTypes.DATEONLY },
}, { tableName: 'vehicles', timestamps: true });

module.exports = Vehicle;
