import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { 
  Plus, Trash2, LogOut, BarChart2, List as ListIcon, 
  CheckCircle,
  Calendar, Clock, Grid, Users, Code, Bug, HelpCircle, 
  Minus, Tag, MessageSquare, X, Save, Download, FileDown,
  ChevronLeft, ChevronRight, LayoutDashboard, Search
} from 'lucide-react';

import { Task, Department, EventType, UserProfile, Template } from './types';
import { StorageService } from './services/storageService';
import { DEPARTMENT_COLORS, DEFAULT_TEMPLATES, PRODUCT_LIST } from './constants';
import { Button } from './components/Button';
import { BottomSheet } from './components/BottomSheet';

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
        <p className="text-xs text-slate-400">
          系統會記住此裝置 30 天，無需重複登入。
        </p>
      </div>
    </div>
  );
};

// --- Edit Task Modal Component ---
const EditTaskModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: { 
  task: Task | null, 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (t: Task) => void,
  onDelete: (id: string) => void
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) setEditedTask({ ...task });
  }, [task]);

  if (!isOpen || !editedTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="font-bold text-lg text-slate-800">修改紀錄</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
           {/* Date */}
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">日期</label>
             <input 
                type="date" 
                value={editedTask.date}
                onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
           </div>

           {/* Dept Grid */}
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">部門</label>
             <div className="grid grid-cols-3 gap-2">
               {Object.values(Department).map(d => (
                 <button
                   key={d}
                   onClick={() => setEditedTask({ ...editedTask, department: d })}
                   className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                     editedTask.department === d
                       ? 'bg-blue-50 border-blue-500 text-blue-600'
                       : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                   }`}
                 >
                   {d}
                 </button>
               ))}
             </div>
           </div>

           {/* Event Type */}
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">事件類型</label>
             <div className="flex bg-slate-100 p-1 rounded-xl">
               {Object.values(EventType).map(type => (
                 <button
                   key={type}
                   onClick={() => setEditedTask({ ...editedTask, eventType: type })}
                   className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                     editedTask.eventType === type
                       ? 'bg-white text-blue-600 shadow-sm'
                       : 'text-slate-500 hover:text-slate-700'
                   }`}
                 >
                   {type}
                 </button>
               ))}
             </div>
           </div>

           {/* Product */}
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">產品別</label>
             <select
                value={editedTask.product || ''}
                onChange={(e) => setEditedTask({ ...editedTask, product: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
             >
               <option value="">無 (None)</option>
               {PRODUCT_LIST.map(p => (
                 <option key={p} value={p}>{p}</option>
               ))}
             </select>
           </div>

           {/* Description */}
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">工作內容</label>
             <textarea
               value={editedTask.description}
               onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
               rows={3}
               className="w-full p-3 rounded-xl border border-slate-200 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
             />
           </div>

           {/* Hours */}
           <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase">時數</label>
             <input
               type="number"
               step="0.25"
               min="0.25"
               value={editedTask.hours}
               onChange={(e) => setEditedTask({ ...editedTask, hours: parseFloat(e.target.value) || 0 })}
               className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
             />
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex gap-3">
          <Button 
            variant="danger" 
            className="flex-1"
            icon={<Trash2 size={18}/>}
            onClick={() => {
              if (window.confirm('確定要刪除這筆紀錄嗎？')) {
                onDelete(editedTask.id);
                onClose();
              }
            }}
          >
            刪除
          </Button>
          <Button 
            variant="primary" 
            className="flex-1"
            icon={<Save size={18}/>}
            onClick={() => {
              onSave(editedTask);
              onClose();
            }}
          >
            儲存修改
          </Button>
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
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  
  // Form State
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dept, setDept] = useState<Department>(Department.TU_FU);
  const [eventType, setEventType] = useState<EventType>(EventType.MEETING);
  const [product, setProduct] = useState<string>('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(1.0);
  
  // Report State
  const [viewMonth, setViewMonth] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [exportStart, setExportStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [exportEnd, setExportEnd] = useState(() => new Date().toISOString().split('T')[0]);

  // UI State
  const [showDeptSheet, setShowDeptSheet] = useState(false);
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Initialize
  useEffect(() => {
    const loadedUser = StorageService.getUser();
    if (loadedUser?.isAuthenticated) setUser(loadedUser);
    setTasks(StorageService.getTasks());
  }, []);

  const handleLogin = (name: string) => {
    const newUser = { name, id: Date.now().toString(), isAuthenticated: true };
    StorageService.saveUser(newUser);
    setUser(newUser);
  };

  const handleLogout = () => {
    StorageService.clearUser();
    setUser(null);
  };

  const resetForm = () => {
    setDescription('');
    setProduct('');
    setHours(1.0);
    // Keep date/dept/event as they are usually repeated
  };

  const handleAddTask = () => {
    if (!description.trim()) {
      alert("請輸入工作內容");
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
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

  const handleApplyTemplate = (t: Template) => {
    setDept(t.department);
    setEventType(t.eventType);
    setProduct(t.defaultProduct || '');
    setHours(t.defaultHours);
    setDescription(t.defaultDescription);
    const formElement = document.getElementById('log-form');
    if (formElement) {
        window.scrollTo({ top: formElement.offsetTop, behavior: 'smooth' });
    }
  };

  const handleSubmitAll = () => {
    const updatedTasks = [...tasks, ...pendingTasks];
    setTasks(updatedTasks);
    StorageService.saveTasks(updatedTasks);
    setPendingTasks([]);
    alert("🎉 成功提交所有紀錄！");
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updatedTasks);
    StorageService.saveTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    StorageService.saveTasks(updatedTasks);
  };

  // --- Export Logic ---
  const handleExport = () => {
    if (!exportStart || !exportEnd) {
      alert("請選擇完整日期區間");
      return;
    }
    if (exportStart > exportEnd) {
      alert("開始日期不能晚於結束日期");
      return;
    }

    const filtered = tasks.filter(t => t.date >= exportStart && t.date <= exportEnd);
    if (filtered.length === 0) {
      alert("此區間內無資料可匯出");
      return;
    }
    
    StorageService.exportToCSV(filtered);
    setShowExportSheet(false);
  };

  const setExportToCurrentMonth = () => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    setExportStart(start);
    setExportEnd(end);
  };

  const setExportToLastMonth = () => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().split('T')[0];
    const end = new Date(d.getFullYear(), d.getMonth(), 0).toISOString().split('T')[0];
    setExportStart(start);
    setExportEnd(end);
  };

  // --- Report View Logic ---
  const changeMonth = (delta: number) => {
    const d = new Date(`${viewMonth}-01`);
    d.setMonth(d.getMonth() + delta);
    setViewMonth(d.toISOString().slice(0, 7));
  };

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

  // Auth Guard
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-24 md:pb-6">
      
      {/* Header (Desktop + Mobile) */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
               <Grid className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden md:block">EasyLog</h1>
          </div>

          {/* Desktop Nav Switcher */}
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl">
             <button
               onClick={() => setView('log')}
               className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all ${
                 view === 'log' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               紀錄 Log
             </button>
             <button
               onClick={() => setView('report')}
               className={`px-6 py-1.5 text-sm font-bold rounded-lg transition-all ${
                 view === 'report' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               報表 Reports
             </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden md:inline">Hi, {user.name}</span>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* --- VIEW: LOG --- */}
        {view === 'log' && (
          <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8">
            
            {/* LEFT COLUMN: AI + Templates + History (Desktop 5 cols) */}
            <div className="md:col-span-5 space-y-6">
              
              {/* Quick Templates (Moved from Right) */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                  {DEFAULT_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleApplyTemplate(t)}
                      className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center gap-2 group"
                    >
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

               {/* Recent History Preview (Moved from Right, Desktop Only) */}
               <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-slate-400"/>
                    近期紀錄
                  </h3>
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
                    {tasks.length === 0 && <div className="text-center text-slate-400 py-4 text-sm">尚無紀錄</div>}
                  </div>
               </div>

            </div>

            {/* RIGHT COLUMN: Input Form + Cart (Desktop 7 cols) */}
            <div className="md:col-span-7 space-y-6">

              {/* Input Form Card */}
              <div id="log-form" className="bg-white rounded-3xl shadow-sm p-5 space-y-5 border border-slate-100">
                
                {/* Date Row */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Calendar className="text-slate-400" size={20} />
                  <input 
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="bg-transparent font-bold text-slate-700 outline-none flex-1"
                  />
                </div>

                {/* Desktop Grid Layout for Dept/Event/Product */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dept */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">部門</label>
                        <button 
                            onClick={() => setShowDeptSheet(true)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[dept] }} />
                                <span className="font-bold text-slate-800 text-lg">{dept}</span>
                            </div>
                            <ChevronLeft className="-rotate-90 text-slate-400" size={20} />
                        </button>
                    </div>

                    {/* Event Type */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">事件類型</label>
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex h-[62px]">
                            {Object.values(EventType).map(type => (
                                <button
                                key={type}
                                onClick={() => setEventType(type)}
                                className={`flex-1 rounded-xl text-sm font-bold transition-all ${
                                    eventType === type 
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                                >
                                {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product (Full Width) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">產品別 (選填)</label>
                    <button 
                        onClick={() => setShowProductSheet(true)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                            product ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Tag className={product ? 'text-blue-500' : 'text-slate-400'} size={20} />
                            <span className={`text-lg font-medium ${product ? 'text-blue-700' : 'text-slate-400'}`}>
                                {product || "無 (None)"}
                            </span>
                        </div>
                        <ChevronLeft className="-rotate-90 text-slate-400" size={20} />
                    </button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">工作內容</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="做了什麼..."
                        rows={3}
                        className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-lg placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                </div>

                {/* Hours */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">時數 (0.25h / 15min)</label>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setHours(Math.max(0.25, hours - 0.25))}
                            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
                        >
                            <Minus size={24} />
                        </button>
                        
                        <div className="flex-1 relative">
                            <input
                                type="number"
                                step="0.25"
                                min="0.25"
                                value={hours}
                                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                                className="w-full h-14 text-center text-3xl font-bold text-blue-600 bg-blue-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 font-bold">hr</span>
                        </div>

                        <button 
                            onClick={() => setHours(hours + 0.25)}
                            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95 transition-all"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                <Button 
                    fullWidth 
                    size="lg" 
                    onClick={handleAddTask}
                    icon={<Plus size={20} />}
                >
                    加入清單 (Add)
                </Button>

              </div>
               
               {/* Pending Cart (Moved to Right under Form) */}
               {pendingTasks.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden animate-fade-in-up">
                    <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {pendingTasks.length}
                        </div>
                        <span className="font-bold text-blue-900">待提交清單</span>
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
                    <Button 
                        fullWidth 
                        variant="success" 
                        icon={<CheckCircle size={18} />}
                        onClick={handleSubmitAll}
                    >
                        全部提交 (Submit All)
                    </Button>
                    </div>
                </div>
               )}

            </div>

          </div>
        )}

        {/* --- VIEW: REPORTS --- */}
        {view === 'report' && (
           <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 h-full">
              
              {/* Header: Month Selector + Export */}
              <div className="md:col-span-12 flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="relative group px-2 text-center">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {viewMonth}
                        </div>
                        {/* Invisible Month Picker overlay */}
                        <input 
                            type="month" 
                            value={viewMonth}
                            onChange={(e) => setViewMonth(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
                        <ChevronRight size={20} />
                    </button>
                 </div>

                 <button 
                   onClick={() => setShowExportSheet(true)}
                   className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                 >
                   <Download size={16} />
                   <span className="hidden md:inline">匯出 Excel</span>
                   <span className="md:hidden">匯出</span>
                 </button>
              </div>

              {/* LEFT COLUMN: Charts (Desktop 4 cols) */}
              <div className="md:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
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
                            >
                                {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[entry.name]} stroke="none" />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <BarChart2 size={48} className="mb-2 opacity-50"/>
                            <span className="text-sm">本月尚無數據</span>
                        </div>
                        )}
                    </div>
                </div>
              </div>

              {/* RIGHT COLUMN: List (Desktop 8 cols) */}
              <div className="md:col-span-8 space-y-4">
                 <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">詳細紀錄 ({monthlyTasks.length})</h3>
                    </div>
                    
                    <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
                        {monthlyTasks.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">尚無紀錄</div>
                        ) : (
                            monthlyTasks
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((task) => (
                                <button
                                    key={task.id}
                                    onClick={() => setEditingTask(task)}
                                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors group flex items-start gap-4"
                                >
                                    {/* Date Box */}
                                    <div className="flex flex-col items-center justify-center bg-slate-100 rounded-xl w-12 h-12 shrink-0">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">{new Date(task.date).toLocaleString('en-US', { month: 'short' })}</span>
                                        <span className="text-lg font-bold text-slate-800 leading-none">{new Date(task.date).getDate()}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span 
                                                className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                                                style={{ backgroundColor: DEPARTMENT_COLORS[task.department] }}
                                            >
                                                {task.department}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium border border-slate-200 px-1.5 rounded">
                                                {task.eventType}
                                            </span>
                                            {task.product && (
                                                <span className="text-xs text-blue-500 font-medium bg-blue-50 px-1.5 rounded">
                                                    {task.product}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium truncate group-hover:text-blue-700 transition-colors">
                                            {task.description}
                                        </p>
                                    </div>

                                    {/* Hours */}
                                    <div className="text-right shrink-0">
                                        <span className="block text-lg font-bold text-slate-800">{task.hours}<span className="text-xs text-slate-400 ml-0.5">h</span></span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                 </div>
              </div>
           </div>
        )}

      </main>

      {/* --- OVERLAYS --- */}

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex justify-around items-center h-20 pb-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setView('log')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'log' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          {view === 'log' ? <Plus size={28} strokeWidth={2.5} /> : <Plus size={24} />}
          <span className="text-[10px] font-bold">紀錄 (Log)</span>
        </button>
        <div className="w-px h-8 bg-slate-100"></div>
        <button 
          onClick={() => setView('report')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'report' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          {view === 'report' ? <BarChart2 size={28} strokeWidth={2.5} /> : <BarChart2 size={24} />}
          <span className="text-[10px] font-bold">報表 (Reports)</span>
        </button>
      </nav>

      {/* Department Sheet */}
      <BottomSheet isOpen={showDeptSheet} onClose={() => setShowDeptSheet(false)} title="選擇部門">
        <div className="grid grid-cols-2 gap-3 pb-8 md:pb-0">
          {Object.values(Department).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDept(d);
                setShowDeptSheet(false);
              }}
              className={`p-4 rounded-xl font-bold text-lg border-2 transition-all flex items-center justify-between ${
                dept === d 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'
              }`}
            >
              <span>{d}</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEPARTMENT_COLORS[d] }} />
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Product Sheet */}
      <BottomSheet isOpen={showProductSheet} onClose={() => setShowProductSheet(false)} title="選擇產品">
        <div className="grid grid-cols-2 gap-3 pb-8 md:pb-0">
            <button
                onClick={() => {
                    setProduct('');
                    setShowProductSheet(false);
                }}
                className={`p-4 rounded-xl font-bold border-2 transition-all text-center ${
                    product === '' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 bg-white text-slate-400 hover:border-blue-200'
                }`}
            >
                無 (None)
            </button>
            {PRODUCT_LIST.map((p) => (
                <button
                key={p}
                onClick={() => {
                    setProduct(p);
                    setShowProductSheet(false);
                }}
                className={`p-4 rounded-xl font-bold border-2 transition-all text-center ${
                    product === p 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200'
                }`}
                >
                {p}
                </button>
            ))}
        </div>
      </BottomSheet>

      {/* Export Settings Sheet */}
      <BottomSheet isOpen={showExportSheet} onClose={() => setShowExportSheet(false)} title="匯出設定">
        <div className="space-y-6 pb-8 md:pb-0">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase">開始日期</label>
                 <input 
                   type="date"
                   value={exportStart}
                   onChange={(e) => setExportStart(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase">結束日期</label>
                 <input 
                   type="date"
                   value={exportEnd}
                   onChange={(e) => setExportEnd(e.target.value)}
                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="sm" onClick={setExportToLastMonth}>上個月</Button>
              <Button variant="secondary" size="sm" onClick={setExportToCurrentMonth}>這個月</Button>
           </div>

           <Button fullWidth onClick={handleExport} icon={<FileDown size={20}/>}>
             下載 CSV
           </Button>
        </div>
      </BottomSheet>

      {/* Edit Modal */}
      <EditTaskModal 
        task={editingTask} 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)}
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

    </div>
  );
}