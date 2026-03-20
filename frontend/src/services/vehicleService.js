import api from './api';

export const getMyVehicles = async (customerId) => {
  const { data } = await api.get(`/api/vehicles/customer/${customerId}`);
  return data;
};

export const getVehicle = async (id) => {
  const { data } = await api.get(`/api/vehicles/${id}`);
  return data;
};

export const registerVehicle = async (vehicleData) => {
  const { data } = await api.post('/api/vehicles', vehicleData);
  return data;
};

export const updateVehicle = async (id, vehicleData) => {
  const { data } = await api.put(`/api/vehicles/${id}`, vehicleData);
  return data;
};

export const getVehicleHistory = async (id) => {
  const { data } = await api.get(`/api/vehicles/${id}/history`);
  return data;
};
