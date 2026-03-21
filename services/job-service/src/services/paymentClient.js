const axios = require('axios');
const BASE = () => process.env.PAYMENT_SERVICE_URL;

const createInvoice = async (invoiceData) => {
  const { data } = await axios.post(
    `${BASE()}/api/payments/invoice`,
    invoiceData,
    { timeout: 5000 }
  );
  return data;
};

module.exports = { createInvoice };
