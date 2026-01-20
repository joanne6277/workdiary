import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import {
  Plus, Trash2, LogOut, BarChart2,
  CheckCircle, Calendar, Clock, Grid, Users, Code, Bug, HelpCircle,
  Minus, Tag, X, Save, Download, FileText, FileDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';

import { UserGuideModal } from './components/UserGuideModal';
import { Task, Department, EventType, UserProfile, Template, EventTypeItem } from './types';
import { StorageService } from './services/storageService';
import { SupabaseService } from './supabaseService';
import { DEPARTMENT_COLORS, PRODUCT_LIST, DEFAULT_EVENT_TYPES, TUTORIAL_SEEN_KEY, USER_GUIDE_VERSION_KEY, CURRENT_USER_GUIDE_VERSION } from './constants';
import { Button } from './components/Button';
import { BottomSheet } from './components/BottomSheet';

const DEFAULT_TEMPLATES: Omit<Template, 'id'>[] = [
  {
    label: '合約諮詢',
    department: Department.XUE_FA,
    eventType: '諮詢',
    defaultHours: 0.25,
    defaultDescription: '合約問題諮詢',
    icon: 'Users'
  },
  {
    label: '業務討論',
    eventType: '會議',
    defaultHours: 0.5,
    defaultDescription: '客戶需求確認',
    icon: 'HelpCircle',
    department: Department.TU_FU
  },
  {
    label: '老闆指示',
    department: Department.BOSS,
    eventType: '會議',
    defaultHours: 1,
    defaultDescription: '',
    icon: 'Code'
  },
  {
    label: '學出諮詢',
    department: Department.XUE_CHU,
    eventType: '諮詢',
    defaultHours: 0.5,
    defaultDescription: '',
    icon: 'Bug'
  }
];

const Icon = ({ name, size = 24 }: { name: string, size?: number }) => {
  switch (name) {
    case 'Users':
      return <Users size={size} />;
    case 'HelpCircle':
      return <HelpCircle size={size} />;
    case 'Code':
      return <Code size={size} />;
    case 'Bug':
      return <Bug size={size} />;
    case 'FileText':
      return <FileText size={size} />;
  }
};

const AVAILABLE_ICONS = ['Users', 'HelpCircle', 'Code', 'Bug', 'FileText'];

// --- Auth Component ---
const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={40} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">頂級牛馬a工作紀錄</h1>
          <p className="text-slate-500 mt-2">測試帳號請輸入test(・Д・)ノ</p>
        </div>

        <div className="space-y-4 text-left">
          <label className="block text-sm font-medium text-slate-700">哪位牛馬</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="請輸入姓名"
          />
        </div>

        <Button
          fullWidth
          size="lg"
          disabled={!name.trim()}
          onClick={() => onLogin(name)}
        >
          開始使用
        </Button>
      </div>
    </div>
  );
};// ...

