/**
 * Chatbot - Floating AI assistant for organizing/searching notes
 * Uses OpenAI API with full notes context
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNotesStore } from '@/store/useNotesStore';
import { useViewStore } from '@/store/useViewStore';
import { chatWithContext, hasApiKey } from '@/services/llm';
import { PILLAR_COLORS } from '@/constants/pillars';
import { PILLARS } from '@/types';
import type { ChatMessage } from '@/services/llm';
import type { Pillar } from '@/types';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { notes } = useNotesStore();
  const { setActiveView } = useViewStore();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Quick actions that navigate
  const handleQuickAction = useCallback((pillar: Pillar) => {
    setActiveView(pillar);
  }, [setActiveView]);

  // Send message
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);

    if (!hasApiKey()) {
      // Offline search mode
      const results = offlineSearch(text, notes);
      const assistantMsg: ChatMessage = { role: 'assistant', content: results };
      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await chatWithContext(text, notes, messages);
      const assistantMsg: ChatMessage = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to get response';
      setError(msg);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `⚠️ Error: ${msg}. Try again or check your API key in Settings.`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, notes, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Pillar stats
  const pillarCounts = { health: 0, wealth: 0, wisdom: 0 };
  notes.forEach((n) => pillarCounts[n.pillar]++);

  return (
    <>
      {/* Floating Trigger Button (Visible when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 80,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 8px 32px rgba(139,92,246,0.4), 0 0 20px rgba(139,92,246,0.2)',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            animation: 'fadeInUp 0.4s ease both',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
          }}
        >
          🤖
        </button>
      )}

      {/* Permanent Side Chat Panel (Minimizable) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            right: '24px',
            top: '80px',
            bottom: '80px',
            zIndex: 70,
            width: '340px',
            borderRadius: '20px',
            background: 'rgba(8, 12, 24, 0.75)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 16px 60px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease both',
          }}
        >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(139,92,246,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                ThoughtSpace AI
              </span>
              <span style={{
                fontSize: '9px',
                padding: '1px 6px',
                borderRadius: '4px',
                background: hasApiKey() ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: hasApiKey() ? '#10b981' : '#f59e0b',
                marginLeft: '6px',
                fontWeight: 600,
              }}>
                {hasApiKey() ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '6px',
              marginRight: '-4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ fontSize: '36px', opacity: 0.5, marginBottom: '10px' }}>🧠</div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', fontWeight: 500 }}>
                How can I help you?
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: '0 0 16px' }}>
                {hasApiKey()
                  ? 'Ask me about your notes, organization, or anything!'
                  : 'Add an API key in Settings for AI-powered chat. Offline search is available.'}
              </p>

              {/* Quick action chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', margin: '0 0 4px', letterSpacing: '0.5px', fontWeight: 600 }}>
                  QUICK ACTIONS
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {(['health', 'wealth', 'wisdom'] as Pillar[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleQuickAction(p)}
                      style={{
                        padding: '5px 10px', borderRadius: '8px', fontSize: '11px',
                        border: `1px solid ${PILLAR_COLORS[p].primary}30`,
                        background: `${PILLAR_COLORS[p].primary}08`,
                        color: PILLAR_COLORS[p].primary,
                        cursor: 'pointer', fontWeight: 500,
                      }}
                    >
                      {PILLARS[p].emoji} {PILLARS[p].name} ({pillarCounts[p]})
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                  {[
                    'What are my recent notes?',
                    'Suggest connections',
                    'What am I focusing on?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); setTimeout(sendMessage, 50); }}
                      style={{
                        padding: '5px 10px', borderRadius: '8px', fontSize: '10px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isLoading && (
            <div style={{
              display: 'flex', gap: '6px', alignItems: 'center',
              padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
              background: 'rgba(255,255,255,0.03)',
              alignSelf: 'flex-start', maxWidth: '85%',
            }}>
              <span style={{ animation: 'pulse-glow 1.5s ease-in-out infinite', fontSize: '14px' }}>🤖</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: 'rgba(139,92,246,0.5)',
                      animation: `pulse-glow 1s ease-in-out ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasApiKey() ? 'Ask about your notes...' : 'Search your notes...'}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: '#e2e8f0',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              border: 'none',
              background: input.trim() ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
              color: input.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            ↑
          </button>
        </div>

        {error && (
          <div style={{
            padding: '6px 14px', fontSize: '10px', color: '#ef4444',
            background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.1)',
          }}>
            {error}
          </div>
        )}
      </div>
    )}
    </>
  );
}

// ─── Message Bubble ───────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser
          ? 'rgba(139,92,246,0.2)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isUser ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)'}`,
        animation: 'fadeInUp 0.2s ease',
      }}
    >
      <p style={{
        fontSize: '13px',
        color: isUser ? '#e2e8f0' : 'rgba(226,232,240,0.8)',
        margin: 0,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {message.content}
      </p>
    </div>
  );
}

// ─── Offline Search (no API key) ──────────────────────────────
function offlineSearch(query: string, notes: { title: string; content: string; pillar: Pillar; category: string }[]): string {
  const q = query.toLowerCase();

  // Check for pillar-specific queries
  const pillarMentioned = (['health', 'wealth', 'wisdom'] as Pillar[]).find((p) =>
    q.includes(p) || q.includes(PILLARS[p].name.toLowerCase())
  );

  let results = notes;
  if (pillarMentioned) {
    results = results.filter((n) => n.pillar === pillarMentioned);
  }

  // Text search
  const matches = results.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    // Try word-level matching
    const words = q.split(/\s+/).filter((w) => w.length > 2);
    const wordMatches = results.filter((n) => {
      const text = `${n.title} ${n.content} ${n.category}`.toLowerCase();
      return words.some((w) => text.includes(w));
    });

    if (wordMatches.length === 0) {
      return `No notes found matching "${query}". Try different keywords or add an API key in Settings for smarter search.`;
    }

    return `Found ${wordMatches.length} related note${wordMatches.length > 1 ? 's' : ''}:\n\n` +
      wordMatches.slice(0, 5).map((n) =>
        `• **${n.title}** (${PILLARS[n.pillar].emoji} ${n.category})`
      ).join('\n');
  }

  return `Found ${matches.length} note${matches.length > 1 ? 's' : ''} matching "${query}":\n\n` +
    matches.slice(0, 5).map((n) =>
      `• **${n.title}** (${PILLARS[n.pillar].emoji} ${n.category})`
    ).join('\n') +
    (matches.length > 5 ? `\n\n...and ${matches.length - 5} more.` : '');
}
