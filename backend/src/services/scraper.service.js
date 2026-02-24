import axios from 'axios';
import * as cheerio from 'cheerio';
import openai from '../config/openai.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ScrapedOpportunitySchema } from '../types/schemas.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchPageText(url) {
  const headers = {
    'User-Agent': randomUA(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
  };

  const response = await axios.get(url, {
    headers,
    timeout: 15000,
    maxRedirects: 5,
    validateStatus: (status) => status < 500, // don't throw on 403/404
  });

  if (response.status === 403 || response.status === 401) {
    return null; // signal blocked
  }

  if (response.status === 404) {
    throw new Error('Page not found (404). Please check the URL.');
  }

  const $ = cheerio.load(response.data);
  $('script, style, nav, footer, header, noscript, aside, [class*="cookie"], [id*="cookie"], [class*="banner"]').remove();

  // Prefer main content areas
  const mainEl = $('main, article, [role="main"], .content, #content, .main-content').first();
  const text = (mainEl.length ? mainEl : $('body'))
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000);

  return text;
}

async function extractWithAI(url, pageText) {
  const systemPrompt = `You are an expert at extracting scholarship and opportunity information.
Extract key structured information from the provided content.

Focus on:
- Scholarship/program name
- Type (Scholarship, Fellowship, Internship, Job, Grant, Competition, etc.)
- Clear description (2-3 sentences)
- Specific requirements and eligibility criteria
- Deadline (in YYYY-MM-DD format if possible, otherwise as written)
- Provider/organization name
- Funding amount or benefits
- Location (country or city)
- Any eligibility details

Be thorough but concise. If a field is not available, use null.`;

  const contentSection = pageText
    ? `SCRAPED CONTENT:\n${pageText}`
    : `NOTE: The website blocked direct scraping. Use your knowledge about this URL/domain to fill in what you know, and mark uncertain fields appropriately.`;

  const humanPrompt = `Extract opportunity information from this source:

URL: ${url}

${contentSection}

Return structured data with all available fields.`;

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
  result.link = url;
  return result;
}

export async function scrapeOpportunityFromUrl(url) {
  let pageText = null;

  try {
    pageText = await fetchPageText(url);
  } catch (fetchErr) {
    // Network errors (DNS, timeout, etc.) — still try AI fallback with URL only
    if (fetchErr.message.includes('404')) throw fetchErr;
    // For other fetch errors, fall through to AI-only extraction
  }

  // pageText === null means 403/blocked — fall back to AI knowledge
  // pageText is a string means success
  // pageText undefined (fetch threw) also falls through
  return await extractWithAI(url, pageText);
}
