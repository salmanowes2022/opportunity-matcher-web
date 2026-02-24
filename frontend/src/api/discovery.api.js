import api from './axiosClient';
export const runDiscovery = () => api.post('/discovery/discover').then(r => r.data);
