/**
 * SettingsPanel - Configure OpenAI API key and model
 */

import { useState, useEffect } from 'react';
import { getApiKey, setApiKey, getModel, setModel, hasApiKey } from '@/services/llm';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & cheap)' },
  { id: 'gpt-4o', label: 'GPT-4o (Best quality)' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fastest)' },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [key, setKey] = useState('');
  const [model, setModelState] = useState('gpt-4o-mini');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKey(getApiKey());
      setModelState(getModel());
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    setApiKey(key.trim());
    setModel(model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(2, 4, 10, 0.75)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'rgba(12, 18, 36, 0.95)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxWidth: '480px',
          width: '90%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          animation: 'slideUp 0.3s ease',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>⚙️</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Settings</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer', fontSize: '18px', padding: '4px 8px', borderRadius: '8px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            ✕
          </button>
        </div>

        {/* API Key */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', letterSpacing: '0.5px' }}>
            OpenAI API Key
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: '#e2e8f0',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>
            Your key is stored locally in your browser. Never sent anywhere except OpenAI.
          </p>
        </div>

        {/* Model Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', letterSpacing: '0.5px' }}>
            Model
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModelState(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${model === m.id ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  background: model === m.id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                  color: model === m.id ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  border: `2px solid ${model === m.id ? '#8b5cf6' : 'rgba(255,255,255,0.15)'}`,
                  background: model === m.id ? '#8b5cf6' : 'transparent',
                  flexShrink: 0,
                }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div style={{
          padding: '12px 14px',
          borderRadius: '10px',
          background: hasApiKey() ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${hasApiKey() ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '14px' }}>{hasApiKey() ? '✅' : '⚠️'}</span>
          <span style={{ fontSize: '12px', color: hasApiKey() ? '#10b981' : '#f59e0b' }}>
            {hasApiKey()
              ? 'API key configured. LLM features are active.'
              : 'No API key set. Upload will use keyword-based categorization.'}
          </span>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 24px', borderRadius: '10px',
              border: 'none',
              background: saved ? '#10b981' : '#8b5cf6',
              color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              transition: 'background 0.2s',
            }}
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
