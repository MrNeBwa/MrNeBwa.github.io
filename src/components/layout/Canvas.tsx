import { useMemo, useCallback } from 'react';
import { ReactFlow, MiniMap, Controls, Background, SelectionMode } from "@xyflow/react";
import type { Connection, NodeChange, EdgeChange, Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store/useStore';
import { nodeTypes } from '../nodes/ProcessNode';

export function Canvas() {
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);
  
  const updateTabNodes = useStore((s) => s.updateTabNodes);
  const updateTabEdges = useStore((s) => s.updateTabEdges);
  const onConnectActiveTab = useStore((s) => s.onConnectActiveTab);
  const selectNode = useStore((s) => s.selectNode);
  const selectEdge = useStore((s) => s.selectEdge);

  if (!activeTab) return <div className="p-8 text-center text-slate-500">Нет активной вкладки</div>;

  const handleNodesChange = (chs: NodeChange[]) => {
    updateTabNodes(activeTab.id, chs);
  };

  const handleEdgesChange = (chs: EdgeChange[]) => updateTabEdges(activeTab.id, chs);
  const handleConnect = (connection: Connection) => onConnectActiveTab(connection);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    selectNode(node.id);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
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
      selectable: true,
      focusable: true,
      interactionWidth: (edge as any).interactionWidth ?? 32,
    })),
    [activeTab.edges],
  );

  const defaultEdgeOptions = {
    type: 'smoothstep' as const,
    animated: false,
    selectable: true,
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
        onSelectionChange={handleSelectionChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={() => {
          selectNode(null);
          selectEdge(null);
        }}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        elementsSelectable
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
