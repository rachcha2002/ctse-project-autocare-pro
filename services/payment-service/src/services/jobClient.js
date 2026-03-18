const axios = require('axios');
const BASE = () => process.env.JOB_SERVICE_URL;

const getJob = async (jobId) => {
  const { data } = await axios.get(
    `${BASE()}/api/jobs/${jobId}`,
    { timeout: 5000 }
  );
  return data;
};

module.exports = { getJob };
