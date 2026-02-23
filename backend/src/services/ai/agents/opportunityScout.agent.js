import openai from '../../../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { OpportunityScoutResultSchema } from '../../../types/schemas.js';

export async function generateSearchStrategies(profile, topMatches = []) {
  const systemPrompt = `You are an expert opportunity scout specializing in scholarships, fellowships, and academic programs.
Your role is to help users discover opportunities they might have missed.

You analyze:
- User profile strengths
- Existing high-match opportunities
- Niche programs aligned with specific skills
- Hidden opportunities in user's field

Generate smart, specific search queries and suggest similar opportunities.`;

  const topMatchesStr = topMatches.length
    ? topMatches.map(opp => `- ${opp.title} (${opp.opp_type}): ${opp.description?.slice(0, 200)}`).join('\n')
    : 'No matches yet';

  const humanPrompt = `Based on this profile, generate intelligent opportunity search strategies:

PROFILE:
Education: ${profile.education_level} in ${profile.field_of_study}
Skills: ${profile.skills}
Experience: ${profile.experience_years} years
Languages: ${profile.languages}
Goals: ${profile.goals}

TOP MATCHES SO FAR:
${topMatchesStr}

Generate:

1. SEARCH QUERIES: 5-7 specific, actionable search queries
   - Exact query to use (e.g., "PhD scholarships computer science machine learning 2025")
   - Reasoning why this query is relevant
   - Priority level (high/medium/low)

2. SIMILAR OPPORTUNITIES: Suggest 3-5 opportunities similar to top matches
   - Title, Type, Why it's similar, Relevance score (0.0 to 1.0)

3. HIDDEN OPPORTUNITIES: 3-5 niche opportunities user might not know about
   - Specific program names or categories

4. OVERALL RECOMMENDATION: Strategic search advice

Be specific with program names, organizations, and search terms.`;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: humanPrompt }
      ],
      response_format: zodResponseFormat(OpportunityScoutResultSchema, 'opportunity_scout')
    });

    return completion.choices[0].message.parsed;
  } catch (error) {
    return null;
  }
}
