require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Appointment Service — Database connected');
    await sequelize.sync({ alter: true });
    console.log('Appointment Service — Models synced');
    app.listen(PORT, () => {
      console.log(`Appointment Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Appointment Service:', err.message);
    process.exit(1);
  }
};

start();
