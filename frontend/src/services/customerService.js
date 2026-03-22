import api from './api';

export const getCustomerProfile = async (id) => {
  const { data } = await api.get(`/api/customers/${id}`);
  return data;
};

export const updateCustomerProfile = async (id, profileData) => {
  const { data } = await api.put(`/api/customers/${id}`, profileData);
  return data;
};
