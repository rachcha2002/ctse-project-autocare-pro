import api from './api';

export const getStaffMembers = async () => {
  const { data } = await api.get('/api/staff');
  return data;
};

export const createStaffMember = async (staffData) => {
  const { data } = await api.post('/api/staff', staffData);
  return data;
};

export const updateStaffMember = async (id, staffData) => {
  const { data } = await api.put(`/api/staff/${id}`, staffData);
  return data;
};

export const deleteStaffMember = async (id) => {
  const { data } = await api.delete(`/api/staff/${id}`);
  return data;
};
