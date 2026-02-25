import {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStatus,
  deleteOpportunity,
  searchOpportunities,
  getUserStatuses
} from '../services/opportunities.service.js';
import { OpportunitySchema } from '../types/schemas.js';

export async function handleGetAll(req, res, next) {
  try {
    // Fetch all opportunities + this user's personal statuses in parallel
    const [opportunities, statusMap] = await Promise.all([
      req.query.q
        ? searchOpportunities(req.userId, req.query.q)
        : getAllOpportunities(req.userId),
      getUserStatuses(req.userId)
    ]);
    // Merge user-specific status onto each opportunity
    const merged = opportunities.map(o => ({
      ...o,
      status: statusMap[o.id] || 'saved'
    }));
    res.json({ opportunities: merged });
  } catch (err) {
    next(err);
  }
}

export async function handleGetOne(req, res, next) {
  try {
    const opportunity = await getOpportunityById(req.userId, req.params.id);
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function handleCreate(req, res, next) {
  try {
    const oppData = OpportunitySchema.parse(req.body);
    const opportunity = await createOpportunity(req.userId, { ...oppData, source: 'manual' });
    res.status(201).json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdate(req, res, next) {
  try {
    const oppData = OpportunitySchema.partial().parse(req.body);
    const opportunity = await updateOpportunity(req.userId, req.params.id, oppData);
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['saved', 'applied', 'interview', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const opportunity = await updateOpportunityStatus(req.userId, req.params.id, status);
    res.json({ opportunity });
  } catch (err) {
    next(err);
  }
}

export async function handleDelete(req, res, next) {
  try {
    await deleteOpportunity(req.userId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
