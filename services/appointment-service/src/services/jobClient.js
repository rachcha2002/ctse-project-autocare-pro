const axios = require('axios');

const BASE = () => process.env.JOB_SERVICE_URL;

const createJob = async (jobData) => {
  const { data } = await axios.post(`${BASE()}/api/jobs`, jobData, { timeout: 5000 });
  return data;
};

module.exports = { createJob };
