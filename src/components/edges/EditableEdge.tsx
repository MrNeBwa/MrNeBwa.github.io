import { BaseEdge, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../store/useStore';

type FlowPoint = { x: number; y: number };

function getDefaultControlPoint(sourceX: number, sourceY: number, targetX: number, targetY: number): FlowPoint {
  return {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  };
}

function buildPath(curveType: string, sourceX: number, sourceY: number, targetX: number, targetY: number, control: FlowPoint): string {
  if (curveType === 'bezier') {
    return `M ${sourceX} ${sourceY} Q ${control.x} ${control.y} ${targetX} ${targetY}`;
  }

  if (curveType === 'straight') {
    return `M ${sourceX} ${sourceY} L ${control.x} ${control.y} L ${targetX} ${targetY}`;
  }

  return `M ${sourceX} ${sourceY} L ${control.x} ${sourceY} L ${control.x} ${targetY} L ${targetX} ${targetY}`;
}

export function EditableEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    markerEnd,
    style,
    data,
    label,
    selected,
  } = props;

  const updateEdgeControlPoint = useStore((s) => s.updateEdgeControlPoint);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);
  const { screenToFlowPosition } = useReactFlow();
  const draggingRef = useRef(false);

  const edgeData = (data || {}) as Record<string, any>;
  const curveType = String(edgeData.curveType || 'smoothstep');

  const controlPoint = useMemo(() => {
    const saved = edgeData.controlPoint as FlowPoint | undefined;
    return saved || getDefaultControlPoint(sourceX, sourceY, targetX, targetY);
  }, [edgeData.controlPoint, sourceX, sourceY, targetX, targetY]);

  const edgePath = useMemo(
    () => buildPath(curveType, sourceX, sourceY, targetX, targetY, controlPoint),
    [curveType, sourceX, sourceY, targetX, targetY, controlPoint],
  );

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!draggingRef.current) return;
      const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      updateEdgeControlPoint(id, { x: flowPosition.x, y: flowPosition.y });
    };

    const onMouseUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [id, screenToFlowPosition, updateEdgeControlPoint]);

  const showHandle = selected || selectedEdgeId === id;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} interactionWidth={36} />

      {label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${controlPoint.x}px, ${controlPoint.y}px)`,
              fontSize: 12,
              fontWeight: 600,
              color: '#0f172a',
              background: 'rgba(255,255,255,0.92)',
              padding: '2px 6px',
              borderRadius: 4,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      ) : null}

      {showHandle ? (
        <g className="nodrag nopan">
          <circle
            cx={controlPoint.x}
            cy={controlPoint.y}
            r={7}
            fill="#ffffff"
            stroke="#2563eb"
            strokeWidth={2}
            style={{ cursor: 'grab' }}
            onMouseDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              draggingRef.current = true;
            }}
          />
        </g>
      ) : null}
    </>
  );
}

export default EditableEdge;
