import api from './axiosClient';
export const generateMaterial = (data) => api.post('/materials/generate', data).then(r => r.data.material);
export const getMaterials = () => api.get('/materials').then(r => r.data.materials);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`).then(r => r.data);
export const exportMaterial = (id, format = 'pdf') => api.get(`/materials/${id}/export?format=${format}`, { responseType: 'blob' }).then(r => r.data);
