import { getDashboardStats } from '../services/dashboard.service.js';

export async function handleGetDashboard(req, res, next) {
  try {
    const stats = await getDashboardStats(req.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
