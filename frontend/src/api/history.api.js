import api from './axiosClient';
export const getHistory = (params = {}) => api.get('/history', { params }).then(r => r.data);
export const getHistoryStats = () => api.get('/history/stats').then(r => r.data);
export const deleteHistoryItem = (id) => api.delete(`/history/${id}`).then(r => r.data);
