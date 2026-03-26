/**
 * ScreenshotMap - Space-themed interactive screenshot gallery
 * Features multiple WebGL 3D layouts (Sphere, Cylinder, Grid) and Double-Sided Cards.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { PILLAR_COLORS } from '@/constants/pillars';
import { PILLARS } from '@/types';
import type { Pillar, Note } from '@/types';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ScreenshotMapProps {
  isOpen: boolean;
  onClose: () => void;
}

export type LayoutMode = 'sphere' | 'grid';

// Sphere generator
function getSpherePoints(samples: number, radius: number) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const rBase = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * rBase * radius;
    const z = Math.sin(theta) * rBase * radius;
    const yFinal = y * radius;
    
    points.push(new THREE.Vector3(x, yFinal, z));
  }
  return points;
}



// Flat Grid generator
function getGridPoints(samples: number) {
  const points = [];
  const cols = Math.ceil(Math.sqrt(samples * 1.5));
  const rows = Math.ceil(samples / cols);
  
  const gapX = 6;
  const gapY = 8;
  const startX = -((cols - 1) * gapX) / 2;
  const startY = ((rows - 1) * gapY) / 2;

  for (let i = 0; i < samples; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    points.push(new THREE.Vector3(startX + c * gapX, startY - r * gapY, 0));
  }
  return points;
}

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
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('sphere');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedScreenshot) setSelectedScreenshot(null);
        else onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose, selectedScreenshot]);

  const screenshots = useMemo(() => notes.filter((n) => n.fileType === 'screenshot'), [notes]);
  const filteredScreenshots = useMemo(() => {
    if (activePillar === 'all') return screenshots;
    return screenshots.filter((s) => s.pillar === activePillar);
  }, [screenshots, activePillar]);

  const pillarCounts = useMemo(() => {
    const c: Record<Pillar, number> = { health: 0, wealth: 0, wisdom: 0 };
    screenshots.forEach((s) => c[s.pillar]++);
    return c;
  }, [screenshots]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'radial-gradient(ellipse at 50% 30%, #0c1222, #06080f)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6, 8, 15, 0.85)',
          backdropFilter: 'blur(12px)', zIndex: 5,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '7px 14px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
            fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          ← Back
        </button>

        <span style={{ fontSize: '20px' }}>🌌</span>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>Dimensional Map</span>

        <div style={{ flex: 1 }} />

        {/* View Layout Toggle */}
        <div style={{ display: 'flex', gap: '4px', marginRight: '16px', paddingRight: '16px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <ViewToggleButton label="Sphere" active={layoutMode === 'sphere'} onClick={() => setLayoutMode('sphere')} />
          <ViewToggleButton label="Grid" active={layoutMode === 'grid'} onClick={() => setLayoutMode('grid')} />
        </div>

        {/* Pillar filters */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <PillarFilterButton label="All" count={screenshots.length} isActive={activePillar === 'all'} color="rgba(255,255,255,0.6)" onClick={() => setActivePillar('all')} />
          {(['health', 'wealth', 'wisdom'] as Pillar[]).map((p) => (
            <PillarFilterButton
              key={p} label={`${PILLARS[p].emoji} ${PILLARS[p].name}`} count={pillarCounts[p]}
              isActive={activePillar === p} color={PILLAR_COLORS[p].primary} onClick={() => setActivePillar(p)}
            />
          ))}
        </div>
      </div>

      {/* ── 3D Canvas Area ───────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative' }}>
        {filteredScreenshots.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '64px', opacity: 0.3, marginBottom: '16px' }}>🌌</div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>No nodes detected in this sector</p>
          </div>
        ) : (
          <Canvas camera={{ position: [0, 0, 22], fov: 60 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <Stars radius={150} depth={50} count={6000} factor={5} saturation={0.8} fade speed={1.5} />
            <OrbitControls enableZoom={true} enablePan={true} maxDistance={60} minDistance={2} dampingFactor={0.05} />
            
            {/* The Layout Controller */}
            <ScreenshotCollection items={filteredScreenshots} mode={layoutMode} onSelect={setSelectedScreenshot} />
          </Canvas>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────── */}
      {selectedScreenshot && <ScreenshotDetail note={selectedScreenshot} onClose={() => setSelectedScreenshot(null)} />}
    </div>
  );
}

// ─── Controller for the positions ─────────────────────────────
function ScreenshotCollection({ items, mode, onSelect }: { items: Note[]; mode: LayoutMode; onSelect: (note: Note) => void }) {
  const radius = Math.max(12, Math.sqrt(items.length) * 2.2);

  const positions = useMemo(() => {
    switch (mode) {
      case 'grid': return getGridPoints(items.length);
      case 'sphere':
      default: return getSpherePoints(items.length, radius);
    }
  }, [items.length, radius, mode]);

  return (
    <group>
      {items.map((note, idx) => (
        <ScreenshotNode
          key={note.id}
          note={note}
          targetPosition={positions[idx]}
          layoutMode={mode}
          onClick={() => onSelect(note)}
        />
      ))}
    </group>
  );
}

