import openai from '../../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const InterviewQuestionSchema = z.object({
  question: z.string(),
  category: z.enum(['behavioral', 'technical', 'motivational', 'situational']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ideal_answer_outline: z.string(),
  tips: z.string()
});

const InterviewPrepSchema = z.object({
  questions: z.array(InterviewQuestionSchema),
  key_themes: z.array(z.string()),
  preparation_tips: z.array(z.string()),
  common_mistakes: z.array(z.string()),
  opening_statement: z.string()
});

export async function generateInterviewPrep(profile, opportunity) {
  const systemPrompt = `You are an expert interview coach with deep experience in scholarship interviews, job interviews, and academic program admissions.

Your role is to help candidates prepare for interviews by:
- Generating realistic, challenging interview questions
- Providing ideal answer frameworks (not full scripts)
- Flagging common mistakes
- Offering preparation strategies specific to this opportunity type

Be practical, specific, and encouraging.`;

  const humanPrompt = `Prepare this candidate for an interview for the following opportunity.

CANDIDATE PROFILE:
Name: ${profile.name}
Education: ${profile.education_level} in ${profile.field_of_study}
GPA: ${profile.gpa ?? 'Not provided'}
Experience: ${profile.experience_years} years
Skills: ${profile.skills}
Languages: ${profile.languages}
Achievements: ${profile.achievements}
Goals: ${profile.goals}

OPPORTUNITY:
Title: ${opportunity.title}
Type: ${opportunity.opp_type}
Description: ${opportunity.description}
Requirements: ${opportunity.requirements}

Generate:
1. 8–10 interview questions (mix of behavioral, motivational, technical, situational)
2. Key themes the interviewer will focus on
3. 5 preparation tips specific to this opportunity
4. 3–4 common mistakes candidates make
5. A compelling 30-second opening statement template for this candidate

Tailor everything to the candidate's background and this specific opportunity.`;

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: humanPrompt }
    ],
    response_format: zodResponseFormat(InterviewPrepSchema, 'interview_prep')
  });

  return completion.choices[0].message.parsed;
}
