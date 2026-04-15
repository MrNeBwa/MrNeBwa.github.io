import { useStore } from '../../store/useStore';
import { ArrowRightLeft, Trash2, X } from 'lucide-react';
import { useMemo } from 'react';
import type { Edge } from '@xyflow/react';

export function EdgePropertiesPanel() {
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const updateEdgeLabel = useStore((s) => s.updateEdgeLabel);
  const updateEdgeProperty = useStore((s) => s.updateEdgeProperty);
  const deleteEdge = useStore((s) => s.deleteEdge);
  const reverseEdge = useStore((s) => s.reverseEdge);
  const selectEdge = useStore((s) => s.selectEdge);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);
  const selectedEdge = useMemo(() => {
    return activeTab?.edges.find(e => e.id === selectedEdgeId) as Edge | undefined;
  }, [activeTab, selectedEdgeId]);

  if (!selectedEdge) {
    return null;
  }

  const label = (selectedEdge.label as string) || '';
  const strokeColor = (selectedEdge.style as any)?.stroke || '#334155';
  const strokeWidth = (selectedEdge.style as any)?.strokeWidth || 1.6;
  const curveType = selectedEdge.type || 'smoothstep';
  const animated = selectedEdge.animated || false;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdgeLabel(selectedEdge.id, e.target.value);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdgeProperty(selectedEdge.id, 'strokeColor', e.target.value);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const widthValue = parseFloat(e.target.value);
    if (widthValue > 0) {
      updateEdgeProperty(selectedEdge.id, 'strokeWidth', widthValue);
    }
  };

  const handleCurveTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateEdgeProperty(selectedEdge.id, 'curveType', e.target.value);
  };

  const handleAnimatedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdgeProperty(selectedEdge.id, 'animated', e.target.checked);
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Свойства стрелки</h2>
        <button
          onClick={() => selectEdge(null)}
          className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Текст на стрелке */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Текст на стрелке</label>
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            placeholder="Введите текст для стрелки"
            className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Например: "Да", "Нет", "True", "False"</p>
        </div>

        {/* Тип кривой */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Тип линии</label>
          <select
            value={curveType}
            onChange={handleCurveTypeChange}
            className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="smoothstep">Плавная (Smoothstep)</option>
            <option value="bezier">Безье (Bezier)</option>
            <option value="straight">Прямая (Straight)</option>
          </select>
        </div>

        {/* Цвет стрелки */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Цвет стрелки</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={strokeColor}
              onChange={handleColorChange}
              className="h-10 w-16 rounded border border-slate-300 cursor-pointer"
            />
            <input
              type="text"
              value={strokeColor}
              onChange={handleColorChange}
              className="flex-1 px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>
        </div>

        {/* Толщина стрелки */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Толщина: <span className="font-mono text-blue-600">{strokeWidth.toFixed(1)}px</span>
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.1"
              value={strokeWidth}
              onChange={handleWidthChange}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="0.5"
              max="4"
              step="0.1"
              value={strokeWidth}
              onChange={handleWidthChange}
              className="w-16 px-2 py-1 rounded border border-slate-300 text-center text-sm"
            />
          </div>
        </div>

        {/* Анимация */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={animated}
              onChange={handleAnimatedChange}
              className="w-4 h-4 rounded border border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">Анимированная стрелка</span>
          </label>
        </div>

        {/* Действия со стрелкой */}
        <div className="pt-2 border-t border-slate-200 space-y-2">
          <button
            onClick={() => reverseEdge(selectedEdge.id)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-3 rounded flex items-center justify-center gap-2 transition"
          >
            <ArrowRightLeft size={16} />
            <span>Развернуть направление</span>
          </button>

          <button
            onClick={() => deleteEdge(selectedEdge.id)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded flex items-center justify-center gap-2 transition"
          >
            <Trash2 size={16} />
            <span>Удалить стрелку</span>
          </button>
        </div>

        {/* Информация */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            <span className="font-medium">ID:</span> {selectedEdge.id}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-medium">От:</span> {selectedEdge.source}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-medium">К:</span> {selectedEdge.target}
          </p>
        </div>
      </div>
    </div>
  );
}
