import { Task, UserProfile } from '../types';
import { APP_STORAGE_KEY, USER_STORAGE_KEY } from '../constants';

export const StorageService = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(APP_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load tasks", e);
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(tasks));
  },

  getUser: (): UserProfile | null => {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveUser: (user: UserProfile) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  clearUser: () => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  exportToCSV: (tasks: Task[]) => {
    // BOM for Excel to recognize UTF-8
    const BOM = "\uFEFF"; 
    const headers = ['日期', '部門', '事件類型', '產品別 (選填)', '內容描述', '時數', '建立時間'];
    
    const rows = tasks.map(t => [
      t.date,
      t.department,
      t.eventType,
      t.product || '',
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.hours.toFixed(2),
      new Date(t.timestamp).toISOString()
    ]);

    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `work_log_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
