const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  vehicleId: { type: DataTypes.INTEGER, allowNull: false },
  appointmentDate: { type: DataTypes.DATE, allowNull: false },
  serviceType: {
    type: DataTypes.ENUM(
      'Full Service',
      'Oil Change',
      'Brake Check',
      'Tyre Rotation',
      'Engine Diagnostic',
      'Air Filter Replacement',
      'Battery Check',
      'General Repair'
    ),
    allowNull: false
  },
  notes: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed',
      'checked_in',
      'in_progress',
      'completed',
      'cancelled'
    ),
    defaultValue: 'pending',
    allowNull: false
  },
}, { tableName: 'appointments', timestamps: true });

module.exports = Appointment;
