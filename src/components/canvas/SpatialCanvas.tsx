/**
 * SpatialCanvas - Space-themed two-level view
 *   1) Overview: 3 planet-like pillar orbs floating in space
 *   2) Pillar view: clean masonry grid of notes, scrollable
 */

import { useEffect, useMemo, useState } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useViewStore } from '@/store/useViewStore';
import { useThemeStore } from '@/store/useThemeStore';
import { PILLAR_COLORS } from '@/constants/pillars';
import { PILLARS } from '@/types';
import { NoteViewer } from '@/components/notes/NoteViewer';
import type { Pillar, Note } from '@/types';

// ── Generate random stars ─────────────────────────────────────
function generateStars(count: number, seed: number = 42) {
  const stars: { x: number; y: number; size: number; delay: number; duration: number }[] = [];
  let rng = seed;
  const next = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: next() * 100,
      y: next() * 100,
      size: next() * 1.8 + 0.4,
      delay: next() * 6,
      duration: next() * 4 + 2,
    });
  }
  return stars;
}

const STARS = generateStars(180);

// ── Starfield Background ──────────────────────────────────────
function Starfield() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Deep space gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #0c1222 0%, #06080f 70%)',
        }}
      />
      {/* Nebula glow */}
      <div
        className="absolute"
        style={{
          width: '600px',
          height: '600px',
          top: '10%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse-glow 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '500px',
          height: '500px',
          bottom: '15%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse-glow 10s ease-in-out infinite 2s',
        }}
      />
      {/* Stars */}
      {STARS.map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            background: '#ffffff',
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}

