import apiClient from './api';

// Get all messages for the logged-in user
export const getUserMessages = async () => {
  const response = await apiClient.get('/messages');
  return response.data;
};

// Send a message to a user about their lost item
export const sendMessage = async (messageData) => {
  const response = await apiClient.post('/messages/send', messageData);
  return response.data;
};

// Reply to a message
export const replyToMessage = async (replyData) => {
  const response = await apiClient.post('/messages/reply', replyData);
  return response.data;
};

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  const response = await apiClient.patch(`/messages/${messageId}/read`);
  return response.data;
};

// Get unread message count
export const getUnreadMessageCount = async () => {
  const response = await apiClient.get('/messages/unread-count');
  return response.data;
};

// Delete a message
export const deleteMessage = async (messageId) => {
  const response = await apiClient.delete(`/messages/${messageId}`);
  return response.data;
};
