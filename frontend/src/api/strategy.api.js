import api from './axiosClient';
export const runStrategy = (data = {}) => api.post('/strategy/run', data).then(r => r.data);
