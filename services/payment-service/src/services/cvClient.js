const axios = require('axios');
const BASE = () => process.env.CUSTOMER_VEHICLE_SERVICE_URL;

const getCustomer = async (customerId) => {
  const { data } = await axios.get(
    `${BASE()}/api/customers/${customerId}`,
    { timeout: 5000 }
  );
  return data;
};

const getVehicle = async (vehicleId) => {
  const { data } = await axios.get(
    `${BASE()}/api/vehicles/${vehicleId}`,
    { timeout: 5000 }
  );
  return data;
};

const updateCustomerSpending = async (customerId, amount) => {
  const { data } = await axios.patch(
    `${BASE()}/api/customers/${customerId}/spending`,
    { amount },
    { timeout: 5000 }
  );
  return data;
};

module.exports = { getCustomer, getVehicle, updateCustomerSpending };
