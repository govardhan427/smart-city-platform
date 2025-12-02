import api from './api';

const getDashboardStats = () => {
  return api.get('/analytics/dashboard/');
};

const getRoster = (type, id) => {
  return api.get(`/analytics/roster/${type}/${id}/`);
};
const downloadFile = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const downloadRosterCSV = async (type, id) => {
  const response = await api.get(`/analytics/export/roster/${type}/${id}/`, {
    responseType: 'blob', // IMPORTANT: This tells Axios to handle binary data
  });
  downloadFile(response, `${type}_${id}_roster.csv`);
};

const downloadFinancialsCSV = async () => {
  const response = await api.get('/analytics/export/financials/', {
    responseType: 'blob',
  });
  downloadFile(response, 'financial_report.csv');
};
export default {
  getDashboardStats,
  downloadRosterCSV, // Add this
  downloadFinancialsCSV, // Add this
  getLiveStats: () => api.get('/analytics/live/'), // Ensure this exists from previous step
  getRoster, // Export new function
};