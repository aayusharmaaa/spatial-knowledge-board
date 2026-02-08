/**
 * SearchBar - Space-themed search with results dropdown
 */

import { useState, useCallback, useMemo } from 'react';
import { useViewStore } from '@/store/useViewStore';
import { useNotesStore } from '@/store/useNotesStore';
import { PILLARS } from '@/types';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { setSearchQuery, setActiveView } = useViewStore();
  const { notes } = useNotesStore();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, notes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSearchQuery(e.target.value || undefined);
  };

  const handleResultClick = useCallback(
    (note: (typeof notes)[0]) => {
      setActiveView(note.pillar);
      setQuery('');
      setSearchQuery(undefined);
      setIsFocused(false);
    },
    [setActiveView, setSearchQuery]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      setSearchQuery(undefined);
      setIsFocused(false);
    }
  };

  return (
    <div className="absolute top-4 right-14 z-30">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(8, 12, 24, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <circle cx="7" cy="7" r="4" />
            <path d="M10 10l4 4" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search the cosmos..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e2e8f0',
              fontSize: '13px',
              width: '200px',
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSearchQuery(undefined); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isFocused && results.length > 0 && (
        <div
          className="mt-2 rounded-xl overflow-hidden max-h-80 overflow-y-auto"
          style={{
            background: 'rgba(8, 12, 24, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {results.map((note) => {
            return (
              <button
                key={note.id}
                onClick={() => handleResultClick(note)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>
                  {PILLARS[note.pillar].emoji}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {note.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                    {note.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
