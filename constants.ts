import { Department, Template } from './types';

export const APP_STORAGE_KEY = 'easylog_v2_data';
export const USER_STORAGE_KEY = 'easylog_v2_user';

export const DEPARTMENT_COLORS: Record<Department, string> = {
  [Department.TU_FU]: '#3b82f6', // Blue
  [Department.XUE_FA]: '#10b981', // Emerald
  [Department.XUE_CHU]: '#8b5cf6', // Violet
  [Department.YE_WU]: '#f59e0b', // Amber
  [Department.CHAN_PIN]: '#ec4899', // Pink
  [Department.ICHEERS]: '#411414ff', // Slate/Dark Red
  [Department.BOSS]: '#1e293b', // Slate/Black
};

export const PRODUCT_LIST = [
  'AL', 'ABC', 'AE', 'ACI', 'SYMSKAN', 'AS', '灰熊', '書紐'
];

export const DEFAULT_EVENT_TYPES: {id: string, name: string}[] = [
  { id: 'default-1', name: '會議' },
  { id: 'default-2', name: '其他' },
];
