import apiClient from './api'

export const notificationService = {
  getNotifications: async () => {
    return await apiClient.get('/notifications')
  },

  markAsRead: async (notificationId) => {
    return await apiClient.put(`/notifications/${notificationId}/read`)
  },

  deleteNotification: async (notificationId) => {
    return await apiClient.delete(`/notifications/${notificationId}`)
  },

  subscribeToNotifications: async () => {
    return await apiClient.post('/notifications/subscribe')
  }
}
