import openai from '../../../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ApplicationStrategyResultSchema } from '../../../types/schemas.js';

export async function createApplicationStrategy(profile, opportunities) {
  const systemPrompt = `You are an expert application strategist for scholarships and fellowships.
Your role is to help applicants maximize success by prioritizing applications strategically.

You consider:
- Match scores and success probability
- Application deadlines and timeline conflicts
- Effort required vs. potential return
- Portfolio diversification (different types, locations)
- Strategic positioning

Create actionable weekly plans with specific tasks.`;

  const oppsData = opportunities.map(item => {
    const opp = item.opportunity;
    const score = item.score;
    return `
Title: ${opp.title}
Type: ${opp.opp_type}
Match Score: ${(score * 100).toFixed(0)}%
Deadline: ${opp.deadline || 'Rolling'}
Requirements: ${opp.requirements?.slice(0, 200)}...`;
  });

  const humanPrompt = `Create an optimal application strategy for this profile and opportunities:

PROFILE:
Education: ${profile.education_level} in ${profile.field_of_study}
Experience: ${profile.experience_years} years
Goals: ${profile.goals}

OPPORTUNITIES:
${oppsData.slice(0, 10).join('\n---\n')}

Create a comprehensive strategy with:

1. PRIORITIZED APPLICATIONS: Rank all opportunities
   - Priority Level (High/Medium/Low) with reasoning
   - Match score, Deadline, Estimated effort (hours)
   - Success probability (0.0 to 1.0), ROI score (0.0 to 1.0)

2. WEEKLY TIMELINE: Break down next 8-12 weeks
   - Week-by-week tasks, which applications to focus on each week

3. STRATEGY SUMMARY: Overall approach and priorities

4. TOTAL EFFORT ESTIMATE: Sum of all application hours

5. RECOMMENDED FOCUS: Top 3-5 applications to prioritize

Consider: quality over quantity, balance reach/safety applications, diversify across types.`;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: humanPrompt }
      ],
      response_format: zodResponseFormat(ApplicationStrategyResultSchema, 'application_strategy')
    });

    return completion.choices[0].message.parsed;
  } catch (error) {
    return null;
  }
}
