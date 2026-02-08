/**
 * Minimap - Space-themed minimap with 3 planet dots and active indicator
 */

import { useNotesStore } from '@/store/useNotesStore';
import { useViewStore } from '@/store/useViewStore';
import { PILLAR_COLORS } from '@/constants/pillars';
import { PILLARS } from '@/types';
import type { Pillar } from '@/types';

export function Minimap() {
  const { notes } = useNotesStore();
  const { activeView, setActiveView } = useViewStore();

  const pillarCounts: Record<Pillar, number> = { health: 0, wealth: 0, wisdom: 0 };
  notes.forEach((n) => pillarCounts[n.pillar]++);
  const total = notes.length || 1;

  // Planet positions on minimap (triangle formation)
  const planetPositions: Record<Pillar, { cx: number; cy: number }> = {
    health: { cx: 40, cy: 55 },
    wealth: { cx: 100, cy: 25 },
    wisdom: { cx: 160, cy: 55 },
  };

  return (
    <div
      className="absolute bottom-4 left-4 z-30 rounded-xl overflow-hidden"
      style={{
        width: '210px',
        background: 'rgba(8, 12, 24, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Mini space map */}
      <div style={{ padding: '12px 12px 6px', position: 'relative' }}>
        <div
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Navigation
        </div>

        <svg width="196" height="76" viewBox="0 0 200 80" style={{ display: 'block' }}>
          {/* Constellation lines */}
          <line x1={planetPositions.health.cx} y1={planetPositions.health.cy} x2={planetPositions.wealth.cx} y2={planetPositions.wealth.cy}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 4" />
          <line x1={planetPositions.wealth.cx} y1={planetPositions.wealth.cy} x2={planetPositions.wisdom.cx} y2={planetPositions.wisdom.cy}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 4" />
          <line x1={planetPositions.health.cx} y1={planetPositions.health.cy} x2={planetPositions.wisdom.cx} y2={planetPositions.wisdom.cy}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2 6" />

          {/* Mini stars */}
          {[
            { x: 15, y: 20 }, { x: 65, y: 10 }, { x: 130, y: 15 },
            { x: 180, y: 30 }, { x: 25, y: 70 }, { x: 85, y: 65 },
            { x: 150, y: 70 }, { x: 50, y: 40 }, { x: 115, y: 45 },
          ].map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r="0.6" fill="rgba(255,255,255,0.2)" />
          ))}

          {/* Planet dots */}
          {(['health', 'wealth', 'wisdom'] as Pillar[]).map((p) => {
            const pos = planetPositions[p];
            const color = PILLAR_COLORS[p].primary;
            const isActive = activeView === p;
            const size = Math.max(4, Math.min(10, (pillarCounts[p] / total) * 18 + 3));

            return (
              <g key={p} style={{ cursor: 'pointer' }} onClick={() => setActiveView(p)}>
                {/* Glow */}
                <circle cx={pos.cx} cy={pos.cy} r={size + 8} fill={color} opacity={isActive ? 0.15 : 0.05} />
                {/* Active ring */}
                {isActive && (
                  <circle cx={pos.cx} cy={pos.cy} r={size + 4} fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
                )}
                {/* Planet */}
                <circle cx={pos.cx} cy={pos.cy} r={size} fill={color} opacity={isActive ? 0.9 : 0.5} />
                {/* Label */}
                <text x={pos.cx} y={pos.cy + size + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="500">
                  {PILLARS[p].name}
                </text>
              </g>
            );
          })}

          {/* Overview indicator */}
          {activeView === 'overview' && (
            <rect x="2" y="2" width="196" height="76" rx="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
          )}
        </svg>
      </div>

      {/* Distribution bar */}
      <div style={{ padding: '6px 12px 10px' }}>
        <div style={{ display: 'flex', gap: '2px', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
          {(['health', 'wealth', 'wisdom'] as Pillar[]).map((p) => (
            <div
              key={p}
              style={{
                width: `${(pillarCounts[p] / total) * 100}%`,
                background: PILLAR_COLORS[p].primary,
                opacity: activeView === p || activeView === 'overview' ? 0.8 : 0.3,
                transition: 'opacity 0.2s',
                borderRadius: '2px',
                minWidth: pillarCounts[p] > 0 ? '6px' : '0',
                cursor: 'pointer',
              }}
              onClick={() => setActiveView(p)}
              title={`${PILLARS[p].name}: ${pillarCounts[p]} notes`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          {(['health', 'wealth', 'wisdom'] as Pillar[]).map((p) => (
            <span key={p} style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
              {pillarCounts[p]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
