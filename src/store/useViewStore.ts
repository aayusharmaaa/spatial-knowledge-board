/**
 * Zustand store for managing view state (active view, selection, search)
 */

import { create } from 'zustand';
import type { ZoomLevel } from '@/types';
import type { Pillar } from '@/types';

type ActiveView = 'overview' | Pillar;

interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNoteId?: string;
  searchQuery?: string;
  activeView: ActiveView;
}

interface ViewStore extends ViewState {
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  adjustZoom: (delta: number, center?: { x: number; y: number }) => void;
  setSelectedNote: (noteId?: string) => void;
  setSearchQuery: (query?: string) => void;
  getZoomLevel: () => ZoomLevel;
  setActiveView: (view: ActiveView) => void;
  resetView: () => void;
}

const INITIAL_ZOOM = 50;
const MIN_ZOOM = 20;
const MAX_ZOOM = 120;

export const useViewStore = create<ViewStore>((set, get) => ({
  zoom: INITIAL_ZOOM,
  pan: { x: 0, y: 0 },
  selectedNoteId: undefined,
  searchQuery: undefined,
  activeView: 'overview',

  setZoom: (zoom) =>
    set({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) }),

  setPan: (pan) => set({ pan }),

  adjustZoom: (delta) => {
    const currentZoom = get().zoom;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + delta));
    set({ zoom: newZoom });
  },

  setSelectedNote: (noteId) => set({ selectedNoteId: noteId }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setActiveView: (view) => set({ activeView: view }),

  getZoomLevel: (): ZoomLevel => {
    const zoom = get().zoom;
    if (zoom < 35) return 1;
    if (zoom < 60) return 2;
    if (zoom < 90) return 3;
    return 4;
  },

  resetView: () =>
    set({
      zoom: INITIAL_ZOOM,
      pan: { x: 0, y: 0 },
      selectedNoteId: undefined,
      searchQuery: undefined,
      activeView: 'overview',
    }),
}));
