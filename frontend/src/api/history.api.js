import api from './axiosClient';
export const getHistory = () => api.get('/history').then(r => r.data.history);
export const getHistoryStats = () => api.get('/history/stats').then(r => r.data);
export const deleteHistoryItem = (id) => api.delete(`/history/${id}`).then(r => r.data);
