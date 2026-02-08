/**
 * Mock data generator for ThoughtSpace - Three Pillars framework
 */

import type { Note, Category, Pillar } from '@/types';
import { PILLARS } from '@/types';
import { PILLAR_POSITIONS } from '@/constants/pillars';
import { generateMasonryLayout } from '@/utils/layoutUtils';

// Sample content for each pillar
const HEALTH_CONTENT: Record<string, { title: string; content: string }[]> = {
  'Fitness & Movement': [
    { title: 'Upper Body Workout Routine', content: 'Push-ups, pull-ups, and shoulder presses for a complete upper body workout...' },
    { title: 'Running Form Tips', content: 'Key points: maintain upright posture, land mid-foot, quick cadence...' },
    { title: 'Yoga Flow Sequence', content: 'Sun salutation A and B, warrior poses, and cool-down stretches...' },
    { title: 'Gym Equipment Guide', content: 'How to use resistance bands, kettlebells, and TRX straps effectively...' },
  ],
  'Nutrition & Cooking': [
    { title: 'Meal Prep Sunday Ideas', content: 'Batch cooking chicken, rice, and vegetables for the week ahead...' },
    { title: 'High Protein Breakfast Recipes', content: 'Greek yogurt bowls, protein smoothies, and egg scrambles...' },
    { title: 'Nutritional Benefits of Leafy Greens', content: 'Spinach, kale, and arugula are packed with vitamins and minerals...' },
    { title: 'Healthy Snack Alternatives', content: 'Nuts, seeds, and fruit instead of processed snacks...' },
  ],
  'Mental Wellness': [
    { title: 'Morning Meditation Practice', content: '10-minute breathing exercises to start the day with clarity...' },
    { title: 'Therapy Session Insights', content: 'Understanding patterns in stress responses and coping strategies...' },
    { title: 'Mindfulness Techniques', content: 'Body scan meditation and present-moment awareness exercises...' },
  ],
  'Sleep & Recovery': [
    { title: 'Optimal Sleep Schedule', content: 'Going to bed and waking at consistent times for better rest...' },
    { title: 'Recovery Day Activities', content: 'Light stretching, walking, and hydration for active recovery...' },
  ],
  'Medical & Healthcare': [
    { title: 'Annual Checkup Notes', content: 'Blood work results and doctor recommendations...' },
    { title: 'Health Tracking Metrics', content: 'Blood pressure, heart rate, and other vital signs...' },
  ],
  'Habits & Routines': [
    { title: 'Morning Routine Checklist', content: 'Wake up, hydrate, meditate, exercise, breakfast...' },
    { title: 'Evening Wind-Down Ritual', content: 'Journaling, reading, and preparing for tomorrow...' },
  ],
};

const WEALTH_CONTENT: Record<string, { title: string; content: string }[]> = {
  'Career & Work Projects': [
    { title: 'Q4 Project Roadmap', content: 'Key milestones and deliverables for the upcoming quarter...' },
    { title: 'Meeting Notes - Product Planning', content: 'Discussion about new features and user feedback...' },
    { title: 'Performance Review Goals', content: 'Objectives for professional growth and development...' },
  ],
  'Skills & Professional Development': [
    { title: 'React Advanced Patterns Course', content: 'Learning about hooks, context, and performance optimization...' },
    { title: 'Public Speaking Workshop', content: 'Tips for engaging presentations and handling Q&A...' },
  ],
  'Income & Earnings': [
    { title: 'Salary Negotiation Strategy', content: 'Research on market rates and talking points for review...' },
    { title: 'Passive Income Streams', content: 'Dividend stocks, rental properties, and digital products...' },
  ],
  'Investments & Assets': [
    { title: 'Stock Portfolio Analysis', content: 'Performance review of current holdings and rebalancing strategy...' },
    { title: 'Crypto Investment Research', content: 'Understanding blockchain technology and market trends...' },
  ],
  'Budgeting & Expenses': [
    { title: 'Monthly Budget Template', content: 'Income, fixed expenses, variable costs, and savings goals...' },
    { title: 'Expense Tracking System', content: 'Using apps to monitor spending and identify patterns...' },
  ],
  'Business Ideas & Entrepreneurship': [
    { title: 'SaaS Product Ideas', content: 'Problems to solve and potential solutions in the market...' },
    { title: 'Business Plan Outline', content: 'Executive summary, market analysis, and financial projections...' },
  ],
};

