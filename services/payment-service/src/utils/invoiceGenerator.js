const { Payment } = require('../models');

const generateInvoiceNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  const { Op } = require('sequelize');
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayCount = await Payment.count({
    where: {
      createdAt: { [Op.between]: [startOfDay, endOfDay] }
    }
  });

  const sequence = String(todayCount + 1).padStart(4, '0');
  return `INV-${dateStr}-${sequence}`;
};

module.exports = { generateInvoiceNumber };
