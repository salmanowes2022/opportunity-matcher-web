import {
  getHistory,
  getHistoryById,
  deleteHistoryItem,
  getHistoryStats
} from '../services/history.service.js';

export async function handleGetHistory(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    const minScore = parseFloat(req.query.min_score) || 0;
    const maxScore = parseFloat(req.query.max_score) || 1;

    const { items, total } = await getHistory(req.userId, { limit, offset, search, minScore, maxScore });
    res.json({ history: items, total, limit, offset });
  } catch (err) {
    next(err);
  }
}

export async function handleGetHistoryItem(req, res, next) {
  try {
    const match_result = await getHistoryById(req.userId, req.params.id);
    res.json({ match_result });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteHistoryItem(req, res, next) {
  try {
    await deleteHistoryItem(req.userId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function handleGetStats(req, res, next) {
  try {
    const stats = await getHistoryStats(req.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
