import api from './api';

export const loginCustomer = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data; // { token, customer }
};

export const loginStaff = async (email, password) => {
  const { data } = await api.post('/api/auth/staff/login', { email, password });
  return data; // { token, staff }
};

export const registerCustomer = async (formData) => {
  const { data } = await api.post('/api/auth/register', formData);
  return data; // { token, customer }
};
