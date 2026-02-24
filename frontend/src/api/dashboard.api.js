import api from './axiosClient';
export const getDashboard = () => api.get('/dashboard').then(r => r.data);
export const updateOpportunityStatus = (id, status) => api.patch(`/opportunities/${id}/status`, { status }).then(r => r.data.opportunity);
