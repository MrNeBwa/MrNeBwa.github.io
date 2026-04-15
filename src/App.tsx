import { Sidebar } from './components/layout/Sidebar';
import { Tabs } from './components/layout/Tabs';
import { Canvas } from './components/layout/Canvas';
import { NodePropertiesPanel } from './components/layout/NodePropertiesPanel';
import { EdgePropertiesPanel } from './components/layout/EdgePropertiesPanel';
import { useStore } from './store/useStore';

function App() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0">
        <Tabs />
        <div className="flex-1 relative flex">
          <div className="flex-1 relative">
            <Canvas />
          </div>
          {selectedNodeId && <NodePropertiesPanel />}
          {selectedEdgeId && <EdgePropertiesPanel />}
        </div>
      </div>
    </div>
  );
}

export default App;
