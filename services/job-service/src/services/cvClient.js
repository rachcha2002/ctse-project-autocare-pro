const axios = require('axios');
const BASE = () => process.env.CUSTOMER_VEHICLE_SERVICE_URL;

const getMechanics = async () => {
  const { data } = await axios.get(`${BASE()}/api/staff/mechanics`, { timeout: 5000 });
  return data;
};

const getMechanic = async (id) => {
  const { data } = await axios.get(`${BASE()}/api/staff/${id}`, { timeout: 5000 });
  return data;
};

const updateVehicleService = async (vehicleId, payload) => {
  const { data } = await axios.patch(
    `${BASE()}/api/vehicles/${vehicleId}/service-update`,
    payload,
    { timeout: 5000 }
  );
  return data;
};

module.exports = { getMechanics, getMechanic, updateVehicleService };
