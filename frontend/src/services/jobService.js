import api from './api';

export const getJob = async (id) => {
  const { data } = await api.get(`/api/jobs/${id}`);
  return data;
};

export const getJobByAppointment = async (appointmentId) => {
  const { data } = await api.get(`/api/jobs/appointment/${appointmentId}`);
  return data;
};

export const getVehicleJobs = async (vehicleId) => {
  const { data } = await api.get(`/api/jobs/vehicle/${vehicleId}`);
  return data;
};

export const getMechanics = async () => {
  const { data } = await api.get('/api/jobs/mechanics/list');
  return data;
};

export const assignJob = async (id, mechanicId) => {
  const { data } = await api.patch(`/api/jobs/${id}/assign`, { mechanicId });
  return data;
};

export const startJob = async (id) => {
  const { data } = await api.patch(`/api/jobs/${id}/start`);
  return data;
};

export const updateJobProgress = async (id, progressData) => {
  const { data } = await api.put(`/api/jobs/${id}/progress`, progressData);
  return data;
};

export const completeJob = async (id, completionData) => {
  const { data } = await api.patch(`/api/jobs/${id}/complete`, completionData);
  return data;
};

// Get all jobs — admin uses this via /api/jobs with filters
// Since there's no GET /api/jobs list route, we fetch by appointment list
// The admin page will gather jobs from the appointment list
export const getAllJobs = async () => {
  // Backend doesn't have a GET /api/jobs list endpoint — admin gets jobs by drilling into appointments
  // We return an empty array placeholder; AdminJobs page fetches via appointment confirm flow
  return [];
};
