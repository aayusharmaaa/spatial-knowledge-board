/**
 * Main App component - ThoughtSpace: Health, Wealth & Wisdom
 */

import { SpatialCanvas } from '@/components/canvas/SpatialCanvas';
import { DragDropZone } from '@/components/canvas/DragDropZone';
import { Minimap } from '@/components/ui/Minimap';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SearchBar } from '@/components/ui/SearchBar';
import { QuickJump } from '@/components/ui/QuickJump';
import { ActionButtons } from '@/components/ui/ActionButtons';
import { Chatbot } from '@/components/chat/Chatbot';

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <DragDropZone />
      <SpatialCanvas />
      <Breadcrumbs />
      <SearchBar />
      <QuickJump />
      <ActionButtons />
      <Minimap />
      <Chatbot />
    </div>
  );
}

export default App;
