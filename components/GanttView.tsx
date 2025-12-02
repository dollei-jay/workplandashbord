import React, { useEffect, useRef, useState } from 'react';
import { GanttData } from '../types';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface GanttViewProps {
  data: GanttData;
  onDataChange: (newData: GanttData) => void;
}

const GanttView: React.FC<GanttViewProps> = ({ data, onDataChange }) => {
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [zoomLevel, setZoomLevel] = useState<string>('day');

  // Zoom Configuration
  const setZoom = (level: string) => {
    const gantt = window.gantt;
    if (!gantt) return;

    switch (level) {
      case "day":
        gantt.config.scale_unit = "day";
        gantt.config.date_scale = "%d";
        gantt.config.subscales = [{ unit: "month", step: 1, date: "%Y年%m月" }];
        gantt.config.scale_height = 50;
        gantt.config.min_column_width = 40;
        break;
      case "week":
        gantt.config.scale_unit = "week";
        gantt.config.date_scale = "%W周";
        gantt.config.subscales = [
            { unit: "month", step: 1, date: "%Y年%m月" },
            { unit: "day", step: 1, date: "%D" }
        ];
        gantt.config.scale_height = 50;
        gantt.config.min_column_width = 30;
        break;
      case "month":
        gantt.config.scale_unit = "month";
        gantt.config.date_scale = "%Y年%m月";
        gantt.config.subscales = [];
        gantt.config.scale_height = 50;
        gantt.config.min_column_width = 80;
        break;
      case "quarter":
        gantt.config.scale_unit = "month";
        gantt.config.step = 3;
        gantt.config.date_scale = "%Y年 %M";
        gantt.config.subscales = [
            {unit:"month", step:1, date:"%m月"}
        ];
        gantt.config.scale_height = 50;
        gantt.config.min_column_width = 60;
        break;
      case "year":
        gantt.config.scale_unit = "year";
        gantt.config.date_scale = "%Y年";
        gantt.config.subscales = [
            {unit:"month", step:1, date:"%m月"}
        ];
        gantt.config.scale_height = 50;
        gantt.config.min_column_width = 50;
        break;
    }
    setZoomLevel(level);
    gantt.render();
  };

  useEffect(() => {
    if (!ganttContainerRef.current) return;
    if (!window.gantt) {
        console.error("DHTMLX Gantt library not loaded");
        return;
    }

    const gantt = window.gantt;

    // --- Plugins ---
    gantt.plugins({ 
        tooltip: true, 
        marker: true,
        auto_scheduling: true,
        quick_info: true
    });

    // --- General Config ---
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.row_height = 40;
    gantt.config.bar_height = 24; 
    
    // Resizing & Dragging
    gantt.config.grid_resize = true; 
    gantt.config.autofit = false; 
    gantt.config.fit_tasks = true;
    gantt.config.smart_rendering = true; // Better performance
    
    // CRITICAL for Drag & Drop: Enable these
    gantt.config.order_branch = true; 
    gantt.config.order_branch_free = true;
    gantt.config.sort = false; // Disable auto-sort to allow manual ordering

    // --- Locale - Chinese ---
    gantt.locale.date.month_full = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    gantt.locale.date.day_full = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    gantt.locale.date.day_short = ["日", "一", "二", "三", "四", "五", "六"];
    
    gantt.locale.labels.section_color = "任务颜色";
    gantt.locale.labels.section_details = "详细信息";
    gantt.locale.labels.section_description = "任务名称";
    gantt.locale.labels.new_task = "新任务";

    // --- Columns ---
    const isMobile = window.innerWidth < 768;
    gantt.config.columns = [
      { name: "wbs", label: "序号", width: 50, template: gantt.getWBSCode, resize: true, align: "center" },
      { name: "text", label: "任务名称", tree: true, width: 260, resize: true, min_width: 150, editor: { type: "text", map_to: "text" } }
    ];

    if (!isMobile) {
      gantt.config.columns.push(
        { name: "start_date", label: "开始时间", width: 90, align: "center", resize: true, editor: { type: "date", map_to: "start_date" } },
        { name: "duration", label: "工期", width: 60, align: "center", resize: true, editor: { type: "number", map_to: "duration" } }
      );
    }
    gantt.config.columns.push({ name: "add", label: "", width: 44 });

    // --- Today Marker ---
    try {
        gantt.addMarker({
            start_date: new Date(), 
            css: "today-line", 
            text: "今天",
            title: "当前时间: " + gantt.date.date_to_str("%Y-%m-%d")(new Date())
        });
    } catch(e) {
        console.warn("Could not add today marker", e);
    }

    // --- Tooltip Template (Works for Timeline AND Grid) ---
    // Force tooltip to show on grid (Tree column) area
    try {
        if (gantt.ext && gantt.ext.tooltips) {
          gantt.ext.tooltips.tooltipFor({
              selector: ".gantt_tree_content", // Selector for task text in grid
              html: function(event: any, node: any) {
                  if (!node) return null;
                  const row = node.closest("[data-task-id]");
                  if (!row) return null;
                  const taskId = row.getAttribute("data-task-id");
                  if(taskId && gantt.isTaskExists(taskId)){
                      const task = gantt.getTask(taskId);
                      return gantt.templates.tooltip_text(task.start_date, task.end_date, task);
                  }
                  return null;
              }
          });
        }
    } catch (e) {
        console.warn("Failed to initialize tooltips for grid", e);
    }

    gantt.templates.tooltip_text = function(start: Date, end: Date, task: any){
      const dateStr = gantt.date.date_to_str("%Y-%m-%d");
      return `
        <div style="padding: 12px; width: 100%; box-sizing: border-box;">
          <div style="font-size: 10px; color: #3b82f6; letter-spacing: 1px; margin-bottom: 4px; font-weight: 800; text-transform: uppercase;">任务详情</div>
          <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 8px; line-height: 1.4; word-break: break-all; white-space: normal;">${task.text}</div>
          
          <div style="display: flex; gap: 10px; margin-bottom: 8px;">
            <div style="background: rgba(59, 130, 246, 0.1); padding: 4px 8px; border-radius: 4px; flex-shrink: 0;">
               <div style="font-size: 9px; color: #64748b; font-weight: 600;">开始日期</div>
               <div style="color: #334155; font-size: 11px; font-family: monospace; font-weight: 600;">${dateStr(start)}</div>
            </div>
            <div style="background: rgba(59, 130, 246, 0.1); padding: 4px 8px; border-radius: 4px; flex-shrink: 0;">
               <div style="font-size: 9px; color: #64748b; font-weight: 600;">工期</div>
               <div style="color: #334155; font-size: 11px; font-family: monospace; font-weight: 600;">${task.duration} 天</div>
            </div>
          </div>

          ${task.details ? `<div style="font-size: 12px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 8px; word-break: break-all; white-space: normal; line-height: 1.4;">${task.details}</div>` : ""}
        </div>
      `;
    };

    // --- Lightbox Config ---
    const colors = [
      { key: "#3b82f6", label: "静谧蓝 (Blue)" },
      { key: "#60a5fa", label: "天空蓝 (Sky)" },
      { key: "#34d399", label: "薄荷绿 (Mint)" },
      { key: "#a78bfa", label: "香芋紫 (Iris)" },
      { key: "#f472b6", label: "樱花粉 (Pink)" },
      { key: "#fbbf24", label: "暖阳橙 (Amber)" },
      { key: "#94a3b8", label: "高级灰 (Slate)" }
    ];

    gantt.config.lightbox.sections = [
      { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
      { name: "details", height: 60, map_to: "details", type: "textarea" },
      { name: "color", height: 30, map_to: "color", type: "select", options: colors },
      { name: "time", type: "duration", map_to: "auto" }
    ];

    // Initialize
    if (ganttContainerRef.current) {
        gantt.init(ganttContainerRef.current);
    }
    
    // Initial Load
    try {
        gantt.clearAll();
        gantt.parse(JSON.parse(JSON.stringify(data)));
    } catch(e) {
        console.error("Failed to parse Gantt data", e);
    }
    
    setZoom("day");

    // Event Handling
    const handleDataUpdate = () => {
      // Flag that update comes from DHTMLX, so useEffect doesn't double-fire
      isUpdatingRef.current = true; 
      const newData = gantt.serialize();
      onDataChange(newData);
      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    };

    const events = [
      gantt.attachEvent("onAfterTaskAdd", handleDataUpdate),
      gantt.attachEvent("onAfterTaskDelete", handleDataUpdate),
      gantt.attachEvent("onAfterTaskUpdate", handleDataUpdate),
      gantt.attachEvent("onAfterLinkAdd", handleDataUpdate),
      gantt.attachEvent("onAfterLinkDelete", handleDataUpdate),
      // Drag Events
      gantt.attachEvent("onAfterTaskDrag", handleDataUpdate),
      gantt.attachEvent("onRowDragEnd", handleDataUpdate) 
    ];

    return () => {
      events.forEach(id => gantt.detachEvent(id));
      // Do NOT clearAll here if unmounting to keep state during fast tabs switches, 
      // but usually good practice. For now, we clear to be safe.
      gantt.clearAll();
    };
  }, []); // Only run once on mount

  // Sync data props - Fixes the "Re-render Loop" that breaks Drag and Drop
  useEffect(() => {
    // If we are currently dragging or updating from internal DHTMLX event, SKIP re-parsing
    if (isUpdatingRef.current) return;
    if (!window.gantt) return;

    const currentGanttData = window.gantt.serialize();
    // Only re-parse if data is ACTUALLY different (deep comparison needed or JSON stringify)
    if (JSON.stringify(currentGanttData) !== JSON.stringify(data)) {
        // Save scroll position
        const scrollTop = window.gantt.getScrollState().y;
        
        try {
            window.gantt.clearAll();
            window.gantt.parse(JSON.parse(JSON.stringify(data)));
            // Restore scroll
            window.gantt.scrollTo(null, scrollTop);
        } catch(e) {
            console.error("Failed to update Gantt data", e);
        }
    }
  }, [data]);

  const handleZoomIn = () => {
      const levels = ['year', 'quarter', 'month', 'week', 'day'];
      const idx = levels.indexOf(zoomLevel);
      if(idx < levels.length - 1) setZoom(levels[idx + 1]);
  };

  const handleZoomOut = () => {
      const levels = ['year', 'quarter', 'month', 'week', 'day'];
      const idx = levels.indexOf(zoomLevel);
      if(idx > 0) setZoom(levels[idx - 1]);
  };

  return (
    <div className="relative w-full h-full">
        {/* Main Chart Container - Height 100% to fill parent */}
        <div 
          ref={ganttContainerRef} 
          className="w-full h-full"
          style={{ height: '100%', width: '100%' }}
        ></div>
        
        {/* Zoom Controls Floating Panel - High Z-Index */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-1 bg-white/80 backdrop-blur-md border border-white p-1.5 rounded-xl shadow-lg z-[9999]">
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

export default GanttView;