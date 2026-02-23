import openai from '../../../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ProfileOptimizationResultSchema } from '../../../types/schemas.js';

export async function analyzeProfile(profile) {
  const systemPrompt = `You are an expert career counselor and scholarship advisor with 20+ years of experience.
Your role is to analyze candidate profiles and provide actionable, high-impact recommendations.

You evaluate:
- Profile completeness and quality
- Competitive positioning for scholarships
- Gaps that could hurt applications
- Quick wins for immediate improvement
- Strategic long-term improvements

Be specific, actionable, and encouraging. Focus on practical steps.`;

  const humanPrompt = `Analyze this profile and provide comprehensive optimization recommendations:

PROFILE:
Name: ${profile.name}
Education: ${profile.education_level} in ${profile.field_of_study}
GPA: ${profile.gpa ?? 'Not provided'}
Experience: ${profile.experience_years} years
Skills: ${profile.skills}
Languages: ${profile.languages}
Achievements: ${profile.achievements}
Goals: ${profile.goals}

Provide a detailed analysis with:

1. PROFILE STRENGTH SCORE (0-10): Overall competitiveness
2. COMPLETENESS PERCENTAGE (0-100): How complete the profile is
3. MATCH POTENTIAL INCREASE: Expected improvement % if recommendations followed

4. CRITICAL GAPS: Issues that could disqualify from top scholarships
   - Category (e.g., "Missing Leadership", "Weak Achievements")
   - Severity (critical/moderate/minor)
   - Description
   - Impact on applications

5. QUICK WINS: Actions achievable in 1-2 weeks with high impact
   - Specific action
   - Expected impact
   - Time estimate
   - Priority level

6. HIGH IMPACT IMPROVEMENTS: Strategic improvements (30-90 days)
   - Area to improve
   - Current state
   - Target state
   - Step-by-step action plan
   - Timeline
   - Impact score (0.0 to 1.0)

7. 90-DAY ACTION PLAN:
   - Next 30 Days: Immediate priorities
   - Days 31-60: Medium-term development
   - Days 61-90: Strategic positioning
   Each period needs: goals, specific tasks, success metrics

8. OVERALL RECOMMENDATION: Encouraging summary with key priorities

Be specific with numbers, timelines, and actionable steps.`;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: humanPrompt }
      ],
      response_format: zodResponseFormat(ProfileOptimizationResultSchema, 'profile_optimization')
    });

    return completion.choices[0].message.parsed;
  } catch (error) {
    return null;
  }
}
