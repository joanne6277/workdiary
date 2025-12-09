import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Button } from './Button'; // 確保路徑正確引用你的 Button 元件

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 將文字內容提取出來，這裡就像你的 "Markdown" 內容區，方便修改
const GUIDE_STEPS = [
  {
    step: 1,
    title: '快速上手指南',
    content: '選擇部門、產品與工作類型，輸入內容與時數，點擊「加入待提交清單」。可以一次新增多筆，最後再統一上傳。',
    colorClass: 'bg-blue-600' // 可以自訂顏色
  },
  {
    step: 2,
    title: '使用範本',
    content: '點擊上方的「常用工作項目」卡片，可快速帶入預設的部門、類型與時數，省去重複輸入的時間。',
    colorClass: 'bg-emerald-500'
  },
  {
    step: 3,
    title: '設定與自訂',
    content: '在「設定」頁面中，您可以新增自己的常用範本，或是自訂特殊的事件類型。',
    colorClass: 'bg-amber-500'
  }
];

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <HelpCircle size={24} />
            </div>
            <h3 className="font-bold text-xl text-slate-800">如何成為頂級牛馬 </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content (自動產生) */}
        <div className="p-6 space-y-6 text-slate-600">
          {GUIDE_STEPS.map((item) => (
            <div key={item.step} className="space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <span className={`w-6 h-6 ${item.colorClass} text-white rounded-full flex items-center justify-center text-xs shadow-sm`}>
                  {item.step}
                </span>
                {item.title}
              </h4>
              <p className="text-sm pl-8 leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-3xl sticky bottom-0">
          <Button fullWidth size="lg" onClick={onClose}>
            開始使用 (Got it!)
          </Button>
        </div>
      </div>
    </div>
  );
};