// --- Add Template Form Component ---
const AddTemplateForm = ({ onAdd, eventTypes, templates }: { onAdd: (template: Omit<Template, 'id'>) => void, eventTypes: EventTypeItem[], templates: Template[] }) => {
  const [label, setLabel] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [defaultProduct, setDefaultProduct] = useState('');
  const [defaultHours, setDefaultHours] = useState<number | ''>('');
  const [defaultDescription, setDefaultDescription] = useState('');
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]); // Default to the first icon

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label) {
      alert('請輸入範本名稱');
      return;
    }
    if (!department) {
      alert('請選擇協作部門');
      return;
    }
    if (!eventType) {
      alert('請選擇事件類型');
      return;
    }
    if (templates.length >= 6) {
      alert('最多只能有六個範本');
      return;
    }
    onAdd({
      label,
      department,
      eventType,
      defaultProduct,
      defaultHours: typeof defaultHours === 'number' ? defaultHours : 1, // Default to 1 if empty
      defaultDescription,
      icon,
    });
    // Reset form
    setLabel('');
    setDepartment('');
    setEventType('');
    setDefaultProduct('');
    setDefaultHours('');
    setDefaultDescription('');
    setIcon(AVAILABLE_ICONS[0]); // Reset icon to default
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50">
      <h4 className="font-bold">新增範本</h4>
      <input type="text" placeholder="請填寫範本名稱" value={label} onChange={e => setLabel(e.target.value)} className="w-full p-2 border rounded" disabled={templates.length >= 6} />
      <select value={department} onChange={e => setDepartment(e.target.value as Department)} className="w-full p-2 border rounded" disabled={templates.length >= 6}>
        <option value="" disabled>協作部門</option>
        {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={eventType} onChange={e => setEventType(e.target.value as EventType)} className="w-full p-2 border rounded" disabled={templates.length >= 6}>
        <option value="" disabled>事件類型</option>
        {eventTypes.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
      </select>
      <select
        value={defaultProduct}
        onChange={e => setDefaultProduct(e.target.value)}
        className="w-full p-2 border rounded"
        disabled={templates.length >= 6}
      >
        <option value="">相關產品</option>
        {PRODUCT_LIST.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>      <input
        type="number"
        placeholder="預設時數"
        step="0.25"
        min="0.25"
        max="10"
        value={defaultHours}
        onChange={e => setDefaultHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
        onBlur={(e) => {
          const value = parseFloat(e.target.value);
          if (e.target.value === '') return;
          if (value < 0.25) {
            setDefaultHours(0.25);
          } else if (value > 10) {
            setDefaultHours(10);
          } else {
            setDefaultHours(Math.round(value * 4) / 4);
          }
        }}
        className="w-full p-2 border rounded"
        disabled={templates.length >= 6}
      />
      <textarea placeholder="預設內容" value={defaultDescription} onChange={e => setDefaultDescription(e.target.value)} className="w-full p-2 border rounded" disabled={templates.length >= 6} />
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase ml-1">選擇圖示</label>
        <div className="grid grid-cols-5 gap-2">
          {AVAILABLE_ICONS.map(iconName => (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              className={`p-3 rounded-lg flex items-center justify-center transition-all ${icon === iconName ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              disabled={templates.length >= 6}
            >
              <Icon name={iconName} size={20} />
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" fullWidth disabled={templates.length >= 6 || !label.trim()}>
        {templates.length >= 6 ? '已達上限' : '新增範本'}
      </Button>
    </form>
  );
};

// --- Add Event Type Form Component ---
const AddEventTypeForm = ({ onAdd, eventTypes }: { onAdd: (name: string) => void, eventTypes: EventTypeItem[] }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('請輸入事件類型名稱');
      return;
    }
    if (eventTypes.length >= 4) {
      alert('最多只能有四種事件類型');
      return;
    }
    onAdd(name);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50">
      <h4 className="font-bold">新增事件類型</h4>
      <input
        type="text"
        placeholder="事件類型名稱"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full p-2 border rounded"
        disabled={eventTypes.length >= 3}
      />
      <Button type="submit" fullWidth disabled={eventTypes.length >= 3 || !name.trim()}>
        {eventTypes.length >= 4 ? '已達上限' : '新增事件類型'}
      </Button>
    </form>
  );
};

// --- Edit Task Modal Component ---
const EditTaskModal = ({
  task, isOpen, onClose, onSave, onDelete, eventTypes
}: {
  task: Task | null, isOpen: boolean, onClose: () => void,
  onSave: (t: Task) => void, onDelete: (id: string) => void,
  eventTypes: EventTypeItem[]
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) setEditedTask({ ...task });
  }, [task]);

  if (!isOpen || !editedTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="font-bold text-lg text-slate-800">修改紀錄</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">日期</label>
            <input type="date" value={editedTask.date} onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">部門</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Department).map(d => (
                <button key={d} onClick={() => setEditedTask({ ...editedTask, department: d })} className={`p-2 rounded-lg text-xs font-bold border transition-all ${editedTask.department === d ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">產品別</label>
            <select value={editedTask.product || ''} onChange={(e) => setEditedTask({ ...editedTask, product: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
              <option value="">無</option>
              {PRODUCT_LIST.map(p => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">事件類型</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {eventTypes.map(type => (
                <button key={type.id} onClick={() => setEditedTask({ ...editedTask, eventType: type.name })} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${editedTask.eventType === type.name ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{type.name}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">工作內容</label>
            <textarea value={editedTask.description} onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })} rows={3} className="w-full p-3 rounded-xl border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">時數</label>
            <input type="number" step="0.25" min="0.25" value={editedTask.hours} onChange={(e) => setEditedTask({ ...editedTask, hours: parseFloat(e.target.value) || 0 })} className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 flex gap-3">
          <Button variant="danger" className="flex-1" icon={<Trash2 size={18} />} onClick={() => { if (window.confirm('確定要刪除這筆紀錄嗎？')) { onDelete(editedTask.id); onClose(); } }}>刪除</Button>
          <Button variant="primary" className="flex-1" icon={<Save size={18} />} onClick={() => { onSave(editedTask); onClose(); }}>儲存修改</Button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'log' | 'report' | 'settings'>('log');
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  // --- 建議修改為 (校正時區，確保永遠是當地的今天) ---
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });
  const [dept, setDept] = useState<Department>(Department.TU_FU);
  const [eventType, setEventType] = useState<EventType>('');
  const [product, setProduct] = useState<string>('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(1.0);

  // Report & UI State
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); // Last day of current month
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });

  const [showExportSheet, setShowExportSheet] = useState(false);
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [showDeptSheet, setShowDeptSheet] = useState(false);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Settings state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userEventTypes, setUserEventTypes] = useState<EventTypeItem[]>([]);

  const eventTypes = userEventTypes

  useEffect(() => {
    const loadedUser = StorageService.getUser();
    if (loadedUser?.isAuthenticated) {
      setUser(loadedUser);
      loadTasksFromSupabase(loadedUser.name);
      loadTemplatesFromSupabase(loadedUser.name);
      loadUserEventTypesFromSupabase(loadedUser.name);
    }
  }, []);

  const loadTasksFromSupabase = async (userName: string) => {
    setIsLoading(true);
    const data = await SupabaseService.fetchTasks(userName);
    setTasks(data);
    setIsLoading(false);
  };

  const loadTemplatesFromSupabase = async (userName: string) => {
    const data = await SupabaseService.fetchTemplates(userName);
    if (data.length === 0) {
      for (const template of DEFAULT_TEMPLATES) {
        await SupabaseService.addTemplate(template, userName);
      }
      const newData = await SupabaseService.fetchTemplates(userName);
      setTemplates(newData);
    } else {
      setTemplates(data);
    }
  };

  const loadUserEventTypesFromSupabase = async (userName: string) => {
    let data = await SupabaseService.fetchEventTypes(userName);
    if (data.length === 0) {
      const defaultTypes = ['會議', '其他']; // 這裡定義預設值
      for (const name of defaultTypes) {
        await SupabaseService.addEventType(name, userName);
      }
      // 寫入後重新抓取一次，才會拿到正確的 ID
      data = await SupabaseService.fetchEventTypes(userName);
    }

    setUserEventTypes(data);

    // 預設選取第一個
    if (data.length > 0 && !eventType) {
      setEventType(data[0].name);
    }
  };

  const handleLogin = (name: string) => {
    const newUser = { name, id: Date.now().toString(), isAuthenticated: true };
    StorageService.saveUser(newUser);
    setUser(newUser);
    loadTasksFromSupabase(name);
    loadTemplatesFromSupabase(name);
    loadUserEventTypesFromSupabase(name);

    const savedVersion = localStorage.getItem(USER_GUIDE_VERSION_KEY);
    // 條件 a: 初次登入 (savedVersion 為 null)
    // 條件 b: UserGuide 更新 (savedVersion != CURRENT_USER_GUIDE_VERSION)
    if (savedVersion !== CURRENT_USER_GUIDE_VERSION) {
      setShowUserGuide(true);
      localStorage.setItem(USER_GUIDE_VERSION_KEY, CURRENT_USER_GUIDE_VERSION);
    }
  };



  const handleLogout = () => {
    StorageService.clearUser();
    setUser(null);
    setTasks([]);
    setTemplates([]);
    setUserEventTypes([]);
    setEventType('');
  };

  const handleAddTemplate = async (template: Omit<Template, 'id'>) => {
    if (!user) return;
    if (templates.length >= 6) {
      alert('最多只能有六個範本');
      return;
    }
    const newTemplate = await SupabaseService.addTemplate(template, user.name);
    if (newTemplate) {
      setTemplates([...templates, newTemplate]);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    await SupabaseService.deleteTemplate(id);
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleAddUserEventType = async (name: string) => {
    if (!user) return;
    if (eventTypes.length >= 3) {
      alert('最多只能有三種事件類型');
      return;
    }
    const newEventType = await SupabaseService.addEventType(name, user.name);
    if (newEventType) {
      setUserEventTypes([...userEventTypes, newEventType]);
    }
  };

  const handleDeleteEventType = async (id: string) => {
    // Prevent deleting default event types
    if (id.startsWith('default-')) {
      return;
    }
    await SupabaseService.deleteEventType(id);
    setUserEventTypes(userEventTypes.filter(et => et.id !== id));
  };



  const resetForm = () => {
    setDescription('');
    setProduct('');
    setHours(1.0);
  };

  const handleAddToPending = () => {
    const newTask: Task = {
      id: `temp-${Date.now()}`,
      date: currentDate,
      department: dept,
      eventType,
      product,
      description,
      hours,
      timestamp: Date.now()
    };
    setPendingTasks([...pendingTasks, newTask]);
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemovePendingTask = (id: string) => {
    setPendingTasks(pendingTasks.filter(task => task.id !== id));
  };

  const handleSubmitAll = async () => {
    if (!user) return;

    try {
      for (const task of pendingTasks) {
        await SupabaseService.addTask(task, user.name);
      }

      alert("🎉 成功上傳雲端！");
      setPendingTasks([]);
      loadTasksFromSupabase(user.name);
    } catch (e) {
      alert("上傳失敗，請檢查網路");
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    await SupabaseService.updateTask(updatedTask);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('確定要刪除嗎？')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await SupabaseService.deleteTask(taskId);
    }
  };

  const handleApplyTemplate = (t: Template) => {
    setDept(t.department);
    setEventType(t.eventType);
    setProduct(t.defaultProduct || '');
    setHours(t.defaultHours);
    setDescription(t.defaultDescription);
    const formElement = document.getElementById('log-form');
    if (formElement) window.scrollTo({ top: formElement.offsetTop, behavior: 'smooth' });
  };

  const reportTasks = useMemo(() => {
    return tasks.filter(t => t.date >= reportStartDate && t.date <= reportEndDate);
  }, [tasks, reportStartDate, reportEndDate]);

  const chartData = useMemo(() => {
    const map = new Map<Department, number>();
    reportTasks.forEach(t => {
      map.set(t.department, (map.get(t.department) || 0) + t.hours);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [reportTasks]);

  const shiftDateRange = (months: number) => {
    const start = new Date(reportStartDate);
    const end = new Date(reportEndDate);

    start.setMonth(start.getMonth() + months);

    // For end date, we want to respect the month shift similarly.
    // If it was the end of the month, we might want to keep it end of month?
    // A simple shift of +1 month for report range often implies "Next Month".
    // If the user has a custom range selected (e.g. 5 days), "Next Month" might be ambiguous.
    // But typically standard behavior for "Next" in a calendar view is "Same days, next month".

    // However, if the user was viewing a full month "2024-01-01" to "2024-01-31",
    // just adding 1 month to start -> "2024-02-01".
    // adding 1 month to end -> "2024-02-29" (leap) or "2024-02-28".

    // Let's use a simpler logic for "Prev/Next":
    // 1. Calculate the duration of the current range in days.
    // 2. Shift the start date by +/- 1 month.
    // 3. Set end date to match start date + duration?
    // OR: Just shift both by 1 month.

    // Let's just strictly add/sub month to the Date objects.
    end.setMonth(end.getMonth() + months);

    // Handle end-of-month edge cases automatically by Date object (e.g. Jan 31 + 1 mo -> Feb 28/29 or Mar 2/3 depending on implementation).
    // The default setMonth behavior: "2024-01-31" + 1 month -> "2024-03-02" (because Feb only has 29 days).
    // This might not be what users expect if they want "Feb Month".

    // Special handling: if we are currently viewing "First to Last" of a month, we should probably switch to "First to Last" of next month.
    const isFullMonth = (s: string, e: string) => {
      const d1 = new Date(s);
      const d2 = new Date(e);
      const nextDay = new Date(d2);
      nextDay.setDate(d2.getDate() + 1);
      return d1.getDate() === 1 && nextDay.getDate() === 1 && d1.getMonth() !== nextDay.getMonth();
    };

    if (isFullMonth(reportStartDate, reportEndDate)) {
      // It's a full calendar month. Shift to full next calendar month.
      const newStart = new Date(reportStartDate);
      newStart.setMonth(newStart.getMonth() + months);
      newStart.setDate(1); // Ensure 1st

      const newEnd = new Date(newStart);
      newEnd.setMonth(newEnd.getMonth() + 1);
      newEnd.setDate(0); // Last day of that new month

      // Adjust back timezone offset to avoid issues
      newStart.setMinutes(newStart.getMinutes() - newStart.getTimezoneOffset());
      newEnd.setMinutes(newEnd.getMinutes() - newEnd.getTimezoneOffset());

      setReportStartDate(newStart.toISOString().split('T')[0]);
      setReportEndDate(newEnd.toISOString().split('T')[0]);
    } else {
      // Custom range. Just shift dates.
      start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
      end.setMinutes(end.getMinutes() - end.getTimezoneOffset());

      setReportStartDate(start.toISOString().split('T')[0]);
      setReportEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleExport = () => {
    if (!exportStart || !exportEnd) return alert("請輸入日期");
    const filtered = tasks.filter(t => t.date >= exportStart && t.date <= exportEnd);
    if (filtered.length === 0) return alert("無資料");
    StorageService.exportToCSV(filtered);
    setShowExportSheet(false);
  };

  const openExportSheet = () => {
    setExportStart(reportStartDate);
    setExportEnd(reportEndDate);
    setShowExportSheet(true);
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" className="text-sm font-bold">
        {` ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-24 md:pb-6">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-1.5"><Grid className="text-white w-5 h-5" /></div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">頂級牛馬a工作紀錄</h1>
            <button
              onClick={() => setShowUserGuide(true)}
              className="ml-1 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="使用指南"
            >
              <HelpCircle size={20} />
            </button>
          </div>
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setView('log')} className={`px-5 py-1.5 text-sm font-bold rounded-lg transition-all ${view === 'log' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>紀錄</button>
            <button onClick={() => setView('report')} className={`px-5 py-1.5 text-sm font-bold rounded-lg transition-all ${view === 'report' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>報表</button>
            <button onClick={() => setView('settings')} className={`px-5 py-1.5 text-sm font-bold rounded-lg transition-all ${view === 'settings' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>設定</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden md:inline">Hi, {user.name}</span>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {view === 'log' && (
          <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 gap-y-6">
            <div className="md:col-span-5 lg:col-span-4 space-y-6">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">常用工作項目</h3>
              <div className="grid grid-cols-2 gap-4">
                {templates.map(t => (
                  <button key={t.id} onClick={() => handleApplyTemplate(t)} className="flex flex-col items-center justify-center p-4 bg-white border border-transparent rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-center gap-2 group active:scale-95">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Icon name={t.icon} size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{t.label}</span>
                  </button>
                ))}
              </div>

              {pendingTasks.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden animate-fade-in-up">
                  <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingTasks.length}</div>
                      <span className="font-bold text-blue-900">待上傳清單</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {pendingTasks.map((task, idx) => (
                      <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-400">{task.department} · {task.eventType}</span>
                            <span className="font-bold text-slate-800">{task.hours}h</span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                        </div>
                        <button onClick={() => handleRemovePendingTask(task.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Button fullWidth variant="success" icon={<CheckCircle size={18} />} onClick={handleSubmitAll}>確認上傳雲端 (Upload)</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-7 lg:col-span-8 space-y-6">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">新增工作紀錄</h3>
              <div id="log-form" className="bg-white rounded-2xl shadow-sm p-5 sm:p-5 space-y-6 border border-slate-200/50">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <Calendar className="text-slate-400" size={20} />
                  <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="bg-transparent font-bold text-slate-700 outline-none flex-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">部門</label>
                    <button onClick={() => setShowDeptSheet(true)} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[dept] }} />
                        <span className="font-bold text-slate-800 text-base">{dept}</span>
                      </div>
                      <ChevronLeft className="-rotate-90 text-slate-400" size={20} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">產品別</label>
                    <button onClick={() => setShowProductSheet(true)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${product ? 'bg-blue-50/80 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                      <div className="flex items-center gap-3">
                        <Tag className={product ? 'text-blue-500' : 'text-slate-400'} size={20} />
                        <span className={`text-base font-medium ${product ? 'text-blue-700' : 'text-slate-500'}`}>{product || "無"}</span>
                      </div>
                      <ChevronLeft className="-rotate-90 text-slate-400" size={20} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">事件類型</label>
                  <div className="bg-slate-100/80 p-1.5 rounded-xl flex h-14">
                    {eventTypes.map(type => (
                      <button key={type.id} onClick={() => setEventType(type.name)} className={`flex-1 rounded-lg text-sm font-bold transition-all ${eventType === type.name ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>{type.name}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">工作內容</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="做了什麼..." rows={3} className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 text-base placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">時數</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setHours(prev => Math.max(0.25, prev - 0.25))} className="w-14 h-14 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"><Minus size={20} /></button>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="10"
                        value={hours}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (isNaN(value)) {
                            setHours(0.25);
                          } else if (value > 10) {
                            setHours(10);
                          } else {
                            setHours(value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value < 0.25) {
                            setHours(0.25);
                          } else {
                            // Round to nearest 0.25
                            setHours(Math.round(value * 4) / 4);
                          }
                        }}
                        className="w-full h-14 text-center text-2xl font-bold text-blue-600 bg-blue-50/80 border-2 border-blue-100/80 rounded-xl outline-none focus:ring-2 focus:ring-blue-300" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 font-medium">hr</span>
                    </div>
                    <button onClick={() => setHours(prev => Math.min(10, prev + 0.25))} className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95 transition-all"><Plus size={20} /></button>
                  </div>
                </div>
                <Button fullWidth size="lg" onClick={handleAddToPending} icon={<Plus size={20} />}>加入待提交清單</Button>
              </div>
            </div>
          </div>
        )}

        {view === 'report' && (
          <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 h-full">
            <div className="md:col-span-12 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                <button onClick={() => shiftDateRange(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronLeft size={20} /></button>
                <div className="flex items-center gap-2 px-2">
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer hover:text-blue-600 transition-colors w-[110px]"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer hover:text-blue-600 transition-colors w-[110px]"
                  />
                </div>
                <button onClick={() => shiftDateRange(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronRight size={20} /></button>
              </div>
              <button onClick={openExportSheet} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"><Download size={16} />匯出 Excel</button>
            </div>

            <div className="md:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-6 w-full text-left">工時分佈</h3>
                <div className="h-64 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[entry.name]} stroke="none" />))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full flex flex-col items-center justify-center text-slate-300"><BarChart2 size={48} className="mb-2 opacity-50" /><span className="text-sm">本相同無數據</span></div>}
                </div>
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">雲端資料 ({reportTasks.length})</h3>
                </div>
                <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
                  {reportTasks.length === 0 ? <div className="p-6 text-center text-slate-400">尚無紀錄</div> : reportTasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((task) => (
                    <button key={task.id} onClick={() => setEditingTask(task)} className="w-full text-left p-4 hover:bg-slate-50 transition-colors group flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center bg-slate-100 rounded-xl w-12 h-12 shrink-0">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">{new Date(task.date).toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-lg font-bold text-slate-800 leading-none">{new Date(task.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: DEPARTMENT_COLORS[task.department] }}>{task.department}</span>
                          <span className="text-xs text-slate-400 font-medium border border-slate-200 px-1.5 rounded">{task.eventType}</span>
                          {task.product && <span className="text-xs text-blue-500 font-medium bg-blue-50 px-1.5 rounded">{task.product}</span>}
                        </div>
                        <p className="text-sm text-slate-700 font-medium truncate group-hover:text-blue-700 transition-colors">{task.description}</p>
                      </div>
                      <div className="text-right shrink-0"><span className="block text-lg font-bold text-slate-800">{task.hours}<span className="text-xs text-slate-400 ml-0.5">h</span></span></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}


        {view === 'settings' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-sm p-5 space-y-5 border border-slate-100">
                <h3 className="text-lg font-bold">常用工作項目</h3>
                <AddTemplateForm onAdd={handleAddTemplate} eventTypes={eventTypes} templates={templates} />
                <div className="mt-4">
                  <h4 className="font-bold mb-2">現有範本</h4>
                  <ul>
                    {templates.map(t => (
                      <li key={t.id} className="flex justify-between items-center p-2 border-b">
                        <span>{t.label}</span>
                        <button onClick={() => handleDeleteTemplate(t.id)}><Trash2 size={16} /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm p-5 space-y-5 border border-slate-100">
                <h3 className="text-lg font-bold">事件類型管理</h3>
                <AddEventTypeForm onAdd={handleAddUserEventType} eventTypes={eventTypes} />
                <div className="mt-4">
                  <h4 className="font-bold mb-2">現有事件類型</h4>
                  <ul>
                    {eventTypes.map(et => (
                      <li key={et.id} className="flex justify-between items-center p-2 border-b">
                        <span>{et.name}</span>
                        <button onClick={() => handleDeleteEventType(et.id)}>
                          <Trash2 size={16} className={et.id.startsWith('default-') ? 'text-slate-300' : ''} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-sm border-t border-slate-200/80 flex justify-around items-center h-16 pb-1 z-40">
        <button onClick={() => setView('log')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'log' ? 'text-blue-600' : 'text-slate-500'}`}><Plus size={24} /><span className="text-[11px] font-bold">紀錄</span></button>
        <button onClick={() => setView('report')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'report' ? 'text-blue-600' : 'text-slate-500'}`}><BarChart2 size={24} /><span className="text-[11px] font-bold">報表</span></button>
        <button onClick={() => setView('settings')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'settings' ? 'text-blue-600' : 'text-slate-500'}`}><Code size={24} /><span className="text-[11px] font-bold">設定</span></button>
      </nav>
      <BottomSheet isOpen={showDeptSheet} onClose={() => setShowDeptSheet(false)} title="選擇部門">
        <div className="grid grid-cols-2 gap-3 pb-8 md:pb-0">{Object.values(Department).map((d) => (<button key={d} onClick={() => { setDept(d); setShowDeptSheet(false); }} className={`p-4 rounded-xl font-bold text-lg border-2 transition-all flex items-center justify-between ${dept === d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'}`}><span>{d}</span><div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[d] }} /></button>))}</div>
      </BottomSheet>
      <BottomSheet isOpen={showProductSheet} onClose={() => setShowProductSheet(false)} title="選擇產品">
        <div className="grid grid-cols-2 gap-3 pb-8 md:pb-0">{PRODUCT_LIST.map((p) => (<button key={p} onClick={() => { setProduct(p); setShowProductSheet(false); }} className={`p-4 rounded-xl font-bold border-2 transition-all text-center ${product === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'}`}>{p}</button>))}</div>
      </BottomSheet>
      <BottomSheet isOpen={showExportSheet} onClose={() => setShowExportSheet(false)} title="匯出設定">
        <div className="space-y-6 pb-8 md:pb-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase">開始</label><input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase">結束</label><input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <Button fullWidth onClick={handleExport} icon={<FileDown size={20} />}>下載 CSV</Button>
        </div>
      </BottomSheet>
      <EditTaskModal task={editingTask} isOpen={!!editingTask} onClose={() => setEditingTask(null)} onSave={handleUpdateTask} onDelete={handleDeleteTask} eventTypes={eventTypes} />
      <UserGuideModal isOpen={showUserGuide} onClose={() => setShowUserGuide(false)} />
    </div>
  );
}