// ── Screenshot content for each pillar ──────────────────────
const SCREENSHOT_CONTENT: Record<Pillar, { title: string; content: string; category: string }[]> = {
  health: [
    { title: 'Fitness App Dashboard', content: 'Weekly workout summary showing 5 sessions completed, 2400 calories burned', category: 'Fitness & Movement' },
    { title: 'Meal Prep Plan Screenshot', content: 'Color-coded weekly meal plan with macros breakdown for cutting phase', category: 'Nutrition & Cooking' },
    { title: 'Sleep Tracker Results', content: 'Sleep cycle analysis showing 7.5h average, 85% sleep quality score', category: 'Sleep & Recovery' },
    { title: 'Recipe - Protein Smoothie', content: 'Banana, whey protein, oats, peanut butter, almond milk recipe card', category: 'Nutrition & Cooking' },
    { title: 'Gym Workout Form Guide', content: 'Proper deadlift form with step-by-step visual instructions', category: 'Fitness & Movement' },
    { title: 'Meditation App Progress', content: '30-day meditation streak, total 450 minutes of mindfulness practice', category: 'Mental Wellness' },
    { title: 'Blood Test Results', content: 'Annual health checkup results - all markers in normal range', category: 'Medical & Healthcare' },
    { title: 'Morning Routine Infographic', content: 'Visual guide for optimal morning routine with time blocks', category: 'Habits & Routines' },
    { title: 'Yoga Pose Reference', content: 'Advanced yoga poses chart with difficulty levels and benefits', category: 'Fitness & Movement' },
    { title: 'Hydration Tracker', content: 'Daily water intake log showing consistent 3L/day for the month', category: 'Habits & Routines' },
  ],
  wealth: [
    { title: 'Stock Portfolio Overview', content: 'Portfolio performance chart showing 12% YTD returns across diversified holdings', category: 'Investments & Assets' },
    { title: 'Monthly Budget Spreadsheet', content: 'Detailed budget breakdown - income vs expenses with savings rate of 35%', category: 'Budgeting & Expenses' },
    { title: 'LinkedIn Job Posting', content: 'Senior developer role at tech company - requirements and salary range', category: 'Career & Work Projects' },
    { title: 'Business Model Canvas', content: 'SaaS product business model with revenue streams and cost structure', category: 'Business Ideas & Entrepreneurship' },
    { title: 'Crypto Watchlist', content: 'Top 10 cryptocurrency prices and 7-day performance chart', category: 'Investments & Assets' },
    { title: 'Salary Comparison Data', content: 'Market salary data for software engineers across different cities', category: 'Income & Earnings' },
    { title: 'Project Gantt Chart', content: 'Q1 project timeline with milestones, dependencies, and deadlines', category: 'Career & Work Projects' },
    { title: 'Course Completion Certificate', content: 'AWS Solutions Architect certification completion screenshot', category: 'Skills & Professional Development' },
    { title: 'Expense Tracking App', content: 'Monthly spending categories - food, transport, entertainment breakdown', category: 'Budgeting & Expenses' },
    { title: 'Startup Pitch Deck Slide', content: 'Problem-solution slide from investor pitch deck presentation', category: 'Business Ideas & Entrepreneurship' },
  ],
  wisdom: [
    { title: 'Code Architecture Diagram', content: 'Microservices architecture with event bus, API gateway, and databases', category: 'Technical Learning' },
    { title: 'Book Highlights - Atomic Habits', content: 'Key passages highlighted from James Clear Atomic Habits chapter 4', category: 'Books & Reading' },
    { title: 'UI Design Mockup', content: 'Figma mockup of new dashboard design with dark mode variant', category: 'Creative Projects' },
    { title: 'Algorithm Complexity Chart', content: 'Big-O notation comparison chart for common data structures', category: 'Technical Learning' },
    { title: 'Tutorial - React Hooks', content: 'Step-by-step tutorial screenshot showing useEffect cleanup patterns', category: 'Technical Learning' },
    { title: 'Reading List for 2025', content: 'Curated reading list with 24 books across fiction, business, and science', category: 'Books & Reading' },
    { title: 'Mind Map - Project Ideas', content: 'Brainstorm mind map with branches for app ideas and side projects', category: 'Random Ideas & Curiosities' },
    { title: 'Productivity System Layout', content: 'Notion workspace setup with GTD methodology and project boards', category: 'Productivity & Systems' },
    { title: 'Design Inspiration Board', content: 'Collection of UI patterns and color palettes for upcoming project', category: 'Creative Projects' },
    { title: 'Philosophy Quotes Collection', content: 'Marcus Aurelius and Seneca quotes on resilience and purpose', category: 'Life Philosophy' },
  ],
};

