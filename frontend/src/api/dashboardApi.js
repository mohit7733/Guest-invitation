import axios from './axiosClient';

export const getEventSummary = async (eventId) => {
  const res = await axios.get(`/dashboard/event/${eventId}/summary`);
  return res.data;
};

export const getAttendanceLogs = async (eventId) => {
  const res = await axios.get(`/dashboard/event/${eventId}/attendance-logs`);
  return res.data;
};

export const getActivityLogs = async (eventId) => {
  const res = await axios.get(`/dashboard/event/${eventId}/activity-logs`);
  return res.data;
};


