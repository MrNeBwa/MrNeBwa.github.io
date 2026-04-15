import { Handle, Position } from '@xyflow/react';
import { useStore } from '../../store/useStore';

export function ProcessNode({ id, data }: { id: string; data: any }) {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectNode = useStore((s) => s.selectNode);
  const isSelected = selectedNodeId === id;
  const width = data.width || 220;
  const height = data.height || 90;
  const fontSize = data.fontSize || 14;
  
  return (
    <div
      className={`relative border-2 shadow-sm bg-white flex items-center justify-center px-3 py-2 cursor-pointer select-none ${isSelected ? 'border-blue-600' : 'border-slate-700'}`}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
      style={{ 
        backgroundColor: data.color,
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${fontSize}px`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-700" />
      <div className="text-center font-medium font-mono leading-tight break-words">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-700" />
    </div>
  );
}

export function DecisionNode({ id, data }: { id: string; data: any }) {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectNode = useStore((s) => s.selectNode);
  const isSelected = selectedNodeId === id;
  const width = data.width || 240;
  const height = data.height || 140;
  const fontSize = data.fontSize || 14;
  
  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer select-none"
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 140" preserveAspectRatio="none">
        <polygon points="120,4 236,70 120,136 4,70" fill={data.color} stroke={isSelected ? '#2563eb' : '#334155'} strokeWidth="4" />
      </svg>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-700" />
      <div className="text-center font-medium font-mono leading-tight z-10 px-8" style={{ fontSize: `${fontSize}px` }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-700" />
      <Handle type="source" id="left" position={Position.Left} className="!w-2 !h-2 !bg-slate-700" />
      <Handle type="source" id="right" position={Position.Right} className="!w-2 !h-2 !bg-slate-700" />
    </div>
  );
}

export function IONode({ id, data }: { id: string; data: any }) {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectNode = useStore((s) => s.selectNode);
  const isSelected = selectedNodeId === id;
  const width = data.width || 240;
  const height = data.height || 100;
  const fontSize = data.fontSize || 14;
  
  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer select-none"
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
        <polygon points="24,4 236,4 216,96 4,96" fill={data.color} stroke={isSelected ? '#2563eb' : '#334155'} strokeWidth="4" />
      </svg>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-700" />
      <div className="text-center font-medium font-mono leading-tight z-10 px-8" style={{ fontSize: `${fontSize}px` }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-700" />
    </div>
  );
}

export function TerminalNode({ id, data }: { id: string; data: any }) {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectNode = useStore((s) => s.selectNode);
  const isSelected = selectedNodeId === id;
  const width = data.width || 180;
  const height = data.height || 70;
  const fontSize = data.fontSize || 14;
  
  return (
    <div
      className={`relative border-2 rounded-full shadow-sm flex items-center justify-center cursor-pointer select-none ${isSelected ? 'border-blue-600' : 'border-slate-700'}`}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
      style={{ 
        backgroundColor: data.color,
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${fontSize}px`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-700" />
      <div className="text-center font-bold font-mono">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-700" />
    </div>
  );
}

export function PreparationNode({ id, data }: { id: string; data: any }) {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectNode = useStore((s) => s.selectNode);
  const isSelected = selectedNodeId === id;
  const width = data.width || 240;
  const height = data.height || 100;
  const fontSize = data.fontSize || 14;
  
  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer select-none"
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 100" preserveAspectRatio="none">
        <polygon points="30,4 210,4 236,50 210,96 30,96 4,50" fill={data.color} stroke={isSelected ? '#2563eb' : '#334155'} strokeWidth="4" />
      </svg>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-700" />
      <div className="text-center font-medium font-mono leading-tight z-10 px-7" style={{ fontSize: `${fontSize}px` }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-700" />
    </div>
  );
}

export const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  io: IONode,
  terminal: TerminalNode,
  preparation: PreparationNode,
};
export default nodeTypes;
