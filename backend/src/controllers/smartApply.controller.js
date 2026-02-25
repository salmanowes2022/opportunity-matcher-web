import { getProfile } from '../services/profile.service.js';
import {
  generateSmartApplyPackage,
  saveSmartApplyPackage,
  getSmartApplyPackages,
  getSmartApplyPackageById,
  deleteSmartApplyPackage
} from '../services/ai/smartApply.service.js';

export async function handleGenerate(req, res, next) {
  try {
    const userId = req.user.id;
    const { opportunity, save = true } = req.body;

    if (!opportunity?.title || !opportunity?.description) {
      return res.status(400).json({ error: 'opportunity.title and opportunity.description are required' });
    }

    const profile = await getProfile(userId);
    if (!profile) {
      return res.status(400).json({ error: 'Please complete your profile before using Smart Apply.' });
    }

    const pkg = await generateSmartApplyPackage(profile, opportunity);

    let saved = null;
    if (save) {
      try {
        saved = await saveSmartApplyPackage(
          userId,
          pkg,
          opportunity.id || null,
          opportunity.title
        );
      } catch (_) {
        // Save failed — still return the package
      }
    }

    res.json({ package: pkg, saved_id: saved?.id || null });
  } catch (err) {
    next(err);
  }
}

export async function handleList(req, res, next) {
  try {
    const packages = await getSmartApplyPackages(req.user.id);
    res.json({ packages });
  } catch (err) {
    next(err);
  }
}

export async function handleGetById(req, res, next) {
  try {
    const pkg = await getSmartApplyPackageById(req.user.id, req.params.id);
    res.json({ package: pkg });
  } catch (err) {
    next(err);
  }
}

export async function handleDelete(req, res, next) {
  try {
    await deleteSmartApplyPackage(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
