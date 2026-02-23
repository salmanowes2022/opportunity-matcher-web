import openai from '../../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { MatchResultSchema } from '../../types/schemas.js';

export async function evaluateMatch(profile, opportunity) {
  const systemPrompt = `You are an expert career and opportunity advisor with years of experience
in matching candidates to scholarships, jobs, and academic programs.

Your task is to:
1. Analyze the candidate's qualifications against the opportunity requirements
2. Identify strengths (what makes them a strong candidate)
3. Identify gaps (what they might be missing)
4. Provide an honest compatibility score (0.0 to 1.0)
5. Give actionable recommendations

Be encouraging but realistic. If there are gaps, suggest how to address them.
Focus on practical advice the candidate can act on.`;

  const humanPrompt = `CANDIDATE PROFILE:
Name: ${profile.name}
Education: ${profile.education_level} in ${profile.field_of_study}
GPA: ${profile.gpa ?? 'Not provided'}
Experience: ${profile.experience_years} years
Skills: ${profile.skills}
Languages: ${profile.languages}
Achievements: ${profile.achievements}
Goals: ${profile.goals}

OPPORTUNITY DETAILS:
Title: ${opportunity.title}
Type: ${opportunity.opp_type}
Description: ${opportunity.description}
Requirements: ${opportunity.requirements}

Please evaluate this match and provide:
1. A compatibility score (0.0 to 1.0, where 1.0 is perfect match)
2. Key strengths that make them a good fit
3. Potential gaps or areas for improvement
4. Your recommendation on whether they should apply and how to improve their chances

Be specific and actionable in your feedback.`;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: humanPrompt }
      ],
      response_format: zodResponseFormat(MatchResultSchema, 'match_result')
    });

    return completion.choices[0].message.parsed;
  } catch (error) {
    return {
      compatibility_score: 0.0,
      strengths: 'Error occurred during evaluation. Please check your API key and try again.',
      gaps: 'Unable to analyze at this time.',
      recommendation: `Error: ${error.message}`
    };
  }
}
