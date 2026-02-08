/**
 * QuickJump - Space-themed sidebar for quick navigation
 */

import { useNotesStore } from '@/store/useNotesStore';
import { useViewStore } from '@/store/useViewStore';
import { PILLARS } from '@/types';
import { PILLAR_COLORS } from '@/constants/pillars';
import type { Pillar } from '@/types';

export function QuickJump() {
  const { notes } = useNotesStore();
  const { activeView, setActiveView } = useViewStore();

  if (activeView !== 'overview') return null;

  const pinnedNotes = notes
    .filter((n) => n.tags.includes('important'))
    .slice(0, 5);

  const recentNotes = [...notes]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  return (
    <div
      className="absolute left-4 top-16 w-52 z-20 rounded-xl"
      style={{
        background: 'rgba(8, 12, 24, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        padding: '14px',
      }}
    >
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '12px' }}>
        Quick Jump
      </div>

      {/* Pillars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
        {(['health', 'wealth', 'wisdom'] as Pillar[]).map((pillar) => {
          const data = PILLARS[pillar];
          const color = PILLAR_COLORS[pillar];
          const count = notes.filter((n) => n.pillar === pillar).length;
          return (
            <button
              key={pillar}
              onClick={() => setActiveView(pillar)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${color.primary}12`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{data.emoji}</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>
                  {data.name}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0 10px' }} />

      {/* Pinned */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '6px' }}>
          📌 Pinned
        </div>
        {pinnedNotes.length > 0 ? (
          pinnedNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveView(note.pillar)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.background = 'none';
              }}
              title={note.title}
            >
              {note.title}
            </button>
          ))
        ) : (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', padding: '2px 8px' }}>
            No pinned notes
          </div>
        )}
      </div>

      {/* Recent */}
      <div>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '6px' }}>
          🕐 Recent
        </div>
        {recentNotes.map((note) => (
          <button
            key={note.id}
            onClick={() => setActiveView(note.pillar)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.background = 'none';
            }}
            title={note.title}
          >
            {note.title}
          </button>
        ))}
      </div>
    </div>
  );
}
