import axios from './axiosClient';

export const validateScan = async ({ token, eventId }) => {
  const res = await axios.post('/scan/validate', { token, eventId });
  return res.data;
};

export const registerEntry = async ({ token, eventId, membersToEnter }) => {
  const res = await axios.post('/scan/enter', { token, eventId, membersToEnter });
  return res.data;
};


