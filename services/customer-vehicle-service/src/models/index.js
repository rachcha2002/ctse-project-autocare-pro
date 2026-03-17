const sequelize = require('../config/database');
const Customer = require('./Customer');
const Vehicle = require('./Vehicle');
const VehicleServiceHistory = require('./VehicleServiceHistory');

Customer.hasMany(Vehicle, { foreignKey: 'customerId', as: 'vehicles' });
Vehicle.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Vehicle.hasMany(VehicleServiceHistory, { foreignKey: 'vehicleId', as: 'serviceHistory' });
VehicleServiceHistory.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

module.exports = { sequelize, Customer, Vehicle, VehicleServiceHistory };
