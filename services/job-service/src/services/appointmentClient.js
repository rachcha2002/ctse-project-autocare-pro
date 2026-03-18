const axios = require('axios');
const BASE = () => process.env.APPOINTMENT_SERVICE_URL;

const updateAppointmentStatus = async (appointmentId, status) => {
  const { data } = await axios.patch(
    `${BASE()}/api/appointments/${appointmentId}/status`,
    { status },
    { timeout: 5000 }
  );
  return data;
};

const getAppointment = async (appointmentId) => {
  const { data } = await axios.get(
    `${BASE()}/api/appointments/${appointmentId}`,
    { timeout: 5000 }
  );
  return data;
};

module.exports = { updateAppointmentStatus, getAppointment };
