const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleServiceHistory = sequelize.define('VehicleServiceHistory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false },
  jobId: { type: DataTypes.INTEGER },
  paymentId: { type: DataTypes.INTEGER },
  serviceDate: { type: DataTypes.DATEONLY },
  serviceType: { type: DataTypes.STRING },
  summary: { type: DataTypes.TEXT },
  amountPaid: { type: DataTypes.DECIMAL(10, 2) },
}, { tableName: 'vehicle_service_history', timestamps: true });

module.exports = VehicleServiceHistory;
