import { getGeminiModel } from '../../config/gemini.js';

export async function extractOpportunityFromImage(imageBuffer, mimeType = 'image/jpeg') {
  const model = getGeminiModel('gemini-2.0-flash');

  const prompt = `You are analyzing an image that contains information about a scholarship, job posting, academic program, fellowship, or other opportunity.

Your task: Extract key information and return it as a JSON object.

Extract these fields:
1. title: The opportunity name/title
2. type: One of: "Scholarship", "Job", "Academic Program", "Fellowship", "Internship", "Other"
3. description: 2-3 sentence summary of what this opportunity offers
4. requirements: List ALL eligibility criteria, qualifications, requirements you can see
5. deadline: Application deadline in YYYY-MM-DD format if visible (or null)
6. provider: Organization/institution offering this
7. funding: Amount or salary range if mentioned
8. location: Where the opportunity is based
9. link: Any URL, email, or contact information visible

Return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "type": "Scholarship" | "Job" | "Academic Program" | "Fellowship" | "Internship" | "Other",
  "description": "string",
  "requirements": "string",
  "deadline": "YYYY-MM-DD or null",
  "provider": "string or null",
  "funding": "string or null",
  "location": "string or null",
  "link": "string or null"
}

Rules:
- If text is unclear, write "Not clearly visible" rather than guessing
- If this is NOT an opportunity announcement, return: {"error": "This image does not appear to be an opportunity announcement"}
- Be thorough - extract ALL visible requirements
- Preserve exact wording where important`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  let text = result.response.text().trim();

  // Clean markdown code blocks if present (mirrors Python version)
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  text = text.trim();

  const extracted = JSON.parse(text);

  if (extracted.error || !extracted.title || !extracted.description) {
    return null;
  }

  return extracted;
}
