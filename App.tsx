import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { 
  Plus, Trash2, LogOut, BarChart2,
  CheckCircle, Calendar, Clock, Grid, Users, Code, Bug, HelpCircle, 
  Minus, Tag, X, Save, Download, FileDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';

import { Task, Department, EventType, UserProfile, Template } from './types';
import { StorageService } from './services/storageService'; // 留著用來記「登入狀態」
import { SupabaseService } from './supabaseService'; // 新的資料庫服務
import { DEPARTMENT_COLORS, DEFAULT_TEMPLATES, PRODUCT_LIST } from './constants';
import { Button } from './components/Button';
import { BottomSheet } from './components/BottomSheet';

// --- Auth Component (無變更) ---
const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = useState('');
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={40} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">牛馬a工作紀錄</h1>
          <p className="text-slate-500 mt-2">寫完這個就能下班了吧(・Д・)ノ</p>
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
};

// --- Edit Task Modal Component (無變更) ---
const EditTaskModal = ({ 
  task, isOpen, onClose, onSave, onDelete 
}: { 
  task: Task | null, isOpen: boolean, onClose: () => void, 
  onSave: (t: Task) => void, onDelete: (id: string) => void
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
             <input type="date" value={editedTask.date} onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"/>
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
             <label className="text-xs font-bold text-slate-400 uppercase">事件類型</label>
             <div className="flex bg-slate-100 p-1 rounded-xl">
               {Object.values(EventType).map(type => (
                 <button key={type} onClick={() => setEditedTask({ ...editedTask, eventType: type })} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${editedTask.eventType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{type}</button>
               ))}
             </div>
           </div>
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">產品別</label>
             <select value={editedTask.product || ''} onChange={(e) => setEditedTask({ ...editedTask, product: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
               <option value="">無 (None)</option>
               {PRODUCT_LIST.map(p => (<option key={p} value={p}>{p}</option>))}
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">工作內容</label>
             <textarea value={editedTask.description} onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })} rows={3} className="w-full p-3 rounded-xl border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
           </div>
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">時數</label>
             <input type="number" step="0.25" min="0.25" value={editedTask.hours} onChange={(e) => setEditedTask({ ...editedTask, hours: parseFloat(e.target.value) || 0 })} className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"/>
           </div>
        </div>
        <div className="p-4 border-t border-slate-100 flex gap-3">
          <Button variant="danger" className="flex-1" icon={<Trash2 size={18}/>} onClick={() => { if (window.confirm('確定要刪除這筆紀錄嗎？')) { onDelete(editedTask.id); onClose(); } }}>刪除</Button>
          <Button variant="primary" className="flex-1" icon={<Save size={18}/>} onClick={() => { onSave(editedTask); onClose(); }}>儲存修改</Button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'log' | 'report'>('log');
  
  // Data State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]); // 暫存區 (尚未提交到 DB)
  const [isLoading, setIsLoading] = useState(false); // 讀取狀態
  
  // Form State
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dept, setDept] = useState<Department>(Department.TU_FU);
  const [eventType, setEventType] = useState<EventType>(EventType.MEETING);
  const [product, setProduct] = useState<string>('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(1.0);
  
  // Report & UI State
  const [viewMonth, setViewMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [showDeptSheet, setShowDeptSheet] = useState(false);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 1. 初始化檢查登入 & 抓取資料
  useEffect(() => {
    const loadedUser = StorageService.getUser();
    if (loadedUser?.isAuthenticated) {
      setUser(loadedUser);
      loadTasksFromSupabase(loadedUser.name);
    }
  }, []);

  // 封裝抓取資料的函式
  const loadTasksFromSupabase = async (userName: string) => {
    setIsLoading(true);
    const data = await SupabaseService.fetchTasks(userName);
    setTasks(data);
    setIsLoading(false);
  };

  const handleLogin = (name: string) => {
    const newUser = { name, id: Date.now().toString(), isAuthenticated: true };
    StorageService.saveUser(newUser); // Session 存本地
    setUser(newUser);
    loadTasksFromSupabase(name); // 資料從雲端抓
  };

  const handleLogout = () => {
    StorageService.clearUser();
    setUser(null);
    setTasks([]);
  };

  const resetForm = () => {
    setDescription('');
    setProduct('');
    setHours(1.0);
  };

  // 加入「待提交清單」 (還沒存到 DB)
  const handleAddToPending = () => {
    if (!description.trim()) {
      alert("請輸入工作內容");
      return;
    }
    const newTask: Task = {
      id: `temp-${Date.now()}`, // 臨時 ID
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

  // 真正寫入資料庫 (Submit All)
  const handleSubmitAll = async () => {
    if (!user) return;
    
    // 顯示 Loading 或鎖住按鈕可加在這裡
    try {
      // 一筆一筆寫入 (為了簡單起見)
      for (const task of pendingTasks) {
        await SupabaseService.addTask(task, user.name);
      }
      
      alert("🎉 成功上傳雲端！");
      setPendingTasks([]); // 清空暫存
      loadTasksFromSupabase(user.name); // 重新抓取最新資料
    } catch (e) {
      alert("上傳失敗，請檢查網路");
    }
  };

  // 更新單筆 (DB)
  const handleUpdateTask = async (updatedTask: Task) => {
    // 先樂觀更新前端 (看起來比較快)
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    
    await SupabaseService.updateTask(updatedTask);
    // 可以在這裡重抓一次確保一致，或相信前端
  };

  // 刪除單筆 (DB)
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

  // --- Report Logic ---
  const monthlyTasks = useMemo(() => {
    return tasks.filter(t => t.date.startsWith(viewMonth));
  }, [tasks, viewMonth]);

  const chartData = useMemo(() => {
    const map = new Map<Department, number>();
    monthlyTasks.forEach(t => {
      map.set(t.department, (map.get(t.department) || 0) + t.hours);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [monthlyTasks]);

  const changeMonth = (delta: number) => {
    const d = new Date(`${viewMonth}-01`);
    d.setMonth(d.getMonth() + delta);
    setViewMonth(d.toISOString().slice(0, 7));
  };

  // CSV Export logic (沿用 StorageService 的 export 還是要自己寫都行，這裡沿用)
  const handleExport = () => {
    if (!exportStart || !exportEnd) return alert("請輸入日期");
    const filtered = tasks.filter(t => t.date >= exportStart && t.date <= exportEnd);
    if (filtered.length === 0) return alert("無資料");
    StorageService.exportToCSV(filtered);
    setShowExportSheet(false);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="h-screen bg-[#f1f5f9] font-sans pb-24md:pb-6">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5"><Grid className="text-white w-5 h-5" /></div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden md:block">EasyLog Cloud</h1>
          </div>
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setView('log')} className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all ${view === 'log' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>紀錄 Log</button>
             <button onClick={() => setView('report')} className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all ${view === 'report' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>報表 Reports</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden md:inline">Hi, {user.name}</span>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6">
        {view === 'log' && (
          <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8">
            {/* LEFT: Templates & History */}
            <div className="md:col-span-5 space-y-6">
               <div className="grid grid-cols-2 gap-3">
                  {DEFAULT_TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => handleApplyTemplate(t)} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center gap-2 group">
                      <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        {t.icon === 'Users' && <Users size={20} />}
                        {t.icon === 'HelpCircle' && <HelpCircle size={20} />}
                        {t.icon === 'Code' && <Code size={20} />}
                        {t.icon === 'Bug' && <Bug size={20} />}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{t.label}</span>
                    </button>
                  ))}
               </div>
               
               {/* 雲端資料預覽 (Loading State) */}
               <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-slate-400"/>近期雲端紀錄</h3>
                  {isLoading ? (
                    <div className="text-center py-4 text-slate-400">載入中...</div>
                  ) : (
                    <div className="space-y-3">
                        {tasks.slice(0, 5).map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[task.department] }} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-slate-400 mb-0.5">{task.date}</div>
                                    <div className="text-sm font-medium text-slate-700 truncate">{task.description}</div>
                                </div>
                                <div className="font-bold text-slate-500 text-sm">{task.hours}h</div>
                            </div>
                        ))}
                    </div>
                  )}
               </div>
            </div>

            {/* RIGHT: Input Form */}
            <div className="md:col-span-7 space-y-6">
              <div id="log-form" className="bg-white rounded-3xl shadow-sm p-5 space-y-5 border border-slate-100">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Calendar className="text-slate-400" size={20} />
                  <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="bg-transparent font-bold text-slate-700 outline-none flex-1" />
                </div>
                {/* Dept & EventType */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">部門</label>
                        <button onClick={() => setShowDeptSheet(true)} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[dept] }} />
                                <span className="font-bold text-slate-800 text-lg">{dept}</span>
                            </div>
                            <ChevronLeft className="-rotate-90 text-slate-400" size={20} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">事件類型</label>
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex h-[62px]">
                            {Object.values(EventType).map(type => (
                                <button key={type} onClick={() => setEventType(type)} className={`flex-1 rounded-xl text-sm font-bold transition-all ${eventType === type ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>{type}</button>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Product */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">產品別</label>
                    <button onClick={() => setShowProductSheet(true)} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${product ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                        <div className="flex items-center gap-3">
                            <Tag className={product ? 'text-blue-500' : 'text-slate-400'} size={20} />
                            <span className={`text-lg font-medium ${product ? 'text-blue-700' : 'text-slate-400'}`}>{product || "無 (None)"}</span>
                        </div>
                        <ChevronLeft className="-rotate-90 text-slate-400" size={20} />
                    </button>
                </div>
                {/* Desc */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">工作內容</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="做了什麼..." rows={3} className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-lg placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"/>
                </div>
                {/* Hours */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">時數</label>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setHours(Math.max(0.25, hours - 0.25))} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"><Minus size={24} /></button>
                        <div className="flex-1 relative">
                            <input type="number" step="0.25" min="0.25" value={hours} onChange={(e) => setHours(parseFloat(e.target.value) || 0)} className="w-full h-14 text-center text-3xl font-bold text-blue-600 bg-blue-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200"/>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 font-bold">hr</span>
                        </div>
                        <button onClick={() => setHours(hours + 0.25)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95 transition-all"><Plus size={24} /></button>
                    </div>
                </div>
                <Button fullWidth size="lg" onClick={handleAddToPending} icon={<Plus size={20} />}>加入待提交清單</Button>
              </div>
              
              {/* Pending Cart */}
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
                            <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-slate-400">{task.department} · {task.eventType}</span>
                                    <span className="font-bold text-slate-800">{task.hours}h</span>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <Button fullWidth variant="success" icon={<CheckCircle size={18} />} onClick={handleSubmitAll}>確認上傳雲端 (Upload)</Button>
                    </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'report' && (
           <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 h-full">
              {/* Report Header */}
              <div className="md:col-span-12 flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronLeft size={20} /></button>
                    <div className="relative group px-2 text-center">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{viewMonth}</div>
                        <input type="month" value={viewMonth} onChange={(e) => setViewMonth(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"/>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500"><ChevronRight size={20} /></button>
                 </div>
                 <button onClick={() => setShowExportSheet(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"><Download size={16} />匯出 Excel</button>
              </div>

              {/* Report Charts */}
              <div className="md:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-6 w-full text-left">工時分佈</h3>
                    <div className="h-64 w-full">
                        {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[entry.name]} stroke="none" />))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : <div className="h-full flex flex-col items-center justify-center text-slate-300"><BarChart2 size={48} className="mb-2 opacity-50"/><span className="text-sm">本月尚無數據</span></div>}
                    </div>
                </div>
              </div>

              {/* Report List (DB Data) */}
              <div className="md:col-span-8 space-y-4">
                 <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">雲端資料 ({monthlyTasks.length})</h3>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
                        {monthlyTasks.length === 0 ? <div className="p-8 text-center text-slate-400">尚無紀錄</div> : monthlyTasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((task) => (
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
      </main>

      {/* Sheets & Modals */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex justify-around items-center h-20 pb-4 z-40 shadow-sm">
        <button onClick={() => setView('log')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'log' ? 'text-blue-600' : 'text-slate-400'}`}><Plus size={28} strokeWidth={2.5} /><span className="text-[10px] font-bold">紀錄</span></button>
        <div className="w-px h-8 bg-slate-100"></div>
        <button onClick={() => setView('report')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'report' ? 'text-blue-600' : 'text-slate-400'}`}><BarChart2 size={28} strokeWidth={2.5} /><span className="text-[10px] font-bold">報表</span></button>
      </nav>
      <BottomSheet isOpen={showDeptSheet} onClose={() => setShowDeptSheet(false)} title="選擇部門">
        <div className="grid grid-cols-2 gap-3 pb-8 md:pb-0">{Object.values(Department).map((d) => (<button key={d} onClick={() => { setDept(d); setShowDeptSheet(false); }} className={`p-4 rounded-xl font-bold text-lg border-2 transition-all flex items-center justify-between ${dept === d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'}`}><span>{d}</span><div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[d] }} /></button>))}</div>
      </BottomSheet>
      <BottomSheet isOpen={showProductSheet} onClose={() => setShowProductSheet(false)} title="選擇產品">
        <div className="grid grid-cols-2 gap-3 pb-8 md:pb-0"><button onClick={() => { setProduct(''); setShowProductSheet(false); }} className={`p-4 rounded-xl font-bold border-2 transition-all text-center ${product === '' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400 hover:border-blue-200'}`}>無 (None)</button>{PRODUCT_LIST.map((p) => (<button key={p} onClick={() => { setProduct(p); setShowProductSheet(false); }} className={`p-4 rounded-xl font-bold border-2 transition-all text-center ${product === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'}`}>{p}</button>))}</div>
      </BottomSheet>
      <BottomSheet isOpen={showExportSheet} onClose={() => setShowExportSheet(false)} title="匯出設定">
        <div className="space-y-6 pb-8 md:pb-0">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase">開始</label><input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase">結束</label><input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"/></div>
           </div>
           <Button fullWidth onClick={handleExport} icon={<FileDown size={20}/>}>下載 CSV</Button>
        </div>
      </BottomSheet>
      <EditTaskModal task={editingTask} isOpen={!!editingTask} onClose={() => setEditingTask(null)} onSave={handleUpdateTask} onDelete={handleDeleteTask}/>
    </div>
  );
}