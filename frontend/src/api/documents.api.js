import api from './axiosClient';
export const analyzeDocument = (formData) => api.post('/documents/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.analysis);
export const extractProfile = (data) => api.post('/documents/extract-profile', data).then(r => r.data.suggested_profile_updates);
