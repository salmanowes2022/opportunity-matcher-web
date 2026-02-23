import api from './axiosClient';
export const getProfile = () => api.get('/profile').then(r => r.data.profile);
export const saveProfile = (data) => api.post('/profile', data).then(r => r.data.profile);
export const deleteProfile = () => api.delete('/profile').then(r => r.data);
