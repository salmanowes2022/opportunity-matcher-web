import {
  getHistory,
  getHistoryById,
  deleteHistoryItem,
  getHistoryStats
} from '../services/history.service.js';

export async function handleGetHistory(req, res, next) {
  try {
    const history = await getHistory(req.userId);
    res.json({ history });
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
