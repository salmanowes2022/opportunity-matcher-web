import { getProfile } from '../services/profile.service.js';
import { generateInterviewPrep } from '../services/ai/interviewPrep.service.js';

export async function handleInterviewPrep(req, res, next) {
  try {
    const { opportunity } = req.body;
    if (!opportunity?.title || !opportunity?.description) {
      return res.status(400).json({ error: 'Opportunity title and description are required' });
    }

    const profile = await getProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please create your profile first.' });
    }

    const result = await generateInterviewPrep(profile, opportunity);
    res.json({ result });
  } catch (err) {
    next(err);
  }
}
