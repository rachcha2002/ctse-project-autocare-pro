const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  appointmentId: { type: DataTypes.INTEGER, allowNull: false },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  serviceType: { type: DataTypes.STRING, allowNull: false },
  assignedMechanic: { type: DataTypes.INTEGER },
  issueDescription: { type: DataTypes.TEXT },
  workDescription: { type: DataTypes.TEXT },
  sparePartsUsed: { type: DataTypes.TEXT },
  partsCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  laborCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM(
      'created',
      'pending',
      'in_progress',
      'waiting_parts',
      'completed'
    ),
    defaultValue: 'created',
    allowNull: false
  },
  completedAt: { type: DataTypes.DATE },
}, { tableName: 'jobs', timestamps: true });

module.exports = Job;