const WISDOM_CONTENT: Record<string, { title: string; content: string }[]> = {
  'Technical Learning': [
    { title: 'React Hooks Deep Dive', content: 'useState, useEffect, useContext, and custom hooks explained...' },
    { title: 'TypeScript Design Patterns', content: 'Factory, singleton, and observer patterns in TypeScript...' },
    { title: 'System Design Principles', content: 'Scalability, reliability, and performance considerations...' },
    { title: 'Docker & Kubernetes Guide', content: 'Containerization and orchestration fundamentals...' },
  ],
  'Books & Reading': [
    { title: 'Atomic Habits - Key Takeaways', content: 'Building good habits and breaking bad ones systematically...' },
    { title: 'Sapiens - Book Notes', content: 'History of humankind and the development of societies...' },
  ],
  'Creative Projects': [
    { title: 'Writing Project Ideas', content: 'Short stories, blog posts, and personal essays to develop...' },
    { title: 'Music Production Workflow', content: 'DAW setup, mixing techniques, and sound design...' },
  ],
  'Life Philosophy': [
    { title: 'Personal Values Reflection', content: 'What matters most: family, growth, contribution, authenticity...' },
    { title: 'Life Lessons Learned', content: 'Insights from experiences and mistakes that shaped perspective...' },
  ],
  'Productivity & Systems': [
    { title: 'GTD Method Implementation', content: 'Getting Things Done workflow for task management...' },
    { title: 'Note-Taking System Design', content: 'Organizing information for easy retrieval and connection...' },
  ],
  'Random Ideas & Curiosities': [
    { title: 'Random Discovery: Quantum Computing', content: 'Fascinating article about quantum entanglement...' },
    { title: 'Shower Thought: Language', content: 'How do different languages shape how we think?...' },
  ],
};

/**
 * Generate mock notes distributed across three pillars
 */
export function generateMockNotes(count: number = 60): Note[] {
  const notes: Note[] = [];
  const allContent: Record<string, { title: string; content: string }[]> = {
    ...HEALTH_CONTENT,
    ...WEALTH_CONTENT,
    ...WISDOM_CONTENT,
  };

  // Generate masonry grid positions for all notes
  const positions = generateMasonryLayout(count, 5000, 4000, 280, 180, 40);

  let noteIndex = 0;
  const pillars: Pillar[] = ['health', 'wealth', 'wisdom'];

  for (const pillar of pillars) {
    const pillarData = PILLARS[pillar];
    const notesPerPillar = Math.floor(count / 3);

    for (let i = 0; i < notesPerPillar && noteIndex < count; i++) {
      const categoryIndex = i % pillarData.categories.length;
      const category = pillarData.categories[categoryIndex];

      const categoryContent = allContent[category] || [];
      const contentItem = categoryContent[i % Math.max(1, categoryContent.length)] || {
        title: `${category} Note ${i + 1}`,
        content: `Content for ${category}...`,
      };

      const position = positions[noteIndex] || {
        x: (noteIndex % 10) * 320 - 1600,
        y: Math.floor(noteIndex / 10) * 220 - 1100,
      };

      notes.push({
        id: `note-${noteIndex + 1}`,
        title: contentItem.title,
        content: contentItem.content,
        fileType: noteIndex % 3 === 0 ? 'markdown' : noteIndex % 3 === 1 ? 'text' : 'screenshot',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        embedding: [],
        pillar,
        category,
        tags: noteIndex % 5 === 0 ? ['important'] : noteIndex % 7 === 0 ? ['reference'] : [],
        position,
        metadata: {
          wordCount: contentItem.content.split(' ').length,
          source: 'manual',
        },
      });

      noteIndex++;
    }
  }

  // ── Add dedicated screenshot notes ──────────────────────────
  for (const pillar of pillars) {
    const screenshots = SCREENSHOT_CONTENT[pillar];
    for (let i = 0; i < screenshots.length; i++) {
      const ss = screenshots[i];
      noteIndex++;
      notes.push({
        id: `screenshot-${pillar}-${i + 1}`,
        title: ss.title,
        content: ss.content,
        fileType: 'screenshot',
        createdAt: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        embedding: [],
        pillar,
        category: ss.category,
        tags: i % 4 === 0 ? ['important', 'screenshot'] : ['screenshot'],
        position: { x: 0, y: 0 },
        metadata: {
          wordCount: ss.content.split(' ').length,
          source: 'screenshot',
        },
      });
    }
  }

  return notes;
}

/**
 * Generate categories from notes (organized by pillar)
 */
export function generateMockCategories(notes: Note[]): Category[] {
  const categoryMap = new Map<string, Category>();

  Object.entries(PILLARS).forEach(([pillarKey, pillarData]) => {
    pillarData.categories.forEach((categoryName, index) => {
      const categoryId = `${pillarKey}-${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
      const pillarPos = PILLAR_POSITIONS[pillarKey as Pillar];
      const angle = (index / pillarData.categories.length) * Math.PI * 2;
      const radius = 600;

      categoryMap.set(categoryId, {
        id: categoryId,
        name: categoryName,
        pillar: pillarKey as Pillar,
        noteCount: 0,
        position: {
          x: pillarPos.x + Math.cos(angle) * radius,
          y: pillarPos.y + Math.sin(angle) * radius,
        },
        notes: [],
        lastUpdated: undefined,
      });
    });
  });

  notes.forEach((note) => {
    const categoryId = `${note.pillar}-${note.category.toLowerCase().replace(/\s+/g, '-')}`;
    const category = categoryMap.get(categoryId);
    if (category) {
      category.noteCount++;
      category.notes.push(note);
      if (!category.lastUpdated || note.updatedAt > category.lastUpdated) {
        category.lastUpdated = note.updatedAt;
      }
    }
  });

  return Array.from(categoryMap.values());
}
