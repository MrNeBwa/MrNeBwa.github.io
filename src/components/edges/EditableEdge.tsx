import { BaseEdge, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../store/useStore';

type FlowPoint = { x: number; y: number };

function buildPolylinePath(points: FlowPoint[]): string {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(' ')}`;
}

function buildBezierPath(points: FlowPoint[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    if (index === points.length - 2) {
      path += ` Q ${current.x} ${current.y} ${next.x} ${next.y}`;
    } else {
      path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
    }
  }
  return path;
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

  const setEdgeControlPoint = useStore((s) => s.setEdgeControlPoint);
  const addEdgeControlPoint = useStore((s) => s.addEdgeControlPoint);
  const removeEdgeControlPoint = useStore((s) => s.removeEdgeControlPoint);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);
  const { screenToFlowPosition } = useReactFlow();
  const draggingPointIndexRef = useRef<number | null>(null);

  const edgeData = (data || {}) as Record<string, any>;
  const curveType = String(edgeData.curveType || 'smoothstep');
  const controlPoints = (Array.isArray(edgeData.controlPoints)
    ? edgeData.controlPoints
    : []) as FlowPoint[];

  const allPoints = useMemo(
    () => [{ x: sourceX, y: sourceY }, ...controlPoints, { x: targetX, y: targetY }],
    [sourceX, sourceY, targetX, targetY, controlPoints],
  );

  const segmentMidPoints = useMemo(() => {
    const mids: FlowPoint[] = [];
    for (let index = 0; index < allPoints.length - 1; index += 1) {
      const current = allPoints[index];
      const next = allPoints[index + 1];
      mids.push({ x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 });
    }
    return mids;
  }, [allPoints]);

  const labelPoint = useMemo(() => {
    if (!segmentMidPoints.length) {
      return { x: (sourceX + targetX) / 2, y: (sourceY + targetY) / 2 };
    }
    return segmentMidPoints[Math.floor(segmentMidPoints.length / 2)];
  }, [segmentMidPoints, sourceX, sourceY, targetX, targetY]);

  const edgePath = useMemo(
    () => (curveType === 'bezier' ? buildBezierPath(allPoints) : buildPolylinePath(allPoints)),
    [curveType, allPoints],
  );

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const pointIndex = draggingPointIndexRef.current;
      if (pointIndex === null) return;
      const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setEdgeControlPoint(id, pointIndex, { x: flowPosition.x, y: flowPosition.y });
    };

    const onMouseUp = () => {
      draggingPointIndexRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [id, screenToFlowPosition, setEdgeControlPoint]);

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
              transform: `translate(-50%, -50%) translate(${labelPoint.x}px, ${labelPoint.y}px)`,
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
        <>
          <g className="nodrag nopan">
            {controlPoints.map((point, index) => (
              <circle
                key={`${id}-cp-${index}`}
                cx={point.x}
                cy={point.y}
                r={7}
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth={2}
                style={{ cursor: 'grab' }}
                onMouseDown={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  draggingPointIndexRef.current = index;
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  removeEdgeControlPoint(id, index);
                }}
              />
            ))}
          </g>

          <g className="nodrag nopan">
            {segmentMidPoints.map((point, index) => (
              <g
                key={`${id}-mid-${index}`}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  addEdgeControlPoint(id, index, point);
                }}
                style={{ cursor: 'copy' }}
              >
                <circle cx={point.x} cy={point.y} r={5} fill="#dbeafe" stroke="#2563eb" strokeWidth={1.5} />
                <line x1={point.x - 2.5} y1={point.y} x2={point.x + 2.5} y2={point.y} stroke="#1d4ed8" strokeWidth={1.5} />
                <line x1={point.x} y1={point.y - 2.5} x2={point.x} y2={point.y + 2.5} stroke="#1d4ed8" strokeWidth={1.5} />
              </g>
            ))}
          </g>
        </>
      ) : null}
    </>
  );
}

export default EditableEdge;
