import api from './api';

const getAllParking = () => {
  return api.get('/transport/parking/');
};

const bookParking = (id, bookingData) => {
  // bookingData: { vehicle_number: "ABC-123", start_time: "2025-10-30T10:00" }
  return api.post(`/transport/parking/${id}/book/`, bookingData);
};

const getMyParking = () => {
  return api.get('/transport/my-parking/');
};

export default {
  getAllParking,
  bookParking,
  getMyParking,
};