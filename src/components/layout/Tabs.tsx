import { useStore } from '../../store/useStore';
import { X, PlayCircle, Plus } from 'lucide-react';

export function Tabs() {
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const deleteTab = useStore((s) => s.deleteTab);

  return (
    <div className="flex items-end space-x-1 px-2 pt-2 bg-slate-100 border-b border-slate-300 w-full overflow-x-auto shadow-sm">
      {tabs.map(tab => (
        <div 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 mt-1 rounded-t-lg font-medium cursor-pointer transition select-none
            ${activeTabId === tab.id ? 'bg-white text-blue-700 shadow-md translate-y-px z-10 border border-slate-300 border-b-transparent' : 'bg-slate-200 text-slate-600 hover:bg-slate-300 border border-transparent'}
          `}
        >
          {tab.isSandbox && <PlayCircle size={16} className="text-yellow-500" />}
          <span>{tab.name}</span>
          {!tab.isSandbox && (
            <button 
              onClick={(e) => { e.stopPropagation(); deleteTab(tab.id); }}
              className="p-1 hover:bg-red-100 rounded-full text-slate-400 hover:text-red-500 transition"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      <div className="ml-2 py-2 flex items-center justify-center p-2 mt-1 text-slate-500 cursor-help" title="Загружайте файлы для новых вкладок">
        <Plus size={18} />
      </div>
    </div>
  );
}
