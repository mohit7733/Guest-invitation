import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:4000/api',
});

axiosClient.interceptors.request.use((config) => {
  const saved = localStorage.getItem('auth');
  if (saved) {
    const { token } = JSON.parse(saved);
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosClient;


