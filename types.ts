export interface GanttTask {
  id: string | number;
  text: string;
  start_date: string;
  duration: number;
  progress?: number;
  parent?: string | number;
  type?: string;
  open?: boolean;
  color?: string;
  details?: string;
  remarks?: string;
  end_date?: string;
}

export interface GanttLink {
  id: string | number;
  source: string | number;
  target: string | number;
  type: string;
}

export interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

export interface BuildingItem {
  id: string | number;
  depot: string;
  name: string;
  size: string;
  note: string;
}

export interface AppState {
  ganttData: GanttData;
  buildingData: BuildingItem[];
  projectTitle: string;
}

export type ViewMode = 'gantt' | 'mindmap' | 'building';

// Global type augmentation for external libraries
declare global {
  interface Window {
    gantt: any;
    jsMind: any;
  }
}