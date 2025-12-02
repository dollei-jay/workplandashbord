import React, { useState } from 'react';
import { ViewMode } from '../types';
import { 
  GanttChart, 
  BrainCircuit, 
  Building2, 
  Undo2, 
  Redo2, 
  Printer, 
  Save, 
  Download,
  FileCode,
  FileJson,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

interface ToolbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  title: string;
  onTitleChange: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (type: 'html' | 'pdf' | 'json') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentView,
  onViewChange,
  title,
  onTitleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="bg-dashboard-card backdrop-blur-md border-b border-white/50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50 no-print shadow-sm">
      
      {/* Brand & Title */}
      <div className="flex-1 w-full md:w-auto flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 text-white">
           <LayoutDashboard size={20} />
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">Project Dashboard</span>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-lg font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-400 w-full md:w-64"
              placeholder="输入项目名称..."
            />
        </div>
      </div>

      {/* View Switcher - Pill Style */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50 backdrop-blur-sm">
        <button
          onClick={() => onViewChange('gantt')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentView === 'gantt' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
          }`}
        >
          <GanttChart size={16} />
          <span>进度计划</span>
        </button>
        <button
          onClick={() => onViewChange('mindmap')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentView === 'mindmap' 
              ? 'bg-white text-purple-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
          }`}
        >
          <BrainCircuit size={16} />
          <span>思维导图</span>
        </button>
        <button
          onClick={() => onViewChange('building')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentView === 'building' 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
          }`}
        >
          <Building2 size={16} />
          <span>单体详情</span>
        </button>
      </div>

      {/* Tools */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 rounded-lg transition-colors"
            title="撤销 (Undo)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 rounded-lg transition-colors"
            title="重做 (Redo)"
          >
            <Redo2 size={18} />
          </button>
        </div>
        
        {/* Separator */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            onBlur={() => setTimeout(() => setShowExportMenu(false), 200)}
            className="flex items-center gap-2 bg-white/50 hover:bg-white border border-slate-200 hover:border-blue-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Download size={16} className="text-blue-500" />
            <span>导出</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-xl overflow-hidden z-[60] p-1">
              <button 
                onClick={() => onExport('html')}
                className="w-full text-left px-3 py-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg flex items-center gap-2 text-sm transition-colors"
              >
                <FileCode size={14} className="text-blue-500" /> HTML 文件
              </button>
              <button 
                onClick={() => onExport('pdf')}
                className="w-full text-left px-3 py-2 text-slate-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg flex items-center gap-2 text-sm transition-colors"
              >
                <Printer size={14} className="text-purple-500" /> PDF 文档
              </button>
              <button 
                onClick={() => onExport('json')}
                className="w-full text-left px-3 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg flex items-center gap-2 text-sm transition-colors"
              >
                <FileJson size={14} className="text-emerald-500" /> JSON 数据
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;