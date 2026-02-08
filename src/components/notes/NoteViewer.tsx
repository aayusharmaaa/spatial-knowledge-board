/**
 * NoteViewer - Space-themed full-screen modal for reading a note
 */

import { useEffect } from 'react';
import { PILLAR_COLORS } from '@/constants/pillars';
import { PILLARS } from '@/types';
import type { Note } from '@/types';

interface NoteViewerProps {
  note: Note;
  onClose: () => void;
}

export function NoteViewer({ note, onClose }: NoteViewerProps) {
  const color = PILLAR_COLORS[note.pillar];
  const pillarData = PILLARS[note.pillar];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const date = new Date(note.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 4, 10, 0.75)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'rgba(12, 18, 36, 0.95)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '640px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 40px ${color.primary}08`,
          animation: 'slideUp 0.3s ease',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 28px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  background: `${color.primary}18`,
                  color: color.primary,
                  fontWeight: 600,
                }}
              >
                {pillarData.emoji} {pillarData.name}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>›</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                {note.category}
              </span>
            </div>

            <h1
              style={{
                color: '#f1f5f9',
                fontSize: '22px',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {note.title}
            </h1>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '6px 10px',
              borderRadius: '8px',
              lineHeight: 1,
              flexShrink: 0,
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none'; }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          <p
            style={{
              color: 'rgba(226, 232, 240, 0.85)',
              fontSize: '15px',
              lineHeight: 1.8,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {note.content}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 28px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>📅 {date}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>📝 {note.fileType.toUpperCase()}</span>
            {note.metadata.wordCount && (
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>📖 {note.metadata.wordCount} words</span>
            )}
          </div>

          {note.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: `${color.primary}15`,
                    color: color.primary,
                    fontWeight: 600,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
