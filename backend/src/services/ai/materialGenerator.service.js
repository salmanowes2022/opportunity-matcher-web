import openai from '../../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ApplicationMaterialSchema } from '../../types/schemas.js';
import supabase from '../../config/supabase.js';

const PROMPTS = {
  cover_letter: {
    system: `You are an expert career counselor specializing in writing compelling cover letters.
Your task is to create a professional, personalized cover letter that:
- Shows clear connection between candidate's background and opportunity
- Demonstrates genuine interest and research about the opportunity
- Highlights most relevant experiences and achievements
- Uses professional but engaging tone
- Follows standard business letter format`,
    structure: 'formal business letter with clear introduction, body paragraphs showing fit, and strong conclusion'
  },
  personal_statement: {
    system: `You are an expert admissions counselor who writes compelling personal statements.
Your task is to create a narrative that:
- Tells the candidate's story with clear progression
- Shows motivation and passion for the field
- Demonstrates self-reflection and growth
- Connects past experiences to future goals
- Shows fit with the specific program/opportunity`,
    structure: 'narrative essay with engaging opening, development of themes, and clear conclusion'
  },
  motivation_letter: {
    system: `You are an expert in writing motivation letters for academic and professional opportunities.
Your task is to create a letter that:
- Clearly states motivation for applying
- Shows deep understanding of the opportunity
- Demonstrates preparedness and qualifications
- Explains how opportunity fits career goals
- Shows what candidate can contribute`,
    structure: 'structured letter with clear motivation, qualifications, and mutual benefit'
  }
};

export async function generateApplicationMaterial(profile, opportunity, materialType, targetWordCount = 500) {
  const config = PROMPTS[materialType] || PROMPTS.cover_letter;

  const humanPrompt = `CANDIDATE PROFILE:
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

TASK:
Write a ${materialType.replace(/_/g, ' ')} following this structure: ${config.structure}

Target length: approximately ${targetWordCount} words

Requirements:
1. Be specific and personalized - reference actual details from both profile and opportunity
2. Show clear research and understanding of the opportunity
3. Highlight most relevant experiences that match requirements
4. Use professional but engaging tone
5. Include specific examples and achievements
6. Show genuine enthusiasm and fit

Also provide:
- Key points you highlighted in the material
- Suggestions for how the candidate could improve or customize further`;

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    temperature: 0.5,
    messages: [
      { role: 'system', content: config.system },
      { role: 'user', content: humanPrompt }
    ],
    response_format: zodResponseFormat(ApplicationMaterialSchema, 'application_material')
  });

  const result = completion.choices[0].message.parsed;
  // Recalculate word count from actual content
  result.word_count = result.content.split(/\s+/).filter(Boolean).length;
  result.material_type = materialType;
  return result;
}

export async function saveMaterial(userId, material, opportunityId = null, matchResultId = null, opportunityTitle = null) {
  const { data, error } = await supabase
    .from('generated_materials')
    .insert({
      user_id: userId,
      opportunity_id: opportunityId,
      match_result_id: matchResultId,
      material_type: material.material_type,
      content: material.content,
      word_count: material.word_count,
      key_points_highlighted: material.key_points_highlighted,
      suggestions_for_improvement: material.suggestions_for_improvement,
      opportunity_title: opportunityTitle
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMaterials(userId) {
  const { data, error } = await supabase
    .from('generated_materials')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMaterialById(userId, id) {
  const { data, error } = await supabase
    .from('generated_materials')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMaterial(userId, id) {
  const { error } = await supabase
    .from('generated_materials')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
}
