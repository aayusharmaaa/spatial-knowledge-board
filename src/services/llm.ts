/**
 * LLM Service - OpenAI API integration for:
 *  - Auto-categorizing notes/screenshots into pillars & categories
 *  - Generating tags
 *  - Chat assistant for organizing/searching notes
 */

import { PILLARS } from '@/types';
import type { Pillar, Note } from '@/types';

// ── API Key Store (persisted in localStorage) ─────────────────
const API_KEY_STORAGE = 'thoughtspace_openai_key';
const MODEL_STORAGE = 'thoughtspace_model';

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function getModel(): string {
  return localStorage.getItem(MODEL_STORAGE) || 'gpt-4o-mini';
}

export function setModel(model: string) {
  localStorage.setItem(MODEL_STORAGE, model);
}

export function hasApiKey(): boolean {
  return getApiKey().length > 10;
}

// ── Types ─────────────────────────────────────────────────────
export interface CategorizeResult {
  pillar: Pillar;
  category: string;
  tags: string[];
  title: string;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ── Build the pillar/category reference for the prompt ────────
function buildPillarReference(): string {
  return Object.entries(PILLARS)
    .map(([key, val]) => `${val.emoji} ${val.name} (${key}): ${val.categories.join(', ')}`)
    .join('\n');
}

// ── OpenAI API call ───────────────────────────────────────────
async function callOpenAI(
  messages: ChatMessage[],
  options: { json?: boolean; temperature?: number } = {}
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key configured. Please add your OpenAI API key in Settings.');

  const model = getModel();

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: 1000,
  };

  if (options.json) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── Categorize content ────────────────────────────────────────
export async function categorizeContent(
  content: string,
  filename: string,
  fileType: string
): Promise<CategorizeResult> {
  const pillarRef = buildPillarReference();

  const systemPrompt = `You are a content categorizer for ThoughtSpace, a personal knowledge management app.
Given a piece of content (note, screenshot text, or PDF), you must:
1. Determine which PILLAR it belongs to (health, wealth, or wisdom)
2. Determine the specific CATEGORY within that pillar
3. Generate 2-5 relevant tags
4. Create a concise title if needed
5. Write a brief 1-2 sentence summary

PILLARS AND CATEGORIES:
${pillarRef}

Respond in JSON format:
{
  "pillar": "health" | "wealth" | "wisdom",
  "category": "exact category name from the list above",
  "tags": ["tag1", "tag2", ...],
  "title": "suggested title",
  "summary": "brief summary"
}`;

  const userPrompt = `File: ${filename} (${fileType})
Content:
${content.substring(0, 2000)}`;

  try {
    const response = await callOpenAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { json: true, temperature: 0.2 }
    );

    const parsed = JSON.parse(response);

    // Validate pillar
    const validPillars: Pillar[] = ['health', 'wealth', 'wisdom'];
    const pillar: Pillar = validPillars.includes(parsed.pillar) ? parsed.pillar : 'wisdom';

    // Validate category
    const validCategories = PILLARS[pillar].categories;
    const category = validCategories.includes(parsed.category)
      ? parsed.category
      : validCategories[0];

    return {
      pillar,
      category,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      title: parsed.title || filename,
      summary: parsed.summary || content.substring(0, 200),
    };
  } catch (err) {
    console.error('LLM categorization error:', err);
    throw err;
  }
}

// ── Chat with notes context ───────────────────────────────────
export async function chatWithContext(
  userMessage: string,
  notes: Note[],
  chatHistory: ChatMessage[]
): Promise<string> {
  const pillarRef = buildPillarReference();

  // Build a concise notes summary for context
  const notesSummary = notes
    .slice(0, 80)
    .map((n) => `[${n.pillar}/${n.category}] "${n.title}" - ${n.content.substring(0, 80)}...`)
    .join('\n');

  // Stats
  const pillarCounts = { health: 0, wealth: 0, wisdom: 0 };
  notes.forEach((n) => pillarCounts[n.pillar]++);

  const systemPrompt = `You are ThoughtSpace AI, a helpful assistant for a personal knowledge management app.
The user organizes their life into three pillars: Health, Wealth, and Wisdom.

PILLARS AND CATEGORIES:
${pillarRef}

USER'S NOTES STATS:
- Health: ${pillarCounts.health} notes
- Wealth: ${pillarCounts.wealth} notes  
- Wisdom: ${pillarCounts.wisdom} notes
- Total: ${notes.length} notes

USER'S NOTES (sample):
${notesSummary}

You can:
1. Help find specific notes by topic, pillar, or category
2. Suggest how to organize or tag notes
3. Provide insights about their knowledge distribution
4. Answer questions about their content
5. Suggest connections between notes across pillars

When referencing notes, mention their title and pillar. Be concise, friendly, and helpful.
Use emojis sparingly for pillar references (🌱 Health, 💎 Wealth, 📚 Wisdom).`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: userMessage },
  ];

  return await callOpenAI(messages, { temperature: 0.5 });
}

// ── Fallback keyword-based categorization (no API key) ────────
export function fallbackCategorize(
  content: string,
  filename: string
): CategorizeResult {
  const text = `${filename} ${content}`.toLowerCase();

  const healthKeywords = ['workout', 'nutrition', 'sleep', 'health', 'therapy', 'meditation', 'fitness', 'recipe', 'diet', 'wellness', 'exercise', 'yoga', 'gym', 'meal', 'cooking', 'recovery', 'habits', 'routine', 'doctor', 'medical'];
  const wealthKeywords = ['career', 'salary', 'investment', 'stock', 'business', 'income', 'budget', 'project', 'work', 'meeting', 'startup', 'savings', 'expense', 'money', 'finance', 'crypto', 'portfolio', 'job'];
  const wisdomKeywords = ['learn', 'tutorial', 'course', 'book', 'philosophy', 'creative', 'idea', 'design', 'code', 'programming', 'art', 'writing', 'reading', 'study', 'knowledge', 'skill', 'pattern'];

  const hScore = healthKeywords.filter((k) => text.includes(k)).length;
  const wScore = wealthKeywords.filter((k) => text.includes(k)).length;
  const sScore = wisdomKeywords.filter((k) => text.includes(k)).length;

  let pillar: Pillar = 'wisdom';
  if (hScore > wScore && hScore > sScore) pillar = 'health';
  else if (wScore > sScore) pillar = 'wealth';

  return {
    pillar,
    category: PILLARS[pillar].categories[0],
    tags: [],
    title: filename.replace(/\.[^/.]+$/, '') || 'Untitled',
    summary: content.substring(0, 200),
  };
}
