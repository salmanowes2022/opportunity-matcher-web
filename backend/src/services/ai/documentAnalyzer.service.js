import openai from '../../config/openai.js';
import { DocumentAnalysisSchema } from '../../types/schemas.js';

export async function analyzeDocumentImage(imageBuffer, mimeType, documentTypeHint = null) {
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const systemPrompt = `You are an expert document analyzer specializing in academic and professional documents.

Your task is to:
1. Read and transcribe all text from the image accurately
2. Identify what type of document this is (CV/Resume, Transcript, Certificate, Cover Letter, etc.)
3. Extract key structured information relevant for job/scholarship applications
4. Assess the quality and completeness of the document
5. Provide suggestions for how this information could be used

Focus on extracting:
- Personal information (name, contact, education)
- Skills and qualifications
- Work experience
- Academic achievements
- Certifications and awards
- GPA or grades (if transcript)
- Dates and durations

Be thorough but only extract information that's clearly visible and readable.
Return a JSON object with these exact fields: document_type, extracted_text, key_information (object), suggestions, confidence_score.`;

  const humanPrompt = `Please analyze this document image and provide a comprehensive analysis.
Document type hint: ${documentTypeHint || 'Unknown - please identify'}

Return ONLY a valid JSON object with:
{
  "document_type": "CV/Resume|Transcript|Certificate|Other",
  "extracted_text": "full transcription of visible text",
  "key_information": {"name": "...", "education": "...", "skills": "...", etc.},
  "suggestions": "how to use this information in applications",
  "confidence_score": 0.0 to 1.0
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: humanPrompt },
            {
              type: 'image_url',
              image_url: { url: dataUrl, detail: 'high' }
            }
          ]
        }
      ]
    });

    const rawJson = JSON.parse(completion.choices[0].message.content);
    return DocumentAnalysisSchema.parse(rawJson);
  } catch (error) {
    return {
      document_type: 'Error',
      extracted_text: `Error analyzing document: ${error.message}`,
      key_information: {},
      suggestions: 'Please try uploading a clearer image or check your API configuration.',
      confidence_score: 0.0
    };
  }
}

export async function extractProfileFromText(extractedText, currentProfile = null) {
  const systemPrompt = `You are an expert at extracting structured profile information from document text.

Extract the following if available:
- Name
- Education level and field
- GPA (convert to 4.0 scale if needed)
- Skills (technical and soft skills, comma-separated)
- Years of experience (integer)
- Languages (comma-separated)
- Key achievements

Return ONLY a valid JSON object with these fields (use null for missing fields):
{
  "name": "string or null",
  "education_level": "High School|Bachelor's|Master's|PhD|Other or null",
  "field_of_study": "string or null",
  "gpa": number or null,
  "skills": "comma-separated string or null",
  "experience_years": number or null,
  "languages": "comma-separated string or null",
  "achievements": "string or null",
  "goals": "string or null"
}`;

  const humanPrompt = `From this document text, extract profile information:

DOCUMENT TEXT:
${extractedText}

CURRENT PROFILE:
${currentProfile ? JSON.stringify(currentProfile) : 'No existing profile'}

Return ONLY the JSON object with extracted/suggested values.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: humanPrompt }
      ]
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    throw new Error(`Error extracting profile information: ${error.message}`);
  }
}
