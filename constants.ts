import { Department, Template } from './types';

export const APP_STORAGE_KEY = 'easylog_v2_data';
export const USER_STORAGE_KEY = 'easylog_v2_user';
export const TUTORIAL_SEEN_KEY = 'easylog_v2_tutorial_seen';
export const USER_GUIDE_VERSION_KEY = 'easylog_v2_guide_version';
export const CURRENT_USER_GUIDE_VERSION = '2025.12.19';

export const DEPARTMENT_COLORS: Record<Department, string> = {
  [Department.TU_FU]: '#3b82f6', // Blue
  [Department.XUE_FA]: '#10b981', // Emerald
  [Department.XUE_CHU]: '#9b7be6ff', // Violet
  [Department.YE_WU]: '#f59e0b', // Amber
  [Department.CHAN_PIN]: '#ffa7d3ff', // Pink
  [Department.FA_WU]: '#6366f1', // Indigo
  [Department.REN_ZI]: '#bef8c3ff', // Rose
  [Department.ICHEERS]: '#f50c0cff', // Red
  [Department.BOSS]: '#1e293b', // Slate/Black
  [Department.OTHER]: '#6b7280', // Gray
};

export const PRODUCT_LIST = [
  '無', 'AL', 'ABC', 'AE', 'ACI', 'SYMSKAN', 'AS', '灰熊', '書紐'
];

export const DEFAULT_EVENT_TYPES: { id: string, name: string }[] = [
  { id: 'default-1', name: '會議' },
  { id: 'default-2', name: '其他' },
];
