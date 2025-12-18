import axios from './axiosClient';

export const fetchGuests = async (eventId) => {
  const res = await axios.get(`/events/${eventId}/guests`);
  return res.data;
};

export const createGuest = async (eventId, payload) => {
  const res = await axios.post(`/events/${eventId}/guests`, payload);
  return res.data;
};

export const updateGuest = async (guestId, payload) => {
  const res = await axios.put(`/guests/${guestId}`, payload);
  return res.data;
};

export const updateAllowedMembers = async (guestId, allowedMembers) => {
  const res = await axios.patch(`/guests/${guestId}/allowed-members`, {
    allowedMembers,
  });
  return res.data;
};

export const getGuestQr = async (guestId) => {
  const res = await axios.get(`/guests/${guestId}/qr`);
  return res.data;
};


