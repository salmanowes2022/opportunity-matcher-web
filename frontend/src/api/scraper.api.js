import api from './axiosClient';
export const scrapeUrl = (url) => api.post('/scraper/url', { url }).then(r => r.data.opportunity);
export const extractFromImage = (formData) => api.post('/scraper/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.opportunity);
