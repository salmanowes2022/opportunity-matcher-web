import openai from '../../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { SmartApplyPackageSchema } from '../../types/schemas.js';
import supabase from '../../config/supabase.js';

// Type-specific short answer questions
const SHORT_ANSWER_QUESTIONS = {
  scholarship: [
    'Why do you deserve this scholarship?',
    'How will this scholarship help you achieve your goals?',
    'Describe a challenge you overcame and what you learned.',
    'What impact do you plan to have in your field?'
  ],
  fellowship: [
    'What research or project do you plan to pursue?',
    'How does this fellowship align with your career goals?',
    'Describe your most significant accomplishment.',
    'How will you contribute to the fellowship community?'
  ],
  job: [
    'Why do you want to work at this organization?',
    'Describe your most relevant work experience.',
    'How do your skills match the role requirements?',
    'Where do you see yourself in 5 years?'
  ],
  internship: [
    'What do you hope to learn from this internship?',
    'Describe a project where you applied relevant skills.',
    'Why are you interested in this field?',
    'How will this internship support your studies/career?'
  ],
  phd: [
    'Describe your proposed research topic and methodology.',
    'Why do you want to pursue a PhD at this institution?',
    'Describe your most significant research experience.',
    'How does this program align with your research interests?'
  ],
  masters: [
    'Why do you want to pursue this Masters program?',
    'Describe your undergraduate research or project experience.',
    'What are your career goals after completing the program?',
    'How will you contribute to the program community?'
  ]
};

function getOppCategory(oppType) {
  const t = (oppType || '').toLowerCase();
  if (t.includes('scholarship')) return 'scholarship';
  if (t.includes('fellowship')) return 'fellowship';
  if (t.includes('internship')) return 'internship';
  if (t.includes('job') || t.includes('position') || t.includes('employ')) return 'job';
  if (t.includes('phd') || t.includes('doctorate')) return 'phd';
  if (t.includes('master') || t.includes('msc') || t.includes('mba')) return 'masters';
  return 'scholarship'; // default
}

export async function generateSmartApplyPackage(profile, opportunity) {
  const category = getOppCategory(opportunity.opp_type);
  const questions = SHORT_ANSWER_QUESTIONS[category];

  const systemPrompt = `You are an expert application consultant helping candidates create complete, compelling application packages.
Your role is to generate highly personalized, professional application materials tailored to both the candidate's background and the specific opportunity.
Always be specific — reference actual details from the candidate's profile and the opportunity. Never be generic.`;

  const userPrompt = `CANDIDATE PROFILE:
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
Provider: ${opportunity.provider ?? 'Not specified'}
Location: ${opportunity.location ?? 'Not specified'}
Description: ${opportunity.description}
Requirements: ${opportunity.requirements}
Funding/Benefits: ${opportunity.funding ?? 'Not specified'}
Deadline: ${opportunity.deadline ?? 'Not specified'}

YOUR TASK:
Generate a complete application package with these components:

1. COVER LETTER (400–500 words)
   - Professional business letter format
   - Opening: hook + specific reason for applying to THIS opportunity
   - Body: 2–3 paragraphs connecting profile to opportunity requirements
   - Closing: strong call to action
   - Reference specific details from both profile and opportunity

2. PERSONAL STATEMENT (500–600 words)
   - Narrative essay format
   - Tell the candidate's story: background → journey → goals
   - Show motivation for THIS specific opportunity/field
   - Connect past experiences to future ambitions
   - Demonstrate fit with provider's values/mission

3. SHORT ANSWER RESPONSES (answer each question in 100–150 words):
${questions.map((q, i) => `   Q${i + 1}: "${q}"`).join('\n')}

4. DOCUMENT CHECKLIST
   Based on the opportunity type (${opportunity.opp_type}), list all likely required documents.
   For each: whether it's required/optional, whether the candidate likely has it based on their profile.

5. SUBMISSION TIPS (5–7 specific tips)
   Tailored to this exact opportunity, not generic advice.

6. TAILORING NOTES
   Key customization points: what stands out in this candidate's profile for THIS opportunity,
   and 2–3 specific ways to further customize before submitting.

7. ESTIMATED PREP TIME
   Realistic estimate for finalizing and submitting this application.`;

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: zodResponseFormat(SmartApplyPackageSchema, 'smart_apply_package')
  });

  return completion.choices[0].message.parsed;
}

export async function saveSmartApplyPackage(userId, pkg, opportunityId, opportunityTitle) {
  const { data, error } = await supabase
    .from('smart_apply_packages')
    .insert({
      user_id: userId,
      opportunity_id: opportunityId,
      opportunity_title: opportunityTitle,
      cover_letter: pkg.cover_letter,
      personal_statement: pkg.personal_statement,
      short_answers: pkg.short_answers,
      document_checklist: pkg.document_checklist,
      submission_tips: pkg.submission_tips,
      tailoring_notes: pkg.tailoring_notes,
      estimated_prep_time: pkg.estimated_prep_time
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSmartApplyPackages(userId) {
  const { data, error } = await supabase
    .from('smart_apply_packages')
    .select('id, opportunity_title, opportunity_id, estimated_prep_time, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSmartApplyPackageById(userId, id) {
  const { data, error } = await supabase
    .from('smart_apply_packages')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSmartApplyPackage(userId, id) {
  const { error } = await supabase
    .from('smart_apply_packages')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}
