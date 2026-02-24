import api from './axiosClient';
export const getInterviewPrep = (opportunity) => api.post('/interview/prep', { opportunity }).then(r => r.data.result);
