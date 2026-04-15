import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, MarkerType } from '@xyflow/react';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';

export type Tab = {
  id: string;
  name: string;
  isSandbox?: boolean;
  nodes: Node[];
  edges: Edge[];
};

interface FlowStore {
  tabs: Tab[];
  activeTabId: string | null;
  colors: Record<string, string>;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  addTab: (tab: Tab) => void;
  setActiveTab: (id: string) => void;
  updateTabNodes: (tabId: string, changes: NodeChange[]) => void;
  updateTabEdges: (tabId: string, changes: EdgeChange[]) => void;
  onConnectActiveTab: (connection: Connection) => void;
  setColor: (nodeType: string, color: string) => void;
  deleteTab: (id: string) => void;
  parseAndAddFile: (content: string, filename: string) => void;
  addNodesToActiveTab: (nodes: Node[], edges: Edge[]) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  updateNodeProperty: (nodeId: string, property: string, value: any) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateEdgeProperty: (edgeId: string, property: string, value: any) => void;
  deleteEdge: (edgeId: string) => void;
  reverseEdge: (edgeId: string) => void;
}

const initialSandbox: Tab = {
  id: 'sandbox',
  name: 'Sandbox',
  isSandbox: true,
  nodes: [
    {
      id: '1',
      type: 'process',
      position: { x: 250, y: 100 },
      data: { label: 'Начало программы', color: '#e2e8f0', scale: 1, width: 220, height: 90, fontSize: 14 },
    },
    {
      id: '2',
      type: 'process',
      position: { x: 250, y: 250 },
      data: { label: 'Инициализация переменных', color: '#e2e8f0', scale: 1, width: 220, height: 90, fontSize: 14 },
    },
    {
      id: '3',
      type: 'decision',
      position: { x: 250, y: 450 },
      data: { label: 'Условие?', color: '#fef08a', scale: 1, width: 240, height: 140, fontSize: 14 },
    },
    {
      id: '4',
      type: 'process',
      position: { x: 50, y: 650 },
      data: { label: 'Обработка A', color: '#e2e8f0', scale: 1, width: 220, height: 90, fontSize: 14 },
    },
    {
      id: '5',
      type: 'process',
      position: { x: 450, y: 650 },
      data: { label: 'Обработка B', color: '#e2e8f0', scale: 1, width: 220, height: 90, fontSize: 14 },
    },
    {
      id: '6',
      type: 'terminal',
      position: { x: 250, y: 850 },
      data: { label: 'Конец', color: '#fecaca', scale: 1, width: 180, height: 70, fontSize: 14 },
    },
  ],
  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      label: '',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#334155', strokeWidth: 1.6 },
      data: { curveType: 'smoothstep', strokeColor: '#334155', strokeWidth: 1.6 },
      markerEnd: { type: 'arrowclosed' as const, width: 18, height: 18, color: '#334155' },
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      label: '',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#334155', strokeWidth: 1.6 },
      data: { curveType: 'smoothstep', strokeColor: '#334155', strokeWidth: 1.6 },
      markerEnd: { type: 'arrowclosed' as const, width: 18, height: 18, color: '#334155' },
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      sourceHandle: 'left',
      label: 'Да',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#334155', strokeWidth: 1.6 },
      data: { curveType: 'smoothstep', strokeColor: '#334155', strokeWidth: 1.6 },
      markerEnd: { type: 'arrowclosed' as const, width: 18, height: 18, color: '#334155' },
    },
    {
      id: 'e3-5',
      source: '3',
      target: '5',
      sourceHandle: 'right',
      label: 'Нет',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#334155', strokeWidth: 1.6 },
      data: { curveType: 'smoothstep', strokeColor: '#334155', strokeWidth: 1.6 },
      markerEnd: { type: 'arrowclosed' as const, width: 18, height: 18, color: '#334155' },
    },
    {
      id: 'e4-6',
      source: '4',
      target: '6',
      label: '',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#334155', strokeWidth: 1.6 },
      data: { curveType: 'smoothstep', strokeColor: '#334155', strokeWidth: 1.6 },
      markerEnd: { type: 'arrowclosed' as const, width: 18, height: 18, color: '#334155' },
    },
    {
      id: 'e5-6',
      source: '5',
      target: '6',
      label: '',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#334155', strokeWidth: 1.6 },
      data: { curveType: 'smoothstep', strokeColor: '#334155', strokeWidth: 1.6 },
      markerEnd: { type: 'arrowclosed' as const, width: 18, height: 18, color: '#334155' },
    },
  ],
};

const defaultColors = {
  process: '#e2e8f0', // slate-200
  decision: '#fef08a', // yellow-200
  io: '#bae6fd',       // sky-200
  terminal: '#fecaca', // red-200
  preparation: '#d9f99d'// lime-200
};

