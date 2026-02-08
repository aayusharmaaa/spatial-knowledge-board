/**
 * ScreenshotMap - Space-themed interactive screenshot gallery
 * Default: scrollable list of clusters. Zoom: pinch/Ctrl+scroll to zoom out and see all clusters at once.
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { PILLAR_COLORS } from '@/constants/pillars';
import { PILLARS } from '@/types';
import type { Pillar, Note } from '@/types';

interface ScreenshotMapProps {
  isOpen: boolean;
  onClose: () => void;
}

// Seeded random for consistent visuals
function seededRand(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Generate a placeholder gradient for a screenshot
function getScreenshotGradient(pillar: Pillar, index: number) {
  const color = PILLAR_COLORS[pillar];
  const angle = (seededRand(index * 7 + 3) * 360) | 0;
  const r = seededRand(index * 13 + 7);
  const dark1 = r > 0.5 ? '12, 18, 36' : '15, 23, 42';
  return `linear-gradient(${angle}deg, rgba(${dark1}, 0.9), ${color.primary}30, ${color.secondary}20)`;
}

// Placeholder pattern icon for screenshot type
function getScreenshotIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('chart') || t.includes('portfolio') || t.includes('tracker') || t.includes('budget') || t.includes('data')) return '📊';
  if (t.includes('code') || t.includes('algorithm') || t.includes('tutorial') || t.includes('architecture')) return '💻';
  if (t.includes('design') || t.includes('mockup') || t.includes('ui') || t.includes('figma')) return '🎨';
  if (t.includes('book') || t.includes('reading') || t.includes('quote')) return '📖';
  if (t.includes('recipe') || t.includes('meal') || t.includes('food') || t.includes('smoothie')) return '🍳';
  if (t.includes('workout') || t.includes('gym') || t.includes('yoga') || t.includes('fitness')) return '💪';
  if (t.includes('app') || t.includes('dashboard')) return '📱';
  if (t.includes('mind map') || t.includes('brainstorm')) return '🧠';
  if (t.includes('certificate') || t.includes('course')) return '🎓';
  if (t.includes('pitch') || t.includes('business') || t.includes('startup')) return '🚀';
  if (t.includes('sleep') || t.includes('meditation')) return '🧘';
  if (t.includes('blood') || t.includes('medical') || t.includes('health')) return '🏥';
  return '📸';
}

export function ScreenshotMap({ isOpen, onClose }: ScreenshotMapProps) {
  const { notes } = useNotesStore();
  const [activePillar, setActivePillar] = useState<Pillar | 'all'>('all');
  const [selectedScreenshot, setSelectedScreenshot] = useState<Note | null>(null);
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // All screenshots
  const screenshots = useMemo(() => {
    return notes.filter((note) => note.fileType === 'screenshot');
  }, [notes]);

  // Filtered by pillar
  const filteredScreenshots = useMemo(() => {
    if (activePillar === 'all') return screenshots;
    return screenshots.filter((s) => s.pillar === activePillar);
  }, [screenshots, activePillar]);

  // Group by pillar → category
  const clusters = useMemo(() => {
    const grouped: Record<string, { pillar: Pillar; category: string; items: Note[] }> = {};

    filteredScreenshots.forEach((ss) => {
      const key = `${ss.pillar}::${ss.category}`;
      if (!grouped[key]) {
        grouped[key] = { pillar: ss.pillar, category: ss.category, items: [] };
      }
      grouped[key].items.push(ss);
    });

    const pillarOrder: Pillar[] = ['health', 'wealth', 'wisdom'];
    return Object.values(grouped).sort((a, b) => {
      const pi = pillarOrder.indexOf(a.pillar) - pillarOrder.indexOf(b.pillar);
      if (pi !== 0) return pi;
      return a.category.localeCompare(b.category);
    });
  }, [filteredScreenshots]);

  // Stats
  const pillarCounts = useMemo(() => {
    const c: Record<Pillar, number> = { health: 0, wealth: 0, wisdom: 0 };
    screenshots.forEach((s) => c[s.pillar]++);
    return c;
  }, [screenshots]);

  // Attach non-passive wheel listener for Ctrl+scroll zoom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.08 : 0.08;
        setZoom((z) => Math.max(0.3, Math.min(2, z + delta)));
      }
      // Otherwise: let the browser handle normal scroll
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Reset on filter change
  useEffect(() => {
    setZoom(1);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activePillar]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedScreenshot) {
          setSelectedScreenshot(null);
        } else if (zoom !== 1) {
          setZoom(1);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose, selectedScreenshot, zoom]);

  if (!isOpen) return null;

  const isZoomedOut = zoom < 0.85;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'radial-gradient(ellipse at 50% 30%, #0c1222, #06080f)',
        animation: 'fadeIn 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(6, 8, 15, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 5,
        }}
      >
        {/* Back */}
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '7px 14px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          ← Back
        </button>

        <span style={{ fontSize: '20px' }}>🌌</span>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>Screenshot Map</span>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
          {screenshots.length} screenshots · {clusters.length} clusters
        </span>

        <div style={{ flex: 1 }} />

        {/* Pillar filters */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <PillarFilterButton label="All" count={screenshots.length} isActive={activePillar === 'all'} color="rgba(255,255,255,0.6)" onClick={() => setActivePillar('all')} />
          {(['health', 'wealth', 'wisdom'] as Pillar[]).map((p) => (
            <PillarFilterButton
              key={p}
              label={`${PILLARS[p].emoji} ${PILLARS[p].name}`}
              count={pillarCounts[p]}
              isActive={activePillar === p}
              color={PILLAR_COLORS[p].primary}
              onClick={() => setActivePillar(p)}
            />
          ))}
        </div>

        {/* Zoom controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '3px 6px',
            border: `1px solid ${isZoomedOut ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)'}`,
            transition: 'border-color 0.2s',
          }}
        >
          <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))} style={zoomBtnStyle}>−</button>
          <span style={{ fontSize: '10px', color: isZoomedOut ? '#a78bfa' : 'rgba(255,255,255,0.35)', minWidth: '32px', textAlign: 'center', fontWeight: isZoomedOut ? 600 : 400, transition: 'color 0.2s' }}>
            {(zoom * 100).toFixed(0)}%
          </span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} style={zoomBtnStyle}>+</button>
          {zoom !== 1 && (
            <button
              onClick={() => setZoom(1)}
              style={{ ...zoomBtnStyle, fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Zoom hint */}
      {zoom === 1 && screenshots.length > 0 && (
        <div style={{
          textAlign: 'center', padding: '6px', fontSize: '10px',
          color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
        }}>
          Scroll to browse · Pinch or Ctrl+scroll to zoom out and see all clusters
        </div>
      )}

      {/* ── Scrollable & Zoomable Content ─────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: zoom === 1 ? 'auto' : 'auto',
          overflowX: 'hidden',
          position: 'relative',
          scrollBehavior: 'smooth',
        }}
      >
        {/* Stars background */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${seededRand(i * 3 + 100) * 100}%`,
                top: `${seededRand(i * 7 + 200) * 100}%`,
                width: `${seededRand(i * 11 + 300) * 1.5 + 0.3}px`,
                height: `${seededRand(i * 11 + 300) * 1.5 + 0.3}px`,
                borderRadius: '50%',
                background: '#fff',
                opacity: 0.15,
                animation: `twinkle ${seededRand(i * 5 + 400) * 4 + 2}s ease-in-out ${seededRand(i * 9 + 500) * 5}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Zoomable wrapper — scale transforms, scroll still works */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.25s ease',
            padding: '24px 40px 80px',
            minHeight: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {screenshots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '120px 20px' }}>
              <div style={{ fontSize: '64px', opacity: 0.3, marginBottom: '16px' }}>🌌</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>No screenshots captured yet</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', marginTop: '8px' }}>
                Upload screenshots to build your visual map
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isZoomedOut ? '20px' : '40px', transition: 'gap 0.25s ease' }}>
              {clusters.map((cluster, ci) => (
                <ClusterSection
                  key={`${cluster.pillar}-${cluster.category}`}
                  cluster={cluster}
                  clusterIndex={ci}
                  isZoomedOut={isZoomedOut}
                  onSelect={setSelectedScreenshot}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Screenshot Detail Modal ─────────────────────────── */}
      {selectedScreenshot && (
        <ScreenshotDetail
          note={selectedScreenshot}
          onClose={() => setSelectedScreenshot(null)}
        />
      )}
    </div>
  );
}

const zoomBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.45)',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '2px 4px',
};

// ─── Pillar Filter Button ─────────────────────────────────────
function PillarFilterButton({
  label,
  count,
  isActive,
  color,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: '16px',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
        border: `1px solid ${isActive ? color + '50' : 'rgba(255,255,255,0.08)'}`,
        background: isActive ? `${color}18` : 'transparent',
        color: isActive ? color : 'rgba(255,255,255,0.45)',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {label}
      <span style={{ opacity: 0.6 }}>({count})</span>
    </button>
  );
}

// ─── Cluster Section ──────────────────────────────────────────
function ClusterSection({
  cluster,
  clusterIndex,
  isZoomedOut,
  onSelect,
}: {
  cluster: { pillar: Pillar; category: string; items: Note[] };
  clusterIndex: number;
  isZoomedOut: boolean;
  onSelect: (note: Note) => void;
}) {
  const color = PILLAR_COLORS[cluster.pillar];

  return (
    <div
      style={{
        animation: `fadeInUp 0.4s ease ${clusterIndex * 0.06}s both`,
        padding: isZoomedOut ? '14px 18px' : '0',
        borderRadius: isZoomedOut ? '16px' : '0',
        background: isZoomedOut ? `${color.primary}06` : 'transparent',
        border: isZoomedOut ? `1px solid ${color.primary}15` : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Cluster header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isZoomedOut ? '10px' : '16px' }}>
        <div
          style={{
            width: isZoomedOut ? '10px' : '8px',
            height: isZoomedOut ? '10px' : '8px',
            borderRadius: '50%',
            background: color.primary,
            boxShadow: `0 0 ${isZoomedOut ? '12px' : '8px'} ${color.primary}60`,
            transition: 'all 0.25s',
          }}
        />
        <span style={{ fontSize: isZoomedOut ? '12px' : '11px', fontWeight: 700, color: color.primary, letterSpacing: '1px', textTransform: 'uppercase', transition: 'font-size 0.25s' }}>
          {PILLARS[cluster.pillar].emoji} {cluster.pillar}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>›</span>
        <span style={{ fontSize: isZoomedOut ? '14px' : '13px', fontWeight: 600, color: '#e2e8f0', transition: 'font-size 0.25s' }}>
          {cluster.category}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
            padding: '1px 8px',
            borderRadius: '8px',
            background: `${color.primary}10`,
          }}
        >
          {cluster.items.length}
        </span>
      </div>

      {/* Screenshots grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isZoomedOut
            ? 'repeat(auto-fill, minmax(120px, 1fr))'
            : 'repeat(auto-fill, minmax(200px, 1fr))',
          gridAutoRows: isZoomedOut ? '8px' : '10px',
          gap: isZoomedOut ? '8px' : '12px',
          transition: 'all 0.25s ease',
        }}
      >
        {cluster.items.map((ss, i) => (
          <ScreenshotCard
            key={ss.id}
            note={ss}
            index={clusterIndex * 10 + i}
            compact={isZoomedOut}
            onClick={() => onSelect(ss)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Screenshot Card ──────────────────────────────────────────
function ScreenshotCard({
  note,
  index,
  compact,
  onClick,
}: {
  note: Note;
  index: number;
  compact: boolean;
  onClick: () => void;
}) {
  const color = PILLAR_COLORS[note.pillar];
  const icon = getScreenshotIcon(note.title);
  const gradient = getScreenshotGradient(note.pillar, index);

  const variants = compact ? [8, 10, 9, 11, 10, 8, 9, 12] : [14, 18, 15, 20, 16, 13, 17, 22];
  const rowSpan = variants[index % variants.length];
  const rot = (seededRand(index * 17 + 5) - 0.5) * 1.5;

  const date = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      style={{
        gridRow: `span ${rowSpan}`,
        borderRadius: compact ? '10px' : '14px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: `rotate(${rot}deg)`,
        animation: `fadeInUp 0.35s ease ${Math.min(index * 0.04, 0.6)}s both`,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 14, 28, 0.7)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'rotate(0deg) translateY(-5px) scale(1.04)';
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.5), 0 0 20px ${color.primary}15`;
        e.currentTarget.style.zIndex = '10';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rot}deg)`;
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.35)';
        e.currentTarget.style.zIndex = '1';
      }}
    >
      {/* Thumbnail area */}
      <div
        style={{
          flex: 1,
          minHeight: compact ? '50px' : '80px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: compact ? '20px' : '32px', opacity: 0.6, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
          {icon}
        </span>

        {/* Pillar badge — hide when compact */}
        {!compact && (
          <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
            <span
              style={{
                fontSize: '9px',
                padding: '2px 7px',
                borderRadius: '6px',
                background: `${color.primary}30`,
                color: color.primary,
                fontWeight: 700,
                backdropFilter: 'blur(4px)',
              }}
            >
              {PILLARS[note.pillar].emoji} {PILLARS[note.pillar].name}
            </span>
          </div>
        )}

        {/* Date badge */}
        {!compact && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '9px',
              padding: '2px 6px',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.4)',
              color: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {date}
          </span>
        )}
      </div>

      {/* Info area */}
      <div style={{ padding: compact ? '6px 8px' : '10px 12px' }}>
        <h4 style={{
          fontSize: compact ? '10px' : '12px',
          fontWeight: 600,
          color: '#e2e8f0',
          margin: '0 0 2px',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {note.title}
        </h4>

        {!compact && (
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: '0 0 6px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.content}
          </p>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', gap: compact ? '3px' : '4px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: compact ? '7px' : '9px',
              padding: compact ? '0px 4px' : '1px 6px',
              borderRadius: '4px',
              background: `${color.primary}10`,
              color: `${color.primary}bb`,
              fontWeight: 600,
            }}
          >
            {compact
              ? (note.category.length > 12 ? note.category.substring(0, 10) + '…' : note.category)
              : (note.category.length > 18 ? note.category.substring(0, 16) + '…' : note.category)
            }
          </span>
          {!compact && note.tags.filter(t => t !== 'screenshot').map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '8px',
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screenshot Detail View ───────────────────────────────────
function ScreenshotDetail({ note, onClose }: { note: Note; onClose: () => void }) {
  const color = PILLAR_COLORS[note.pillar];
  const icon = getScreenshotIcon(note.title);

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
        background: 'rgba(2, 4, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'rgba(10, 14, 28, 0.95)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '720px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 40px ${color.primary}08`,
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Large preview */}
        <div
          style={{
            height: '280px',
            background: `linear-gradient(135deg, rgba(12,18,36,0.9), ${color.primary}25, ${color.secondary}15)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRadius: '20px 20px 0 0',
          }}
        >
          <span style={{ fontSize: '72px', opacity: 0.5, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }}>
            {icon}
          </span>

          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '10px',
              padding: '8px 12px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              fontSize: '16px', backdropFilter: 'blur(4px)', transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            ✕
          </button>

          <div style={{ position: 'absolute', bottom: '16px', left: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '12px', padding: '4px 12px', borderRadius: '8px',
              background: `${color.primary}25`, color: color.primary, fontWeight: 700,
              backdropFilter: 'blur(4px)', border: `1px solid ${color.primary}30`,
            }}>
              {PILLARS[note.pillar].emoji} {PILLARS[note.pillar].name}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>
            <span style={{
              fontSize: '12px', padding: '4px 12px', borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)',
              fontWeight: 500, backdropFilter: 'blur(4px)',
            }}>
              {note.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px', lineHeight: 1.3 }}>
            {note.title}
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(226,232,240,0.7)', lineHeight: 1.7, margin: '0 0 20px' }}>
            {note.content}
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0',
            borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>📅 {date}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>📸 Screenshot</span>
            {note.metadata.source && (
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>📥 {note.metadata.source}</span>
            )}
          </div>

          {note.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {note.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '6px',
                  background: `${color.primary}15`, color: color.primary, fontWeight: 600,
                }}>
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
