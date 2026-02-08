/**
 * DragDropZone - Invisible overlay that detects file drops anywhere on canvas
 */

import { useState, useCallback } from 'react';
import { FileUploader } from '@/components/notes/FileUploader';

export function DragDropZone() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only hide if we're leaving the window
    if (e.clientX === 0 && e.clientY === 0) {
      setIsDragging(false);
    }
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ pointerEvents: isDragging ? 'auto' : 'none' }}
      />
      {isDragging && (
        <FileUploader isOpen={true} onClose={() => setIsDragging(false)} />
      )}
    </>
  );
}
