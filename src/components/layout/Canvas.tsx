import { useMemo, useCallback } from 'react';
import { ReactFlow, MiniMap, Controls, Background, SelectionMode } from "@xyflow/react";
import type { Connection, NodeChange, EdgeChange, Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store/useStore';
import { nodeTypes } from '../nodes/ProcessNode';
import { EditableEdge } from '../edges/EditableEdge';

const edgeTypes = {
  editableEdge: EditableEdge,
};

export function Canvas() {
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);
  
  const updateTabNodes = useStore((s) => s.updateTabNodes);
  const updateTabEdges = useStore((s) => s.updateTabEdges);
  const onConnectActiveTab = useStore((s) => s.onConnectActiveTab);
  const reconnectEdge = useStore((s) => s.reconnectEdge);
  const selectNode = useStore((s) => s.selectNode);
  const selectEdge = useStore((s) => s.selectEdge);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);

  if (!activeTab) return <div className="p-8 text-center text-slate-500">Нет активной вкладки</div>;

  const handleNodesChange = (chs: NodeChange[]) => {
    updateTabNodes(activeTab.id, chs);
  };

  const handleEdgesChange = (chs: EdgeChange[]) => updateTabEdges(activeTab.id, chs);
  const handleConnect = (connection: Connection) => onConnectActiveTab(connection);
  const handleReconnect = useCallback((oldEdge: Edge, connection: Connection) => {
    reconnectEdge(oldEdge.id, connection);
    selectEdge(oldEdge.id);
    selectNode(null);
  }, [reconnectEdge, selectEdge, selectNode]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    _event.stopPropagation();
    selectNode(node.id);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    _event.stopPropagation();
    selectEdge(edge.id);
    selectNode(null);
  }, [selectNode, selectEdge]);

  const handleSelectionChange = useCallback(({ nodes = [], edges = [] }: { nodes?: Node[]; edges?: Edge[] }) => {
    if (nodes.length === 1 && edges.length === 0) {
      selectNode(nodes[0].id);
      selectEdge(null);
    } else if (edges.length === 1 && nodes.length === 0) {
      selectEdge(edges[0].id);
      selectNode(null);
    }
  }, [selectNode, selectEdge]);

  const blockColor = activeTab.isSandbox ? '#f0f9ff' : '#f8fafc';
  const renderedEdges = useMemo(
    () => activeTab.edges.map((edge) => ({
      ...edge,
      type: 'editableEdge',
      selectable: true,
      reconnectable: true,
      focusable: true,
      interactionWidth: (edge as any).interactionWidth ?? 32,
      data: {
        ...(typeof edge.data === 'object' && edge.data !== null ? edge.data : {}),
        curveType: (edge as any)?.data?.curveType || edge.type || 'smoothstep',
      },
      style: {
        ...(edge.style || {}),
        stroke: selectedEdgeId === edge.id ? '#2563eb' : (edge.style as any)?.stroke || '#334155',
        strokeWidth: selectedEdgeId === edge.id
          ? Math.max(2.4, Number((edge.style as any)?.strokeWidth || 1.6) + 0.8)
          : (edge.style as any)?.strokeWidth || 1.6,
      },
    })),
    [activeTab.edges, selectedEdgeId],
  );

  const defaultEdgeOptions = {
    type: 'smoothstep' as const,
    animated: false,
    selectable: true,
    reconnectable: true,
    focusable: true,
    interactionWidth: 32,
    style: { stroke: '#334155', strokeWidth: 1.6 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: '#334155',
    },
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: blockColor }}>
      <ReactFlow
        nodes={activeTab.nodes}
        edges={renderedEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onReconnect={handleReconnect}
        onSelectionChange={handleSelectionChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        elementsSelectable
        edgesReconnectable
        edgesFocusable
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode={['Control', 'Meta']}
        panOnDrag={[1, 2]}
        panOnScroll
        minZoom={0.01}
        maxZoom={8}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
