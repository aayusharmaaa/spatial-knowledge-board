/**
 * ActionButtons - Space-themed Upload, Screenshot Map, and Settings buttons
 */

import { useState } from 'react';
import { FileUploader } from '@/components/notes/FileUploader';
import { ScreenshotMap } from '@/components/screenshots/ScreenshotMap';
import { SettingsPanel } from '@/components/ui/SettingsPanel';
import { hasApiKey } from '@/services/llm';

const spaceButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '12px',
  background: 'rgba(8, 12, 24, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
  color: 'rgba(255,255,255,0.7)',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'color 0.15s, background 0.15s, transform 0.15s',
};

export function ActionButtons() {
  const [showUploader, setShowUploader] = useState(false);
  const [showScreenshotMap, setShowScreenshotMap] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="absolute bottom-4 right-4 flex gap-2 z-30">
        {/* Settings */}
        <button
          onClick={() => setShowSettings(true)}
          style={{
            ...spaceButtonStyle,
            position: 'relative',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = ''; }}
        >
          <span>⚙️</span>
          <span>Settings</span>
          {!hasApiKey() && (
            <span style={{
              position: 'absolute', top: '-3px', right: '-3px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.5)',
            }} />
          )}
        </button>

        {/* Upload */}
        <button
          onClick={() => setShowUploader(true)}
          style={spaceButtonStyle}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = ''; }}
        >
          <span>📎</span>
          <span>Upload</span>
        </button>

        {/* Screenshots */}
        <button
          onClick={() => setShowScreenshotMap(true)}
          style={spaceButtonStyle}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = ''; }}
        >
          <span>📸</span>
          <span>Screenshots</span>
        </button>
      </div>

      {showUploader && (
        <FileUploader isOpen={true} onClose={() => setShowUploader(false)} />
      )}

      {showScreenshotMap && (
        <ScreenshotMap isOpen={showScreenshotMap} onClose={() => setShowScreenshotMap(false)} />
      )}

      {showSettings && (
        <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
