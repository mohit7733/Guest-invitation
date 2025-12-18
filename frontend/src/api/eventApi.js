import axios from './axiosClient';

export const fetchEvents = async () => {
  const res = await axios.get('/events');
  return res.data;
};

export const createEvent = async (payload) => {
  const res = await axios.post('/events', payload);
  return res.data;
};

export const fetchEvent = async (id) => {
  const res = await axios.get(`/events/${id}`);
  return res.data;
};


