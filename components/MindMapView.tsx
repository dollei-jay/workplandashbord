import React, { useEffect, useRef } from 'react';
import { GanttData } from '../types';
import { ZoomIn, ZoomOut, Move, MousePointer2 } from 'lucide-react';

interface MindMapViewProps {
  data: GanttData;
  rootTitle: string;
}

interface JsMindNode {
  id: string;
  topic: string;
  isroot?: boolean;
  parentid?: string;
  direction?: string;
  expanded?: boolean;
  "background-color"?: string;
}

const MindMapView: React.FC<MindMapViewProps> = ({ data, rootTitle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const jmRef = useRef<any>(null);

  useEffect(() => {
    // Guard clause: if ref is null, do not proceed
    if (!containerRef.current) return;
    
    // Guard clause: if library is missing, do not proceed
    if (!window.jsMind) {
        console.error("jsMind library not loaded");
        return;
    }

    const buildTree = () => {
      const mindData: { meta: any; format: string; data: JsMindNode[] } = {
        meta: { name: "ProjectMindMap", author: "ReactApp", version: "1.0" },
        format: "node_array",
        data: [{ id: "root", topic: rootTitle, isroot: true }]
      };

      if (data && data.data) {
        data.data.forEach(task => {
          mindData.data.push({
            id: String(task.id),
            parentid: task.parent ? String(task.parent) : "root",
            topic: `${task.text}`,
            direction: "right",
            expanded: true,
            "background-color": task.color // Use task color if available
          });
        });
      }
      return mindData;
    };

    const options = {
      container: containerRef.current,
      editable: true,
      theme: 'primary',
      support_html: false,
      view: {
        engine: 'canvas', 
        hmargin: 50,
        vmargin: 50,
        line_width: 2,
        line_color: '#cbd5e1', 
        draggable: true
      },
      layout: {
        hspace: 40,
        vspace: 15,
        pspace: 15
      }
    };

    // Clear previous content safely
    if (containerRef.current) {
        containerRef.current.innerHTML = "";
    }

    try {
        jmRef.current = new window.jsMind(options);
        jmRef.current.show(buildTree());
        
        // Auto-Zoom to fit content logic
        jmRef.current.view.setZoom(1); 
        // Force resize to center root
        setTimeout(() => {
             if(jmRef.current) jmRef.current.resize();
        }, 100);

    } catch (e) {
        console.error("Failed to initialize jsMind", e);
    }
    
    // Resize handler
    const handleResize = () => {
        if(jmRef.current) jmRef.current.resize();
    };
    
    if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize);
    }

    // Wheel Zoom Handler
    const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            if(!jmRef.current) return;
            if (e.deltaY < 0) {
                jmRef.current.view.zoomIn();
            } else {
                jmRef.current.view.zoomOut();
            }
        }
    };
    
    // SAFE EVENT LISTENER ATTACHMENT
    const el = containerRef.current;
    if (el && typeof el.addEventListener === 'function') {
        el.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', handleResize);
        }
        // SAFE CLEANUP
        if (el && typeof el.removeEventListener === 'function') {
            el.removeEventListener('wheel', handleWheel);
        }
    };

  }, [data, rootTitle]);

  const handleZoomIn = () => {
      if(jmRef.current) jmRef.current.view.zoomIn();
  };

  const handleZoomOut = () => {
      if(jmRef.current) jmRef.current.view.zoomOut();
  };

  return (
    <div className="relative w-full h-full">
        <div 
          ref={containerRef} 
          id="mindmap-container"
          className="w-full h-full overflow-hidden cursor-move"
          style={{ width: '100%', height: '100%' }}
        ></div>

        <div className="absolute top-4 left-4 pointer-events-none text-slate-500 flex flex-col gap-1 text-xs bg-white/70 p-2 rounded-lg border border-white/50 backdrop-blur-md z-10 shadow-sm">
            <div className="flex items-center gap-2">
                <Move size={14} className="text-blue-500" /> <span>拖拽空白处移动视图</span>
            </div>
            <div className="flex items-center gap-2">
                <MousePointer2 size={14} className="text-purple-500" /> <span>Ctrl+滚轮缩放</span>
            </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-1 bg-white/80 backdrop-blur-md border border-white p-1.5 rounded-xl shadow-lg z-20">
            <button onClick={handleZoomIn} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="放大">
                <ZoomIn size={20} />
            </button>
            <div className="h-px bg-slate-200 mx-1"></div>
            <button onClick={handleZoomOut} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="缩小">
                <ZoomOut size={20} />
            </button>
        </div>
    </div>
  );
};

export default MindMapView;