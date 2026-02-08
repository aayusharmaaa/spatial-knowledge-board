/**
 * FileUploader - Enhanced upload with LLM-powered auto-categorization
 * Supports drag-and-drop for notes & screenshots with AI tagging
 */

import { useCallback, useState, useRef } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import type { Note, Pillar } from '@/types';
import { PILLARS } from '@/types';
import { PILLAR_COLORS } from '@/constants/pillars';
import {
  categorizeContent,
  fallbackCategorize,
  hasApiKey,
} from '@/services/llm';
import { generateMasonryLayout } from '@/utils/layoutUtils';

interface FileUploaderProps {
  onClose?: () => void;
  isOpen?: boolean;
}

interface UploadItem {
  file: File;
  status: 'pending' | 'reading' | 'categorizing' | 'done' | 'error';
  result?: {
    pillar: Pillar;
    category: string;
    tags: string[];
    title: string;
    summary: string;
  };
  error?: string;
  content?: string;
}

function getFileIcon(file: File): string {
  if (file.type.startsWith('image/')) return '🖼️';
  if (file.type === 'application/pdf') return '📄';
  if (file.name.endsWith('.md')) return '📝';
  return '📃';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUploader({ onClose, isOpen = true }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNote } = useNotesStore();

  // Read file contents
  const readFileContent = async (file: File): Promise<{ content: string; fileType: Note['fileType'] }> => {
    if (file.type.startsWith('image/')) {
      // For images: try to get any text from filename, in future use OCR
      return {
        content: `Screenshot: ${file.name}. Image file uploaded for visual reference.`,
        fileType: 'screenshot',
      };
    }
    if (file.type === 'application/pdf') {
      // For PDFs: in future use pdf.js
      return {
        content: `PDF Document: ${file.name}. PDF content would be extracted here.`,
        fileType: 'pdf',
      };
    }
    if (file.name.endsWith('.md')) {
      const text = await file.text();
      return { content: text, fileType: 'markdown' };
    }
    const text = await file.text();
    return { content: text, fileType: 'text' };
  };

  // Add files to queue
  const addFiles = useCallback((files: File[]) => {
    const validFiles = files.filter((f) => {
      const ext = f.name.toLowerCase();
      return (
        ext.endsWith('.txt') || ext.endsWith('.md') || ext.endsWith('.pdf') ||
        ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') ||
        ext.endsWith('.webp') || ext.endsWith('.gif')
      );
    });

    const newItems: UploadItem[] = validFiles.map((file) => ({
      file,
      status: 'pending',
    }));

    setItems((prev) => [...prev, ...newItems]);
  }, []);

  // Process all pending items
  const processAll = useCallback(async () => {
    setIsProcessing(true);
    const pendingIndices = items
      .map((item, i) => (item.status === 'pending' ? i : -1))
      .filter((i) => i >= 0);

    for (const idx of pendingIndices) {
      // Step 1: Read file
      setItems((prev) =>
        prev.map((item, i) => (i === idx ? { ...item, status: 'reading' } : item))
      );

      try {
        const { content, fileType } = await readFileContent(items[idx].file);

        // Step 2: Categorize with LLM or fallback
        setItems((prev) =>
          prev.map((item, i) =>
            i === idx ? { ...item, status: 'categorizing', content } : item
          )
        );

        let result;
        if (hasApiKey()) {
          try {
            result = await categorizeContent(content, items[idx].file.name, fileType);
          } catch {
            // Fallback on API error
            result = fallbackCategorize(content, items[idx].file.name);
          }
        } else {
          result = fallbackCategorize(content, items[idx].file.name);
        }

        // Step 3: Create note & add to store
        const existingNotes = useNotesStore.getState().notes;
        const positions = generateMasonryLayout(existingNotes.length + 1, 5000, 4000, 280, 200, 40);
        const position = positions[existingNotes.length] || { x: 0, y: 0 };

        const newNote: Note = {
          id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          title: result.title,
          content: result.summary || content.substring(0, 1000),
          originalFile: items[idx].file,
          fileType,
          createdAt: new Date(),
          updatedAt: new Date(),
          embedding: [],
          pillar: result.pillar,
          category: result.category,
          tags: fileType === 'screenshot' ? ['screenshot', ...result.tags] : result.tags,
          position,
          metadata: {
            wordCount: content.split(' ').length,
            source: 'upload',
          },
        };

        addNote(newNote);

        setItems((prev) =>
          prev.map((item, i) =>
            i === idx ? { ...item, status: 'done', result } : item
          )
        );
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setItems((prev) =>
          prev.map((item, i) =>
            i === idx ? { ...item, status: 'error', error: errorMessage } : item
          )
        );
      }
    }

    setIsProcessing(false);
  }, [items, addNote]);

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  // Handle file input
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files));
      }
      e.target.value = '';
    },
    [addFiles]
  );

  // Remove item
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear completed
  const clearDone = () => {
    setItems((prev) => prev.filter((item) => item.status !== 'done'));
  };

  if (!isOpen) return null;

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 4, 10, 0.75)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose?.(); }}
    >
      <div
        style={{
          background: 'rgba(12, 18, 36, 0.95)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '560px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>📎</span>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Upload Notes & Screenshots
              </h2>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
                {hasApiKey() ? '🤖 AI auto-tagging enabled' : '⚡ Using keyword categorization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer', fontSize: '18px', padding: '4px 8px', borderRadius: '8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Drop zone */}
        <div
          style={{
            margin: '16px 20px',
            padding: '32px 20px',
            borderRadius: '14px',
            border: `2px dashed ${isDragging ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
            background: isDragging ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
            textAlign: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '36px', marginBottom: '10px', opacity: 0.6 }}>
            {isDragging ? '✨' : '📁'}
          </div>
          <p style={{ fontSize: '14px', color: isDragging ? '#a78bfa' : 'rgba(255,255,255,0.6)', fontWeight: 500, margin: '0 0 6px' }}>
            {isDragging ? 'Drop your files here!' : 'Drag & drop files or click to browse'}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            .txt, .md, .pdf, .png, .jpg, .jpeg, .webp, .gif
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.webp,.gif"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>

        {/* File list */}
        {items.length > 0 && (
          <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.5px' }}>
                {items.length} FILE{items.length > 1 ? 'S' : ''}
              </span>
              {doneCount > 0 && (
                <button
                  onClick={clearDone}
                  style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.3)', background: 'none',
                    border: 'none', cursor: 'pointer', textDecoration: 'underline',
                  }}
                >
                  Clear completed
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '12px' }}>
              {items.map((item, i) => (
                <UploadItemCard key={i} item={item} onRemove={() => removeItem(i)} />
              ))}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div style={{
          padding: '14px 20px 18px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
            {doneCount > 0 && `${doneCount} processed`}
            {doneCount > 0 && pendingCount > 0 && ' · '}
            {pendingCount > 0 && `${pendingCount} pending`}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              disabled={isProcessing}
              style={{
                padding: '9px 18px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                opacity: isProcessing ? 0.4 : 1,
              }}
            >
              {doneCount > 0 && pendingCount === 0 ? 'Done' : 'Cancel'}
            </button>
            {pendingCount > 0 && (
              <button
                onClick={processAll}
                disabled={isProcessing}
                style={{
                  padding: '9px 22px', borderRadius: '10px', border: 'none',
                  background: isProcessing ? 'rgba(139,92,246,0.3)' : '#8b5cf6',
                  color: '#fff', cursor: isProcessing ? 'default' : 'pointer',
                  fontSize: '13px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {isProcessing ? (
                  <>
                    <span style={{ animation: 'orbit 1s linear infinite', display: 'inline-block' }}>⚡</span>
                    Processing...
                  </>
                ) : (
                  <>🚀 Process {pendingCount} file{pendingCount > 1 ? 's' : ''}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual upload item card ──────────────────────────────
function UploadItemCard({ item, onRemove }: { item: UploadItem; onRemove: () => void }) {
  const statusConfig = {
    pending: { icon: '⏳', text: 'Pending', color: 'rgba(255,255,255,0.3)' },
    reading: { icon: '📖', text: 'Reading...', color: '#60a5fa' },
    categorizing: { icon: '🤖', text: 'AI Categorizing...', color: '#a78bfa' },
    done: { icon: '✅', text: 'Categorized', color: '#10b981' },
    error: { icon: '❌', text: 'Failed', color: '#ef4444' },
  };

  const st = statusConfig[item.status];

  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${item.status === 'done' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.2s',
      }}
    >
      {/* File icon */}
      <span style={{ fontSize: '20px', flexShrink: 0 }}>{getFileIcon(item.file)}</span>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '12px', fontWeight: 600, color: '#e2e8f0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {item.file.name}
          </span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
            {formatSize(item.file.size)}
          </span>
        </div>

        {/* Status / Result */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
          <span style={{ fontSize: '10px', color: st.color }}>
            {st.icon} {st.text}
          </span>

          {item.result && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '9px', padding: '1px 6px', borderRadius: '4px',
                background: `${PILLAR_COLORS[item.result.pillar].primary}15`,
                color: PILLAR_COLORS[item.result.pillar].primary,
                fontWeight: 600,
              }}>
                {PILLARS[item.result.pillar].emoji} {item.result.pillar}
              </span>
              <span style={{
                fontSize: '9px', padding: '1px 6px', borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)',
              }}>
                {item.result.category}
              </span>
              {item.result.tags.slice(0, 3).map((tag) => (
                <span key={tag} style={{
                  fontSize: '8px', padding: '1px 5px', borderRadius: '4px',
                  background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.25)',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {item.error && (
            <span style={{ fontSize: '9px', color: '#ef4444' }}>{item.error}</span>
          )}
        </div>
      </div>

      {/* Remove button */}
      {(item.status === 'pending' || item.status === 'done' || item.status === 'error') && (
        <button
          onClick={onRemove}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)',
            cursor: 'pointer', fontSize: '14px', padding: '4px', flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
