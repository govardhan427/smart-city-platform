import api from './api';

const getAllFacilities = () => {
  return api.get('/facilities/');
};

const bookFacility = (id, bookingData) => {
  // bookingData should look like: { booking_date: '2025-12-01', time_slot: '09:00-11:00' }
  return api.post(`/facilities/${id}/book/`, bookingData);
};

const getMyBookings = () => {
  return api.get('/facilities/my-bookings/');
};

const getFacilityById = (id) => {
  return api.get(`/facilities/${id}/`);
};
export default {
  getAllFacilities,
  getFacilityById,
  bookFacility,
  getMyBookings,
};