import axios from 'axios';
import * as cheerio from 'cheerio';
import openai from '../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ScrapedOpportunitySchema } from '../types/schemas.js';

export async function scrapeOpportunityFromUrl(url) {
  // Step 1: Fetch webpage (mirrors Python requests.get)
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 10000
  });

  // Step 2: Parse HTML with cheerio (mirrors BeautifulSoup)
  const $ = cheerio.load(response.data);
  $('script, style, nav, footer, header, noscript').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000);

  // Step 3: AI extraction (mirrors Python web_scraper.py)
  const systemPrompt = `You are an expert at extracting scholarship and opportunity information from web pages.
Analyze the text content and extract key structured information.

Focus on:
- Scholarship/program name
- Type (Scholarship, Fellowship, Job, etc.)
- Clear description (2-3 sentences)
- Specific requirements and eligibility
- Deadline (in YYYY-MM-DD format if possible)
- Provider/organization
- Funding amount or salary
- Location
- Benefits offered

Be thorough but concise. Extract exact information from the text.`;

  const humanPrompt = `Extract structured information from this webpage content:

URL: ${url}

CONTENT:
${text}

Return structured data with all available fields. If information is not found, use "Not specified" or null.`;

  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: humanPrompt }
    ],
    response_format: zodResponseFormat(ScrapedOpportunitySchema, 'scraped_opportunity')
  });

  const result = completion.choices[0].message.parsed;
  result.link = url; // Always ensure link is set (mirrors Python)
  return result;
}
