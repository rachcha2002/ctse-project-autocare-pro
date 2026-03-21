import api from './api';

export const getAvailableSlots = async (date) => {
  const { data } = await api.get(`/api/appointments/available?date=${date}`);
  return data;
};

export const bookAppointment = async (appointmentData) => {
  const { data } = await api.post('/api/appointments', appointmentData);
  return data;
};

export const getMyAppointments = async (customerId) => {
  const { data } = await api.get(`/api/appointments/customer/${customerId}`);
  return data;
};

export const getAppointment = async (id) => {
  const { data } = await api.get(`/api/appointments/${id}`);
  return data;
};

export const cancelAppointment = async (id) => {
  const { data } = await api.delete(`/api/appointments/${id}`);
  return data;
};

// Admin only
export const getAllAppointments = async () => {
  const { data } = await api.get('/api/appointments');
  return data;
};

export const confirmAppointment = async (id) => {
  const { data } = await api.patch(`/api/appointments/${id}/confirm`);
  return data;
};
