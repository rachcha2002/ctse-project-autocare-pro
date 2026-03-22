import api from './api';

export const getMyPayments = async (customerId) => {
  const { data } = await api.get(`/api/payments/customer/${customerId}`);
  return data;
};

export const getPayment = async (id) => {
  const { data } = await api.get(`/api/payments/${id}`);
  return data;
};

export const getPaymentByJob = async (jobId) => {
  const { data } = await api.get(`/api/payments/job/${jobId}`);
  return data;
};

export const processPayment = async (id, paymentMethod) => {
  const { data } = await api.post(`/api/payments/${id}/pay`, { paymentMethod });
  return data;
};

export const getReceipt = async (id) => {
  const { data } = await api.get(`/api/payments/${id}/receipt`);
  return data;
};

export const stripePayment = async (id, cardData) => {
  const { data } = await api.post(`/api/payments/${id}/stripe-pay`, cardData);
  return data;
};

export const cancelInvoice = async (id) => {
  const { data } = await api.patch(`/api/payments/${id}/cancel`);
  return data;
};
