import api from './api';

const updateProfile = (data) => api.put('/users/update-profile/', data);
const changePassword = (data) => api.post('/users/change-password/', data);

export default {
  updateProfile,
  changePassword
};