import axios from './axiosClient';

export const loginApi = async (email, password) => {
  const res = await axios.post('/auth/login', { email, password });
  return res.data;
};