// ─── Individual Node handling 3D Lerps & Double-sided DOM ────
function ScreenshotNode({ note, targetPosition, layoutMode, onClick }: { note: Note; targetPosition: THREE.Vector3; layoutMode: LayoutMode; onClick: () => void }) {
  const color = PILLAR_COLORS[note.pillar];
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Smoothly lerp to target position and rotation
  useFrame((_state, delta) => {
    if (groupRef.current) {
      const currentPos = groupRef.current.position;

      // Intialize immediately if at origin
      if (currentPos.length() === 0) {
        currentPos.copy(targetPosition);
      } else {
        currentPos.lerp(targetPosition, 5 * delta);
      }

      // Determine outward looking vector based on layout
      const outward = new THREE.Vector3();
      if (layoutMode === 'grid') {
        outward.set(currentPos.x, currentPos.y, currentPos.z + 100);
      } else { // sphere
        outward.copy(currentPos).multiplyScalar(2);
      }

      // Apply lookAt dynamically using quaternions so it's smooth
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(currentPos, outward, new THREE.Vector3(0, 1, 0))
      );
      groupRef.current.quaternion.slerp(targetQuat, 5 * delta);
    }
  });

  return (
    <group ref={groupRef}>
      <Html transform distanceFactor={12} zIndexRange={[100, 0]}>
        {/* Main 3D CSS container for the card */}
        <div style={{
            position: 'relative',
            width: '180px',
            height: '320px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
            transform: hovered ? 'scale(1.08) translateZ(30px)' : 'scale(1) translateZ(0px)',
            cursor: 'pointer',
        }}>
           {/* Front Face (facing outward) */}
           <CardSide note={note} color={color} hovered={hovered} setHovered={setHovered} onClick={onClick} isBack={false} />
           {/* Back Face (facing inward/center) - readable from inside the sphere */}
           <CardSide note={note} color={color} hovered={hovered} setHovered={setHovered} onClick={onClick} isBack={true} />
        </div>
      </Html>
    </group>
  );
}

// ─── Reusable Card Face (Front or Back) ──────────────────────
function CardSide({ note, color, hovered, setHovered, onClick, isBack }: { note: Note; color: { primary: string, secondary: string }; hovered: boolean; setHovered: (v: boolean) => void; onClick: () => void; isBack: boolean }) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: hovered ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: hovered 
          ? `0 20px 40px rgba(0,0,0,0.6), 0 0 0 3px ${color.primary}`
          : `0 8px 16px rgba(0,0,0,0.3)`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        // Invert the rotation for the back side so text is readable
        // Using a small translateZ helps the browser resolve the faces correctly and prevents mirroring/flickering
        transform: isBack 
          ? 'rotateY(180deg) translateZ(1px)' 
          : 'rotateY(0deg) translateZ(1px)',
      }}
    >
      {/* Image or Placeholder area */}
      <div
        style={{
          width: '100%',
          height: '140px',
          background: note.imageUrl 
            ? `url(${note.imageUrl}) center/cover no-repeat` 
            : `linear-gradient(135deg, ${color.primary}15, ${color.secondary}05)`,
          borderRadius: '8px',
          border: `1px solid ${color.primary}30`,
          marginBottom: '16px',
          flexShrink: 0,
        }}
      />
      <h4 style={{
        fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0',
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', lineHeight: '1.4'
      }}>
        {note.title}
      </h4>
    </div>
  );
}

// ─── UI Helper Components ────────────────────────────────────
function ViewToggleButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
        background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.4)',
        border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function PillarFilterButton({
  label, count, isActive, color, onClick,
}: { label: string; count: number; isActive: boolean; color: string; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
        border: `1px solid ${isActive ? color + '50' : 'rgba(255,255,255,0.08)'}`,
        background: isActive ? `${color}18` : 'transparent',
        color: isActive ? color : 'rgba(255,255,255,0.45)',
        transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px',
      }}
    >
      {label}
      <span style={{ opacity: 0.6 }}>({count})</span>
    </button>
  );
}

function ScreenshotDetail({ note, onClose }: { note: Note; onClose: () => void }) {
  const color = PILLAR_COLORS[note.pillar];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2, 4, 10, 0.85)', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'rgba(10, 14, 28, 0.85)', backdropFilter: 'blur(30px)', borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)', maxWidth: '720px', width: '90%', maxHeight: '85vh',
          overflow: 'auto', boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 50px ${color.primary}15`,
          animation: 'fadeScaleUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          style={{
            height: '280px', 
            background: note.imageUrl 
              ? `url(${note.imageUrl}) center/cover no-repeat` 
              : `linear-gradient(135deg, rgba(12,18,36,0.9), ${color.primary}25, ${color.secondary}15)`,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            position: 'relative', 
            borderRadius: '20px 20px 0 0',
          }}
        >
          {!note.imageUrl && (
            <span style={{ fontSize: '72px', opacity: 0.5, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }}>
              {getScreenshotIcon(note.title)}
            </span>
          )}

          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.4)', border: 'none',
              borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              fontSize: '16px', backdropFilter: 'blur(4px)', transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px', lineHeight: 1.3 }}>{note.title}</h2>
          <p style={{ fontSize: '14px', color: 'rgba(226,232,240,0.7)', lineHeight: 1.7, margin: '0 0 20px' }}>{note.content}</p>
        </div>
      </div>
    </div>
  );
}
