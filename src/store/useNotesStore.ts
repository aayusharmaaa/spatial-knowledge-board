/**
 * Zustand store for managing notes data
 */

import { create } from 'zustand';
import type { Note, Category } from '@/types';
import { generateMockNotes, generateMockCategories } from '@/data/mockData';

interface NotesStore {
  notes: Note[];
  categories: Category[];
  isLoading: boolean;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  loadMockData: () => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  categories: [],
  isLoading: false,

  setNotes: (notes) => {
    const categories = generateMockCategories(notes);
    set({ notes, categories });
  },

  addNote: (note) => {
    const notes = [...get().notes, note];
    const categories = generateMockCategories(notes);
    set({ notes, categories });
  },

  updateNote: (id, updates) => {
    const notes = get().notes.map((note) =>
      note.id === id ? { ...note, ...updates } : note
    );
    const categories = generateMockCategories(notes);
    set({ notes, categories });
  },

  deleteNote: (id) => {
    const notes = get().notes.filter((note) => note.id !== id);
    const categories = generateMockCategories(notes);
    set({ notes, categories });
  },

  getNoteById: (id) => {
    return get().notes.find((note) => note.id === id);
  },

  loadMockData: () => {
    set({ isLoading: true });
    // Generate more notes for better spread
    const mockNotes = generateMockNotes(60);
    const categories = generateMockCategories(mockNotes);
    set({ notes: mockNotes, categories, isLoading: false });
  },
}));
