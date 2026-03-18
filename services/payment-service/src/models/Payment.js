const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  jobId: { type: DataTypes.INTEGER, allowNull: false },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  customerName: { type: DataTypes.STRING(255) },
  customerPhone: { type: DataTypes.STRING(20) },
  vehicleRegistration: { type: DataTypes.STRING(20) },
  serviceType: { type: DataTypes.STRING(255) },
  laborCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  partsCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card'),
    allowNull: true
  },
  paidAt: { type: DataTypes.DATE },
}, { tableName: 'payments', timestamps: true });

module.exports = Payment;
