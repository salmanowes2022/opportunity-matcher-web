import { getProfile, upsertProfile, deleteProfile } from '../services/profile.service.js';
import { UserProfileSchema } from '../types/schemas.js';

export async function handleGetProfile(req, res, next) {
  try {
    const profile = await getProfile(req.userId);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function handleUpsertProfile(req, res, next) {
  try {
    const profileData = UserProfileSchema.parse(req.body);
    const profile = await upsertProfile(req.userId, profileData);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteProfile(req, res, next) {
  try {
    await deleteProfile(req.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
