import api from './api';

export const sendChatToAI = (message) => {
  return api.post('/analytics/chat/', { message });
};

export default {
  sendChatToAI,
};