import api from './axiosClient';

export const generatePackage = (opportunity) =>
  api.post('/smart-apply/generate', { opportunity }).then(r => r.data);

export const listPackages = () =>
  api.get('/smart-apply').then(r => r.data.packages);

export const getPackage = (id) =>
  api.get(`/smart-apply/${id}`).then(r => r.data.package);

export const deletePackage = (id) =>
  api.delete(`/smart-apply/${id}`).then(r => r.data);
