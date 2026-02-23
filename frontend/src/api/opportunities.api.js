import api from './axiosClient';
export const getOpportunities = (q) => api.get('/opportunities', { params: q ? { q } : {} }).then(r => r.data.opportunities);
export const getOpportunity = (id) => api.get(`/opportunities/${id}`).then(r => r.data.opportunity);
export const createOpportunity = (data) => api.post('/opportunities', data).then(r => r.data.opportunity);
export const updateOpportunity = (id, data) => api.put(`/opportunities/${id}`, data).then(r => r.data.opportunity);
export const deleteOpportunity = (id) => api.delete(`/opportunities/${id}`).then(r => r.data);
