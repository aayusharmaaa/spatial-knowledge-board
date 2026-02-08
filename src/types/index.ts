/**
 * Core data models for ThoughtSpace - Health, Wealth & Wisdom
 */

export type Pillar = 'health' | 'wealth' | 'wisdom';

export const PILLARS: Record<Pillar, { name: string; emoji: string; categories: string[] }> = {
  health: {
    name: 'Health',
    emoji: '🌱',
    categories: [
      'Fitness & Movement',
      'Nutrition & Cooking',
      'Mental Wellness',
      'Sleep & Recovery',
      'Medical & Healthcare',
      'Habits & Routines',
    ],
  },
  wealth: {
    name: 'Wealth',
    emoji: '💎',
    categories: [
      'Career & Work Projects',
      'Skills & Professional Development',
      'Income & Earnings',
      'Investments & Assets',
      'Budgeting & Expenses',
      'Business Ideas & Entrepreneurship',
    ],
  },
  wisdom: {
    name: 'Wisdom',
    emoji: '📚',
    categories: [
      'Technical Learning',
      'Books & Reading',
      'Creative Projects',
      'Life Philosophy',
      'Productivity & Systems',
      'Random Ideas & Curiosities',
    ],
  },
};

export interface Note {
  id: string;
  title: string;
  content: string; // extracted text
  originalFile?: File; // for screenshots/PDFs
  fileType: 'text' | 'markdown' | 'screenshot' | 'pdf';
  createdAt: Date;
  updatedAt: Date;
  embedding: number[]; // 1536-dim vector from OpenAI
  pillar: Pillar; // Which pillar this note belongs to
  category: string; // Which category within the pillar
  tags: string[];
  position: { x: number; y: number }; // calculated position on canvas
  metadata: {
    wordCount?: number;
    imageOCRConfidence?: number;
    source?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  pillar: Pillar;
  noteCount: number;
  position: { x: number; y: number };
  notes: Note[];
  lastUpdated?: Date;
}

export interface ViewState {
  zoom: number; // 0-100 (percentage)
  pan: { x: number; y: number };
  selectedNoteId?: string;
  searchQuery?: string;
}

export type ZoomLevel = 1 | 2 | 3 | 4;

export interface Cluster {
  id: string;
  name: string;
  notes: Note[];
  position: { x: number; y: number };
  color: string;
  radius: number;
}

export interface Relationship {
  from: string; // note or category id
  to: string;
  strength: number; // 0-1 similarity score
}
