require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3003;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Payment Service — Database connected');
    await sequelize.sync({ alter: true });
    console.log('Payment Service — Models synced');
    app.listen(PORT, () => {
      console.log(`Payment Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Payment Service:', err.message);
    process.exit(1);
  }
};

start();
