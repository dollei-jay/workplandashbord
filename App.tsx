import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ViewMode, GanttData, BuildingItem } from './types';
import { INITIAL_STATE } from './constants';
import Toolbar from './components/Toolbar';
import GanttView from './components/GanttView';
import MindMapView from './components/MindMapView';
import BuildingTable from './components/BuildingTable';

function App() {
  // State History Management
  const [history, setHistory] = useState<AppState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentView, setCurrentView] = useState<ViewMode>('gantt');

  // Derived current state
  const currentState = history[historyIndex];

  // Helper to push new state
  const pushState = useCallback((newState: AppState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      // Limit history stack size to 50
      if (newHistory.length > 50) newHistory.shift();
      return [...newHistory, newState];
    });
    setHistoryIndex(prev => {
      return (historyIndex >= 50) ? 50 : historyIndex + 1;
    });
  }, [historyIndex]);

  // Handlers for specific data updates
  const handleTitleChange = (newTitle: string) => {
    pushState({ ...currentState, projectTitle: newTitle });
  };

  const handleGanttChange = (newData: GanttData) => {
    pushState({ ...currentState, ganttData: newData });
  };

  const handleBuildingChange = (newData: BuildingItem[]) => {
    pushState({ ...currentState, buildingData: newData });
  };

  const handleUndo = () => {
    if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1);
  };

  // Export Functions
  const handleExport = (type: 'html' | 'pdf' | 'json') => {
    const filename = `project_${new Date().toISOString().split('T')[0]}`;
    
    if (type === 'json') {
        const dataStr = JSON.stringify(currentState, null, 2);
        downloadFile(dataStr, `${filename}.json`, 'application/json');
    } else if (type === 'pdf') {
        window.print();
    } else if (type === 'html') {
        exportHtml(filename);
    }
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportHtml = (filename: string) => {
      // Logic remains similar, simplified for brevity in this update
      const legacyTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>${currentState.projectTitle}</title>
    <script src="https://cdn.jsdelivr.net/npm/dhtmlx-gantt@7.1.13/codebase/dhtmlxgantt.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/dhtmlx-gantt@7.1.13/codebase/dhtmlxgantt.css" rel="stylesheet">
    <link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsmind@0.5/style/jsmind.css" />
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jsmind@0.5/js/jsmind.js"></script>
    <style>body{font-family:sans-serif;padding:20px;} #gantt_here{width:100%;height:600px;}</style>
</head>
<body>
    <h1>${currentState.projectTitle}</h1>
    <div id="gantt_here"></div>
    <script>
        const data = ${JSON.stringify(currentState.ganttData)};
        gantt.init("gantt_here");
        gantt.parse(data);
    </script>
</body>
</html>`;
      downloadFile(legacyTemplate, `${filename}_snapshot.html`, 'text/html');
  };

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', handleKeyDown);
        }
    };
  }, [historyIndex, history.length]);

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-700 selection:bg-blue-100 selection:text-blue-900 bg-transparent">
      {/* 1. Header/Toolbar - Fixed Height */}
      <div className="flex-none z-50">
        <Toolbar 
          currentView={currentView}
          onViewChange={setCurrentView}
          title={currentState.projectTitle}
          onTitleChange={handleTitleChange}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExport={handleExport}
        />
      </div>

      {/* 2. Main Content Area - Grows to fill space */}
      <main className="flex-1 relative overflow-hidden flex flex-col w-full h-full p-6 pb-2">
        
        {/* View Container - Takes all available space, handles internal scrolling if needed */}
        <div className="flex-1 w-full h-full relative rounded-2xl bg-dashboard-card backdrop-blur-xl shadow-card border border-white/50 overflow-hidden">
          
          {/* Gantt View */}
          <div className={`absolute inset-0 w-full h-full transition-all duration-300 ${currentView === 'gantt' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
             <div className="print-only mb-4 text-2xl font-bold border-b pb-2 text-black">一、项目进度计划</div>
             <GanttView 
               data={currentState.ganttData} 
               onDataChange={handleGanttChange} 
             />
          </div>

          {/* Mind Map View */}
          <div className={`absolute inset-0 w-full h-full transition-all duration-300 ${currentView === 'mindmap' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
             <div className="print-only mb-4 text-2xl font-bold border-b pb-2 mt-8 text-black">二、任务分解结构</div>
             <MindMapView 
               data={currentState.ganttData} 
               rootTitle={currentState.projectTitle} 
             />
          </div>

          {/* Building Table View */}
          <div className={`absolute inset-0 w-full h-full transition-all duration-300 ${currentView === 'building' ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
             <div className="print-only mb-4 text-2xl font-bold border-b pb-2 mt-8 text-black">三、单体详细情况表</div>
             <BuildingTable 
               data={currentState.buildingData} 
               onChange={handleBuildingChange} 
             />
          </div>
        </div>

        {/* 3. Footer - Fixed at bottom of main area */}
        <footer className="flex-none text-center pt-2 text-xs text-slate-500 font-bold tracking-widest no-print select-none">
            Design by 张东亮 2025
        </footer>
      </main>
    </div>
  );
}

export default App;