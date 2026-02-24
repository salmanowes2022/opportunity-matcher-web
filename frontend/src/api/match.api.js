import api from './axiosClient';
export const evaluateMatch = (data) => api.post('/match/evaluate', data).then(r => r.data);
export const batchEvaluate = (opportunityIds) => api.post('/match/batch', { opportunity_ids: opportunityIds }).then(r => r.data);
export const exportMatchPDF = async (opportunity, match_result) => {
  const res = await api.post('/match/export-pdf', { opportunity, match_result }, { responseType: 'blob' });
  const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `match-report-${opportunity.title?.slice(0, 30).replace(/\s+/g, '-')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
