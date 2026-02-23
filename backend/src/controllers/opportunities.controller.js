import {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  searchOpportunities
} from '../services/opportunities.service.js';
import { OpportunitySchema } from '../types/schemas.js';

export async function handleGetAll(req, res, next) {
  try {
    if (req.query.q) {
      const opportunities = await searchOpportunities(req.userId, req.query.q);
      return res.json({ opportunities });
    }
    const opportunities = await getAllOpportunities(req.userId);
    res.json({ opportunities });
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

export async function handleDelete(req, res, next) {
  try {
    await deleteOpportunity(req.userId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
