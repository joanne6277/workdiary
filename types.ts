export enum Department {
  TU_FU = '圖服',
  XUE_FA = '學發',
  XUE_CHU = '學出',
  YE_WU = '業務',
  CHAN_PIN = '產品',
  ICHEERS = '佳釀'
  BOSS = '老闆本人'
}

export enum EventType {
  MEETING = '會議',
  CONSULTING = '諮詢'
}

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  department: Department;
  eventType: EventType;
  product?: string; // Optional
  description: string;
  hours: number;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  id: string;
  isAuthenticated: boolean;
}

export interface Template {
  id: string;
  label: string;
  department: Department;
  eventType: EventType;
  defaultProduct?: string;
  defaultHours: number;
  defaultDescription: string;
  icon: string;
}
