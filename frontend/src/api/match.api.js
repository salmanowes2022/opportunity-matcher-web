import api from './axiosClient';
export const evaluateMatch = (data) => api.post('/match/evaluate', data).then(r => r.data);
export const batchEvaluate = (opportunityIds) => api.post('/match/batch', { opportunity_ids: opportunityIds }).then(r => r.data);
