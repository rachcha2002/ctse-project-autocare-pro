const bcrypt = require('bcrypt');
const { Staff, sequelize } = require('../src/models');
require('dotenv').config();

const seedStaff = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const adminHash = await bcrypt.hash('Admin@2026', 12);
    const mechanicHash = await bcrypt.hash('Mechanic@2026', 12);

    await Staff.findOrCreate({
      where: { email: 'admin@autocare.com' },
      defaults: {
        fullName: 'System Admin',
        phone: '0700000001',
        email: 'admin@autocare.com',
        passwordHash: adminHash,
        role: 'admin'
      }
    });

    await Staff.findOrCreate({
      where: { email: 'mechanic1@autocare.com' },
      defaults: {
        fullName: 'Mechanic One',
        phone: '0700000002',
        email: 'mechanic1@autocare.com',
        passwordHash: mechanicHash,
        role: 'mechanic'
      }
    });

    console.log('Staff seeded successfully');
    console.log('Admin: admin@autocare.com / Admin@2026');
    console.log('Mechanic: mechanic1@autocare.com / Mechanic@2026');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seedStaff();