export function SpatialCanvas() {
  const { notes, loadMockData } = useNotesStore();
  const { activeView, setActiveView } = useViewStore();
  const { theme } = useThemeStore();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (notes.length === 0) loadMockData();
  }, [notes.length, loadMockData]);

  useEffect(() => {
    setFilterCategory(null);
  }, [activeView]);

  // Navigate with warp transition
  const navigateTo = (view: 'overview' | Pillar) => {
    setTransitioning(true);
    setTimeout(() => {
      setActiveView(view);
      setTransitioning(false);
    }, 300);
  };

  const pillarNotes = useMemo(() => {
    if (activeView === 'overview') return [];
    let filtered = notes.filter((n) => n.pillar === activeView);
    if (filterCategory) {
      filtered = filtered.filter((n) => n.category === filterCategory);
    }
    return filtered;
  }, [notes, activeView, filterCategory]);

  const categories = useMemo(() => {
    if (activeView === 'overview') return [];
    return PILLARS[activeView].categories;
  }, [activeView]);

  const counts = useMemo(() => {
    const c: Record<Pillar, number> = { health: 0, wealth: 0, wisdom: 0 };
    notes.forEach((n) => c[n.pillar]++);
    return c;
  }, [notes]);

  // ─── OVERVIEW: 3 planet orbs ────────────────────────────────
  if (activeView === 'overview') {
    return (
      <div
        className="w-full h-full relative overflow-hidden"
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'scale(1.1)' : 'scale(1)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        <Starfield />

        {/* Constellation lines between planets */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1, width: '100%', height: '100%' }}
        >
          <line x1="30%" y1="50%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="50%" y1="50%" x2="70%" y2="50%" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="30%" y1="50%" x2="70%" y2="50%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="2 12" />
        </svg>

        {/* 3 planet orbs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '100px',
            padding: '40px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {(['health', 'wealth', 'wisdom'] as Pillar[]).map((pillar, idx) => (
            <PlanetOrb
              key={pillar}
              pillar={pillar}
              count={counts[pillar]}
              idx={idx}
              onClick={() => navigateTo(pillar)}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── PILLAR VIEW: masonry notes in space ────────────────────
  const activeColor = PILLAR_COLORS[activeView];

  return (
    <>
      <div
        className="w-full h-full relative flex flex-col"
        style={{
          animation: 'warp-in 0.4s ease both',
        }}
      >
        <Starfield />

        {/* Pillar nebula accent */}
        <div
          className="fixed pointer-events-none"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: '300px',
            background: `linear-gradient(to bottom, ${activeColor.primary}08, transparent)`,
            zIndex: 1,
          }}
        />

        {/* Category filter chips */}
        <div
          className="relative px-6 pt-[68px] pb-2"
          style={{ flexShrink: 0, zIndex: 10 }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Back button */}
            <button
              onClick={() => navigateTo('overview')}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.7)',
                transition: 'all 0.15s ease',
                marginRight: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              ← All Pillars
            </button>

            <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 4px' }}>|</span>

            <button
              onClick={() => setFilterCategory(null)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${!filterCategory ? activeColor.primary + '60' : 'rgba(255,255,255,0.08)'}`,
                background: !filterCategory ? `${activeColor.primary}20` : 'rgba(255,255,255,0.03)',
                color: !filterCategory ? activeColor.primary : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s ease',
              }}
            >
              All ({notes.filter((n) => n.pillar === activeView).length})
            </button>
            {categories.map((cat) => {
              const catCount = notes.filter(
                (n) => n.pillar === activeView && n.category === cat
              ).length;
              const isActive = filterCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(isActive ? null : cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: `1px solid ${isActive ? activeColor.primary + '60' : 'rgba(255,255,255,0.08)'}`,
                    background: isActive ? `${activeColor.primary}20` : 'rgba(255,255,255,0.03)',
                    color: isActive ? activeColor.primary : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat} ({catCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood board grid of notes */}
        <div
          className="relative flex-1 overflow-y-auto px-6 pb-20"
          style={{ scrollBehavior: 'smooth', zIndex: 5 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gridAutoRows: '10px',
              gap: '14px',
              maxWidth: '1500px',
              margin: '0 auto',
              padding: '20px 0',
            }}
          >
            {pillarNotes.map((note, i) => (
              <SpaceNoteCard
                key={note.id}
                note={note}
                index={i}
                pillarColor={activeColor.primary}
                onClick={() => setSelectedNote(note)}
              />
            ))}
          </div>

          {pillarNotes.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '14px',
              }}
            >
              No notes in this category yet.
            </div>
          )}
        </div>
      </div>

      {selectedNote && (
        <NoteViewer note={selectedNote} onClose={() => setSelectedNote(null)} />
      )}
    </>
  );
}

// ─── Planet Orb ───────────────────────────────────────────────
function PlanetOrb({
  pillar,
  count,
  idx,
  onClick,
}: {
  pillar: Pillar;
  count: number;
  idx: number;
  onClick: () => void;
}) {
  const data = PILLARS[pillar];
  const color = PILLAR_COLORS[pillar];

  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '20px',
        animation: `fadeInUp 0.6s ease ${idx * 0.15}s both`,
      }}
    >
      {/* Planet */}
      <div
        style={{
          position: 'relative',
          width: '180px',
          height: '180px',
        }}
      >
        {/* Outer glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: '-20px',
            borderRadius: '50%',
            border: `1px solid ${color.primary}15`,
            animation: `orbit 20s linear infinite ${idx * 3}s`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              left: '50%',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: color.primary,
              boxShadow: `0 0 6px ${color.primary}`,
            }}
          />
        </div>

        {/* Planet body */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${color.primary}35, ${color.secondary}15 60%, ${color.primary}08 100%)`,
            border: `1.5px solid ${color.primary}25`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.4s ease, box-shadow 0.4s ease',
            boxShadow: `
              0 0 40px ${color.primary}15,
              0 0 80px ${color.primary}08,
              inset 0 0 30px ${color.primary}10
            `,
            animation: `float 6s ease-in-out ${idx * 0.8}s infinite`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = `
              0 0 60px ${color.primary}30,
              0 0 120px ${color.primary}15,
              inset 0 0 40px ${color.primary}15
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `
              0 0 40px ${color.primary}15,
              0 0 80px ${color.primary}08,
              inset 0 0 30px ${color.primary}10
            `;
          }}
        >
          <span style={{ fontSize: '36px', marginBottom: '4px', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}>
            {data.emoji}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.5px' }}>
            {data.name}
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '3px' }}>
            {count} notes
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Card size variants for mood board ────────────────────────
// Varied row spans create organic sizing
function getCardVariant(index: number) {
  const variants = [
    { rowSpan: 15, clamp: 3, featured: false },   // standard
    { rowSpan: 12, clamp: 2, featured: false },   // compact
    { rowSpan: 18, clamp: 5, featured: true },    // tall / featured
    { rowSpan: 14, clamp: 3, featured: false },   // standard-alt
    { rowSpan: 11, clamp: 1, featured: false },   // minimal
    { rowSpan: 16, clamp: 4, featured: false },   // medium-tall
    { rowSpan: 20, clamp: 6, featured: true },    // hero
  ];
  return variants[index % variants.length];
}

// Slight rotation for organic mood board feel
function getCardRotation(index: number) {
  const rotations = [0.6, -0.4, 0.8, -0.6, 0.3, -0.9, 0.5, -0.3, 0];
  return rotations[index % rotations.length];
}

// ─── Space Note Card ──────────────────────────────────────────
function SpaceNoteCard({
  note,
  index,
  pillarColor,
  onClick,
}: {
  note: Note;
  index: number;
  pillarColor: string;
  onClick: () => void;
}) {
  const date = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const variant = getCardVariant(index);
  const rot = getCardRotation(index);

  return (
    <div
      onClick={onClick}
      style={{
        gridRow: `span ${variant.rowSpan}`,
        background: variant.featured
          ? `linear-gradient(160deg, rgba(15,23,42,0.7), ${pillarColor}08)`
          : 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: variant.featured ? '20px 20px' : '14px 16px',
        borderLeft: `3px solid ${pillarColor}40`,
        boxShadow: `0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        animation: `fadeInUp 0.35s ease ${Math.min(index * 0.035, 0.7)}s both`,
        transform: `rotate(${rot}deg)`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'rotate(0deg) translateY(-5px) scale(1.03)';
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.45), 0 0 24px ${pillarColor}12, inset 0 1px 0 rgba(255,255,255,0.06)`;
        e.currentTarget.style.borderLeftColor = pillarColor;
        e.currentTarget.style.zIndex = '10';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rot}deg)`;
        e.currentTarget.style.boxShadow = `0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`;
        e.currentTarget.style.borderLeftColor = `${pillarColor}40`;
        e.currentTarget.style.zIndex = '1';
      }}
    >
      {/* Title */}
      <h3
        style={{
          color: '#f1f5f9',
          fontSize: variant.featured ? '15px' : '13px',
          fontWeight: 600,
          margin: '0 0 6px',
          lineHeight: 1.35,
        }}
      >
        {note.title}
      </h3>

      {/* Content preview */}
      <p
        style={{
          color: 'rgba(148, 163, 184, 0.75)',
          fontSize: '11.5px',
          margin: 0,
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: variant.clamp,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {note.content}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>{date}</span>
        <span
          style={{
            fontSize: '9px',
            padding: '2px 7px',
            borderRadius: '8px',
            background: `${pillarColor}12`,
            color: `${pillarColor}bb`,
            fontWeight: 600,
          }}
        >
          {note.category.length > 16 ? note.category.substring(0, 14) + '…' : note.category}
        </span>
      </div>

      {note.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
          {note.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '9px',
                padding: '1px 6px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
