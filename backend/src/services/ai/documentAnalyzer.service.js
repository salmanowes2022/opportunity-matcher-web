import openai from '../../config/openai.js';
import { getGeminiModel } from '../../config/gemini.js';
import { DocumentAnalysisSchema } from '../../types/schemas.js';

const ANALYSIS_PROMPT = `You are an expert document analyzer specializing in academic and professional documents.

Your task is to:
1. Read and transcribe all text from the document accurately
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
Return ONLY a valid JSON object with these exact fields:
{
  "document_type": "CV/Resume|Transcript|Certificate|Other",
  "extracted_text": "full transcription of visible text",
  "key_information": {"name": "...", "education": "...", "skills": "...", etc.},
  "suggestions": "how to use this information in applications",
  "confidence_score": 0.0 to 1.0
}`;

async function analyzeWithGemini(fileBuffer, mimeType, documentTypeHint) {
  const model = getGeminiModel('gemini-2.5-flash');
  const base64Data = fileBuffer.toString('base64');

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    `${ANALYSIS_PROMPT}\n\nDocument type hint: ${documentTypeHint || 'Unknown - please identify'}\n\nReturn ONLY the JSON object.`,
  ]);

  const text = result.response.text().trim();
  // Strip markdown code fences if present
  const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(jsonStr);
}

async function analyzeWithOpenAI(fileBuffer, mimeType, documentTypeHint) {
  const base64Image = fileBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const humanPrompt = `Please analyze this document and provide a comprehensive analysis.
Document type hint: ${documentTypeHint || 'Unknown - please identify'}

${ANALYSIS_PROMPT}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
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

  return JSON.parse(completion.choices[0].message.content);
}

export async function analyzeDocumentImage(imageBuffer, mimeType, documentTypeHint = null) {
  try {
    let rawJson;

    if (mimeType === 'application/pdf') {
      // Gemini natively supports PDF documents
      rawJson = await analyzeWithGemini(imageBuffer, mimeType, documentTypeHint);
    } else {
      // Images go to OpenAI vision
      rawJson = await analyzeWithOpenAI(imageBuffer, mimeType, documentTypeHint);
    }

    const parsed = DocumentAnalysisSchema.parse(rawJson);
    // Flatten any nested objects/arrays in key_information to strings
    const flatInfo = {};
    for (const [k, v] of Object.entries(parsed.key_information)) {
      flatInfo[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
    return { ...parsed, key_information: flatInfo };
  } catch (error) {
    throw new Error(`Document analysis failed: ${error.message}`);
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
