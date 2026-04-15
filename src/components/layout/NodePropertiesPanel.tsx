import { useStore } from '../../store/useStore';
import { Copy, X } from 'lucide-react';
import { useMemo } from 'react';
import type { Node } from '@xyflow/react';

export function NodePropertiesPanel() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const updateNodeProperty = useStore((s) => s.updateNodeProperty);
  const selectNode = useStore((s) => s.selectNode);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);
  const selectedNode = useMemo(() => {
    return activeTab?.nodes.find(n => n.id === selectedNodeId) as Node | undefined;
  }, [activeTab, selectedNodeId]);

  if (!selectedNode) {
    return null;
  }

  const label = (selectedNode.data?.label as string) || '';
  const color = (selectedNode.data?.color as string) || '#ffffff';
  const width = (selectedNode.data?.width as number) || 220;
  const height = (selectedNode.data?.height as number) || 90;
  const fontSize = (selectedNode.data?.fontSize as number) || 14;

  const handleLabelChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeProperty(selectedNode.id, 'label', e.target.value);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeProperty(selectedNode.id, 'color', e.target.value);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const widthValue = parseFloat(e.target.value);
    if (widthValue > 0) {
      updateNodeProperty(selectedNode.id, 'width', widthValue);
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const heightValue = parseFloat(e.target.value);
    if (heightValue > 0) {
      updateNodeProperty(selectedNode.id, 'height', heightValue);
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fontSizeValue = parseFloat(e.target.value);
    if (fontSizeValue > 0) {
      updateNodeProperty(selectedNode.id, 'fontSize', fontSizeValue);
    }
  };

  const handleCopyToClipboard = () => {
    const text = label;
    navigator.clipboard.writeText(text).then(() => {
      const isSuccess = document.querySelector('[data-copy-toast]');
      if (!isSuccess) {
        const toast = document.createElement('div');
        toast.setAttribute('data-copy-toast', 'true');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
        toast.textContent = 'Скопировано в буфер';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    });
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Свойства блока</h2>
        <button
          onClick={() => selectNode(null)}
          className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Текст блока */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Текст</label>
          <textarea
            value={label}
            onChange={handleLabelChange}
            className="w-full px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            rows={3}
          />
          <button
            onClick={handleCopyToClipboard}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
          >
            <Copy size={16} />
            Копировать текст
          </button>
        </div>

        {/* Размер шрифта */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Размер шрифта: <span className="font-mono text-blue-600">{fontSize}px</span>
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min="8"
              max="32"
              step="1"
              value={fontSize}
              onChange={handleFontSizeChange}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              value={fontSize}
              onChange={handleFontSizeChange}
              className="w-12 px-2 py-1 rounded border border-slate-300 text-center text-sm"
            />
          </div>
        </div>

        {/* Размеры блока */}
        <div className="border-t border-slate-200 pt-3">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Размеры блока</h3>
          
          {/* Ширина */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Ширина: <span className="font-mono text-slate-700">{width}px</span>
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="100"
                max="400"
                step="10"
                value={width}
                onChange={handleWidthChange}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                value={width}
                onChange={handleWidthChange}
                className="w-16 px-2 py-1 rounded border border-slate-300 text-center text-xs"
              />
            </div>
          </div>

          {/* Высота */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Высота: <span className="font-mono text-slate-700">{height}px</span>
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={height}
                onChange={handleHeightChange}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                value={height}
                onChange={handleHeightChange}
                className="w-16 px-2 py-1 rounded border border-slate-300 text-center text-xs"
              />
            </div>
          </div>
        </div>

        {/* Цвет */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Цвет</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="h-10 w-16 rounded border border-slate-300 cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={handleColorChange}
              className="flex-1 px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>
        </div>

        {/* Информация */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            <span className="font-medium">ID:</span> {selectedNode.id}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-medium">Тип:</span> {selectedNode.type}
          </p>
        </div>
      </div>
    </div>
  );
}
