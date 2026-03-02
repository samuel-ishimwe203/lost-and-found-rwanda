import apiClient from './api';

export const policeService = {
  postDocument: async (formData) => {
    return await apiClient.post('/police/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getPoliceItems: async (params) => {
    return await apiClient.get('/police/items', { params });
  },

  getClaims: async (params) => {
    return await apiClient.get('/police/claims', { params });
  },

  approveClaim: async (claimId) => {
    return await apiClient.post(`/police/claims/${claimId}/approve`);
  },

  rejectClaim: async (claimId, reason) => {
    return await apiClient.post(`/police/claims/${claimId}/reject`, { reason });
  }
};