export const useStore = create<FlowStore>((set) => ({
  tabs: [initialSandbox],
  activeTabId: 'sandbox',
  colors: defaultColors,
  selectedNodeId: null,
  selectedEdgeId: null,
  addTab: (tab) => set((state) => ({ tabs: [...state.tabs, tab], activeTabId: tab.id })),
  setActiveTab: (id) => set({ activeTabId: id, selectedNodeId: null, selectedEdgeId: null }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: null }),
  selectEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNodeId: null }),
  deleteTab: (id) => set((state) => ({ 
      tabs: state.tabs.filter(t => t.id !== id),
      activeTabId: state.activeTabId === id ? state.tabs[0].id : state.activeTabId
  })),
  updateTabNodes: (tabId, changes) => set((state) => ({
    tabs: state.tabs.map(tab => tab.id === tabId ? { ...tab, nodes: applyNodeChanges(changes, tab.nodes) } : tab)
  })),
  updateTabEdges: (tabId, changes) => set((state) => ({
    tabs: state.tabs.map(tab => tab.id === tabId ? { ...tab, edges: applyEdgeChanges(changes, tab.edges) } : tab)
  })),
  updateNodeProperty: (nodeId, property, value) => set((state) => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (!activeTab) return state;

    const updatedNodes = activeTab.nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, [property]: value }
        };
      }
      return node;
    });

    return {
      tabs: state.tabs.map(tab => tab.id === state.activeTabId ? { ...tab, nodes: updatedNodes } : tab)
    };
  }),
  updateEdgeLabel: (edgeId, label) => set((state) => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (!activeTab) return state;

    const updatedEdges = activeTab.edges.map(edge => {
      if (edge.id === edgeId) {
        return { ...edge, label };
      }
      return edge;
    });

    return {
      tabs: state.tabs.map(tab => tab.id === state.activeTabId ? { ...tab, edges: updatedEdges } : tab)
    };
  }),
  updateEdgeProperty: (edgeId, property, value) => set((state) => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (!activeTab) return state;

    const updatedEdges = activeTab.edges.map(edge => {
      if (edge.id === edgeId) {
        const updatedEdge = { ...edge };
        
        // Обновить style в зависимости от свойства
        if (property === 'strokeColor') {
          updatedEdge.style = { ...updatedEdge.style, stroke: value };
          const markerEnd = typeof updatedEdge.markerEnd === 'object' && updatedEdge.markerEnd !== null
            ? updatedEdge.markerEnd
            : undefined;
          updatedEdge.markerEnd = {
            type: markerEnd?.type ?? MarkerType.ArrowClosed,
            ...(markerEnd ?? {}),
            color: value,
          };
          if (updatedEdge.data) updatedEdge.data.strokeColor = value;
        } else if (property === 'strokeWidth') {
          updatedEdge.style = { ...updatedEdge.style, strokeWidth: value };
          if (updatedEdge.data) updatedEdge.data.strokeWidth = value;
        } else if (property === 'curveType') {
          updatedEdge.type = value === 'straight' ? 'straight' : value === 'bezier' ? 'bezier' : 'smoothstep';
          if (updatedEdge.data) updatedEdge.data.curveType = value;
        } else if (property === 'animated') {
          updatedEdge.animated = value;
        }
        
        return updatedEdge;
      }
      return edge;
    });

    return {
      tabs: state.tabs.map(tab => tab.id === state.activeTabId ? { ...tab, edges: updatedEdges } : tab)
    };
  }),
  deleteEdge: (edgeId) => set((state) => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (!activeTab) return state;

    const updatedEdges = activeTab.edges.filter(edge => edge.id !== edgeId);

    return {
      tabs: state.tabs.map(tab => tab.id === state.activeTabId ? { ...tab, edges: updatedEdges } : tab),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
    };
  }),
  reverseEdge: (edgeId) => set((state) => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (!activeTab) return state;

    const updatedEdges = activeTab.edges.map((edge) => {
      if (edge.id !== edgeId) return edge;

      const updatedEdge: Edge = {
        ...edge,
        source: edge.target,
        target: edge.source,
        sourceHandle: undefined,
        targetHandle: undefined,
      };

      return updatedEdge;
    });

    return {
      tabs: state.tabs.map(tab => tab.id === state.activeTabId ? { ...tab, edges: updatedEdges } : tab),
    };
  }),
  onConnectActiveTab: (connection) => set((state) => {
    const active = state.activeTabId;
    if (!active) return state;

    const edgeWithArrow = {
      ...connection,
      label: '',
      type: 'smoothstep' as const,
      style: { stroke: '#334155', strokeWidth: 1.6 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: '#334155',
      },
    };

    return {
      tabs: state.tabs.map(tab => tab.id === active ? { ...tab, edges: addEdge(edgeWithArrow, tab.edges) } : tab)
    };
  }),
  setColor: (nodeType, color) => set((state) => ({ colors: { ...state.colors, [nodeType]: color } })),
  addNodesToActiveTab: (newNodes, newEdges) => set((state) => {
    const active = state.activeTabId;
    if (!active) return state;
    return {
      tabs: state.tabs.map(tab => tab.id === active ? { 
        ...tab, 
        nodes: [...tab.nodes, ...newNodes],
        edges: [...tab.edges, ...newEdges]
      } : tab)
    };
  }),
  parseAndAddFile: (_content, _filename) => {
  }
}));
