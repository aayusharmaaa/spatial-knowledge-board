/**
 * Breadcrumbs - Space-themed navigation trail
 */

import { useViewStore } from '@/store/useViewStore';
import { useNotesStore } from '@/store/useNotesStore';
import { PILLARS } from '@/types';
import { PILLAR_COLORS } from '@/constants/pillars';

export function Breadcrumbs() {
  const { activeView, resetView } = useViewStore();
  const { notes } = useNotesStore();

  const isOverview = activeView === 'overview';

  return (
    <div
      className="absolute top-4 left-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{
        background: 'rgba(8, 12, 24, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
    >
      <button
        onClick={resetView}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: '#e2e8f0',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#e2e8f0'; }}
      >
        🚀 ThoughtSpace
      </button>

      {!isOverview && (
        <>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '13px' }}>›</span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: PILLAR_COLORS[activeView].primary,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {PILLARS[activeView].emoji} {PILLARS[activeView].name}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginLeft: '2px' }}>
            {notes.filter((n) => n.pillar === activeView).length} notes
          </span>
        </>
      )}

      {isOverview && (
        <>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '13px' }}>›</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            {notes.length} notes across 3 pillars
          </span>
        </>
      )}
    </div>
  );
}
