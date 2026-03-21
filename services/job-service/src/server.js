require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3002;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Job Service — Database connected');
    await sequelize.sync({ alter: true });
    console.log('Job Service — Models synced');
    app.listen(PORT, () => {
      console.log(`Job Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Job Service:', err.message);
    process.exit(1);
  }
};

start();
