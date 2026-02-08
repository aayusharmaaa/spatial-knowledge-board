/**
 * Constants for the three pillars framework
 */

import type { Pillar } from '@/types';

export const PILLAR_COLORS: Record<Pillar, { primary: string; secondary: string; gradient: [string, string] }> = {
  health: {
    primary: '#10b981', // emerald green
    secondary: '#06b6d4', // cyan
    gradient: ['#10b981', '#06b6d4'],
  },
  wealth: {
    primary: '#f59e0b', // amber
    secondary: '#eab308', // yellow
    gradient: ['#f59e0b', '#eab308'],
  },
  wisdom: {
    primary: '#8b5cf6', // purple
    secondary: '#6366f1', // indigo
    gradient: ['#8b5cf6', '#6366f1'],
  },
};

export const PILLAR_POSITIONS: Record<Pillar, { x: number; y: number }> = {
  health: { x: -600, y: 0 }, // Left
  wealth: { x: 0, y: -400 }, // Center-top (triangle formation)
  wisdom: { x: 600, y: 0 }, // Right
};

/**
 * Keywords that indicate which pillar a note belongs to
 */
export const PILLAR_KEYWORDS: Record<Pillar, string[]> = {
  health: [
    'workout', 'nutrition', 'sleep', 'mental health', 'therapy', 'meditation',
    'fitness', 'recipe', 'diet', 'wellness', 'stress', 'anxiety', 'doctor',
    'exercise', 'yoga', 'running', 'gym', 'meal prep', 'cooking', 'recovery',
    'habits', 'routine', 'self-care', 'health', 'medical',
  ],
  wealth: [
    'career', 'salary', 'investment', 'stock', 'business', 'income', 'budget',
    'project', 'work', 'meeting', 'freelance', 'startup', 'savings', 'expense',
    'job', 'interview', 'promotion', 'portfolio', 'crypto', 'real estate',
    'earnings', 'revenue', 'profit', 'money', 'finance',
  ],
  wisdom: [
    'learn', 'tutorial', 'course', 'book', 'philosophy', 'creative', 'idea',
    'design', 'code', 'programming', 'art', 'writing', 'reflection', 'insight',
    'reading', 'study', 'education', 'knowledge', 'skill', 'technique',
    'pattern', 'concept', 'theory', 'practice', 'growth',
  ],
};
