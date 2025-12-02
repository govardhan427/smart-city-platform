import api from './api';

const getAllEvents = () => api.get('/events/');
const createEvent = (data) => api.post('/events/', data);
const updateEvent = (id, data) => api.put(`/events/${id}/`, data);
const deleteEvent = (id) => api.delete(`/events/${id}/`);

export default {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent
};