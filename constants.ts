import { Department, EventType, Template } from './types';

export const APP_STORAGE_KEY = 'easylog_v2_data';
export const USER_STORAGE_KEY = 'easylog_v2_user';

export const DEPARTMENT_COLORS: Record<Department, string> = {
  [Department.TU_FU]: '#3b82f6', // Blue
  [Department.XUE_FA]: '#10b981', // Emerald
  [Department.XUE_CHU]: '#8b5cf6', // Violet
  [Department.YE_WU]: '#f59e0b', // Amber
  [Department.CHAN_PIN]: '#ec4899', // Pink
  [Department.ICHEERS]: '#1e293b', // Slate/Black
  [Department.BOSS]: '#1e293b', // Slate/Black
};

export const PRODUCT_LIST = [
  'AL', 'ABC', 'AE', 'ACI', 'SYMSKAN', 'AS', '灰熊', '書紐'
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 't1',
    label: '學發會議',
    department: Department.XUE_FA,
    eventType: EventType.MEETING,
    defaultHours: 1.0,
    defaultDescription: '例行進度同步',
    icon: 'Users'
  },
  {
    id: 't2',
    label: '業務諮詢',
    department: Department.YE_WU,
    eventType: EventType.CONSULTING,
    defaultHours: 0.5,
    defaultDescription: '客戶需求確認',
    icon: 'HelpCircle'
  },
  {
    id: 't3',
    label: '產品討論',
    department: Department.CHAN_PIN,
    eventType: EventType.MEETING,
    defaultHours: 1.5,
    defaultDescription: '規格確認',
    icon: 'Code'
  },
  {
    id: 't4',
    label: '圖服支援',
    department: Department.TU_FU,
    eventType: EventType.CONSULTING,
    defaultHours: 0.25,
    defaultDescription: '素材調整',
    icon: 'Bug'
  }
];