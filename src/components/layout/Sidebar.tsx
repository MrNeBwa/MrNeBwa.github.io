import { useStore } from '../../store/useStore';
import { Download, Upload, Settings, RotateCcw, Image } from 'lucide-react';
import { useRef } from 'react';
import { parseCppFileToFunctionFlowcharts } from '../../lib/parser';
import * as htmlToImage from 'html-to-image';
import type { Tab } from '../../store/useStore';

export function Sidebar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colors = useStore((s) => s.colors);
  const setColor = useStore((s) => s.setColor);
  const addTab = useStore((s) => s.addTab);
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const content = await file.text();
      const flows = parseCppFileToFunctionFlowcharts(content, colors);

      if (!flows.length) {
        console.warn(`No functions found in ${file.name}`);
        continue;
      }

      flows.forEach((flow, index) => {
        const tab: Tab = {
          id: `tab-${Date.now()}-${file.name}-${flow.functionName}-${index}`,
          name: `${file.name} :: ${flow.functionName}`,
          nodes: flow.nodes,
          edges: flow.edges,
        };
        addTab(tab);
      });
    }

    e.target.value = '';
  };

  const exportCanvas = async () => {
    const canvas = document.querySelector('.react-flow__pane') as HTMLElement;
    if (!canvas) return;
    const dataUrl = await htmlToImage.toPng(canvas, { backgroundColor: '#fff' });
    const link = document.createElement('a');
    link.download = `flowchart-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportFullDiagram = async () => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport || !activeTab) return;

    const estimateNodeSize = (type?: string) => {
      if (type === 'decision') return { width: 240, height: 140 };
      if (type === 'terminal') return { width: 180, height: 70 };
      return { width: 220, height: 90 };
    };

    const withSizes = activeTab.nodes.map((node) => {
      const fallback = estimateNodeSize(node.type);
      const width = Number((node as any).width ?? (node.data as any)?.width ?? fallback.width);
      const height = Number((node as any).height ?? (node.data as any)?.height ?? fallback.height);
      return {
        x: node.position.x,
        y: node.position.y,
        width,
        height,
      };
    });

    if (!withSizes.length) return;

    const minX = Math.min(...withSizes.map((n) => n.x));
    const minY = Math.min(...withSizes.map((n) => n.y));
    const maxX = Math.max(...withSizes.map((n) => n.x + n.width));
    const maxY = Math.max(...withSizes.map((n) => n.y + n.height));

    const padding = 80;
    const imageWidth = Math.max(1000, Math.ceil(maxX - minX + padding * 2));
    const imageHeight = Math.max(700, Math.ceil(maxY - minY + padding * 2));

    try {
      const dataUrl = await htmlToImage.toPng(viewport, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${-minX + padding}px, ${-minY + padding}px) scale(1)`,
          transformOrigin: '0 0',
        },
      });

      const link = document.createElement('a');
      link.download = `flowchart-full-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Ошибка экспорта. Попробуйте ещё раз.');
    }
  };

  const resetSandbox = () => {
    // Find and switch to sandbox tab
    const sandboxTab = tabs.find(t => t.id === 'sandbox');
    if (sandboxTab) {
      setActiveTab('sandbox');
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col p-4 shadow-lg flex-shrink-0">
      <h1 className="text-xl font-bold mb-8 flex items-center space-x-2">
        <Settings size={24} />
        <span>GOST Flow Dev</span>
      </h1>
      
      <div className="space-y-4 flex-grow">
        <div className="bg-slate-800 p-4 rounded-lg">
          <h2 className="text-sm uppercase text-slate-400 mb-3 tracking-wider font-semibold">Настройки цветов</h2>
          {Object.entries(colors).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center mb-2">
              <label className="text-sm capitalize">{key}</label>
              <input 
                type="color" 
                value={val as string} 
                onChange={(e) => setColor(key, e.target.value)}
                className="w-8 h-8 rounded shrink-0" 
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 mt-auto pt-4 border-t border-slate-700">
        <input type="file" ref={fileInputRef} className="hidden" accept=".cpp,.c,.h" multiple onChange={handleFileUpload} />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center space-x-2 transition"
        >
          <Upload size={18} />
          <span>Загрузить C++ файлы</span>
        </button>
        <button 
          onClick={exportCanvas}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center space-x-2 transition"
        >
          <Download size={18} />
          <span>Экспорт PNG</span>
        </button>
        <button 
          onClick={exportFullDiagram}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center space-x-2 transition"
        >
          <Image size={18} />
          <span>Экспорт HD (2x)</span>
        </button>
        <button 
          onClick={resetSandbox}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center space-x-2 transition"
        >
          <RotateCcw size={18} />
          <span>Образец блоков</span>
        </button>
      </div>
    </div>
  );
}
