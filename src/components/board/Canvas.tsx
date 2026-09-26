import React, { useRef, useState } from 'react';
import type { Node, Connection, BoardState, Stroke } from '../../types/board';
import { NodeRenderer } from './NodeRenderer';
import { ConnectionRenderer } from './ConnectionRenderer';

type ToolMode =
  | 'select'
  | 'connect'
  | 'text'
  | 'draw-rect'
  | 'draw-circle'
  | 'draw-diamond'
  | 'draw-cylinder'
  | 'draw-cloud'
  | 'draw-user'
  | 'draw-pencil';

interface CanvasProps {
  state: BoardState;
  onChangeState: (state: BoardState | ((prev: BoardState) => BoardState), saveToHistory?: boolean) => void;
  selectedNode: Node | null;
  onSelectNode: (node: Node | null) => void;
  selectedConnection: Connection | null;
  onSelectConnection: (conn: Connection | null) => void;
  mode: ToolMode;
  onChangeMode: (mode: ToolMode) => void;
  panX: number;
  panY: number;
  onPanChange: (x: number, y: number) => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  defaultTextColor: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  state,
  onChangeState,
  selectedNode,
  onSelectNode,
  selectedConnection,
  onSelectConnection,
  mode,
  onChangeMode,
  panX,
  panY,
  onPanChange,
  zoom,
  onZoomChange,
  defaultTextColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction tracking state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<Node | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Connection building state
  const [connStartNode, setConnStartNode] = useState<Node | null>(null);
  const [tempConnPoint, setTempConnPoint] = useState<{ x: number; y: number } | null>(null);

  // Resize tracking state
  const [resizingNode, setResizingNode] = useState<Node | null>(null);
  const [resizeCorner, setResizeCorner] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const [resizeStartCoords, setResizeStartCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeStartDims, setResizeStartDims] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  // Shape drawing state
  const [drawStartPoint, setDrawStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawEndPoint, setDrawEndPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDrawingShape, setIsDrawingShape] = useState(false);

  // Freehand pencil - use REFS for performance (no re-render per point)
  const isDrawingPencilRef = useRef(false);
  const pencilPointsRef = useRef<{ x: number; y: number }[]>([]);
  const pencilColorRef = useRef('#e2e8f0');
  const pencilWidthRef = useRef(2);
  // State only for triggering re-render of live preview path
  const [livePathD, setLivePathD] = useState<string | null>(null);

  // Wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = 1.08;
    const nextZoom = e.deltaY < 0 
      ? Math.min(3.0, zoom * zoomFactor) 
      : Math.max(0.2, zoom / zoomFactor);

    const rect = containerRef.current.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;

    // Center equation: nextPan = rx - (rx - pan) * (nextZoom / zoom)
    const nextPanX = rx - (rx - panX) * (nextZoom / zoom);
    const nextPanY = ry - (ry - panY) * (nextZoom / zoom);

    onZoomChange(nextZoom);
    onPanChange(nextPanX, nextPanY);
  };

  // Convert client cursor coords to raw board canvas coords
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const rx = clientX - rect.left;
    const ry = clientY - rect.top;
    return {
      x: (rx - panX) / zoom,
      y: (ry - panY) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Pencil mode works on ANY target - not just background
    if (mode === 'draw-pencil') {
      e.preventDefault();
      const coords = getCanvasCoords(e.clientX, e.clientY);
      isDrawingPencilRef.current = true;
      pencilPointsRef.current = [coords];
      setLivePathD(`M ${coords.x} ${coords.y}`);
      return;
    }

    // All other modes: only trigger on SVG canvas background
    if (e.target === e.currentTarget || (e.target as SVGElement).id === 'grid-background') {
      onSelectNode(null);
      onSelectConnection(null);

      if (mode === 'select') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      } else if (mode === 'text') {
        // Spawn text node at click coordinate
        const coords = getCanvasCoords(e.clientX, e.clientY);
        const textNode: Node = {
          id: crypto.randomUUID(),
          type: 'Text',
          icon: '', // Empty icon
          x: coords.x - 60,
          y: coords.y - 20,
          w: 120,
          h: 40,
          label: 'Double click to edit',
          fillColor: 'transparent', // Transparent background
          textColor: defaultTextColor,
          shape: 'rect',
        };

        onChangeState((prev) => ({
          ...prev,
          nodes: [...prev.nodes, textNode],
        }));

        onSelectNode(textNode);
        onChangeMode('select'); // Automatically shift back to select tool
      } else if (mode.startsWith('draw-')) {
        // Spawn custom shape drag session
        const coords = getCanvasCoords(e.clientX, e.clientY);
        setDrawStartPoint(coords);
        setDrawEndPoint(coords);
        setIsDrawingShape(true);
      }

      setConnStartNode(null);
      setTempConnPoint(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      onPanChange(e.clientX - panStart.x, e.clientY - panStart.y);
    } else if (draggingNode) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      const targetX = coords.x - dragOffset.x;
      const targetY = coords.y - dragOffset.y;

      // Align drag values to small grids (e.g. 10px snap grid for alignment)
      const snapGrid = 10;
      const snappedX = Math.round(targetX / snapGrid) * snapGrid;
      const snappedY = Math.round(targetY / snapGrid) * snapGrid;

      // Non-history-saving state update for smooth rendering during drag
      onChangeState((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === draggingNode.id ? { ...n, x: snappedX, y: snappedY } : n
        ),
      }), false);
    } else if (connStartNode) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setTempConnPoint(coords);
    } else if (isDrawingPencilRef.current) {
      // Pencil: accumulate points in ref, update path string for live preview
      const coords = getCanvasCoords(e.clientX, e.clientY);
      pencilPointsRef.current.push(coords);
      const pts = pencilPointsRef.current;
      if (pts.length >= 2) {
        // Build smooth SVG path using cardinal spline approximation
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const curr = pts[i];
          const mx = (prev.x + curr.x) / 2;
          const my = (prev.y + curr.y) / 2;
          d += ` Q ${prev.x} ${prev.y} ${mx} ${my}`;
        }
        d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
        // Throttle re-renders: only update every 3 points for performance
        if (pts.length % 3 === 0 || pts.length < 5) {
          setLivePathD(d);
        }
      }
    } else if (isDrawingShape) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDrawEndPoint(coords);
    } else if (resizingNode && resizeCorner) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      const dx = coords.x - resizeStartCoords.x;
      const dy = coords.y - resizeStartCoords.y;

      let newX = resizeStartDims.x;
      let newY = resizeStartDims.y;
      let newW = resizeStartDims.w;
      let newH = resizeStartDims.h;

      const minSize = 30;

      if (resizeCorner === 'br') {
        newW = Math.max(minSize, resizeStartDims.w + dx);
        newH = Math.max(minSize, resizeStartDims.h + dy);
      } else if (resizeCorner === 'tl') {
        newW = Math.max(minSize, resizeStartDims.w - dx);
        newH = Math.max(minSize, resizeStartDims.h - dy);
        newX = newW === minSize ? resizeStartDims.x + resizeStartDims.w - minSize : resizeStartDims.x + dx;
        newY = newH === minSize ? resizeStartDims.y + resizeStartDims.h - minSize : resizeStartDims.y + dy;
      } else if (resizeCorner === 'tr') {
        newW = Math.max(minSize, resizeStartDims.w + dx);
        newH = Math.max(minSize, resizeStartDims.h - dy);
        newY = newH === minSize ? resizeStartDims.y + resizeStartDims.h - minSize : resizeStartDims.y + dy;
      } else if (resizeCorner === 'bl') {
        newW = Math.max(minSize, resizeStartDims.w - dx);
        newH = Math.max(minSize, resizeStartDims.h + dy);
        newX = newW === minSize ? resizeStartDims.x + resizeStartDims.w - minSize : resizeStartDims.x + dx;
      }

      onChangeState((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === resizingNode.id ? { ...n, x: newX, y: newY, w: newW, h: newH } : n
        ),
      }), false);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (draggingNode) {
      // Commit final position to history stack
      const finalNode = state.nodes.find((n) => n.id === draggingNode.id);
      if (finalNode) {
        onChangeState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => (n.id === finalNode.id ? finalNode : n)),
        }));
      }
      setDraggingNode(null);
    }

    if (resizingNode) {
      // Commit final resized state to history stack
      const finalNode = state.nodes.find((n) => n.id === resizingNode.id);
      if (finalNode) {
        onChangeState((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => (n.id === finalNode.id ? finalNode : n)),
        }));
      }
      setResizingNode(null);
      setResizeCorner(null);
    }

    // Commit freehand stroke
    if (isDrawingPencilRef.current) {
      const pts = pencilPointsRef.current;
      if (pts.length > 1) {
        // Build final smooth path
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
          const prev = pts[i - 1];
          const curr = pts[i];
          const mx = (prev.x + curr.x) / 2;
          const my = (prev.y + curr.y) / 2;
          d += ` Q ${prev.x} ${prev.y} ${mx} ${my}`;
        }
        d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
        const newStroke: Stroke = {
          id: crypto.randomUUID(),
          points: pts,
          color: pencilColorRef.current,
          width: pencilWidthRef.current,
          pathD: d,
        };
        onChangeState((prev) => ({
          ...prev,
          strokes: [...(prev.strokes || []), newStroke],
        }));
      }
      isDrawingPencilRef.current = false;
      pencilPointsRef.current = [];
      setLivePathD(null);
    }

    if (isDrawingShape && drawStartPoint && drawEndPoint) {
      const x = Math.min(drawStartPoint.x, drawEndPoint.x);
      const y = Math.min(drawStartPoint.y, drawEndPoint.y);
      const w = Math.max(20, Math.abs(drawEndPoint.x - drawStartPoint.x));
      const h = Math.max(20, Math.abs(drawEndPoint.y - drawStartPoint.y));

      // Map tool modes to node attributes
      let shapeType: 'rect' | 'circle' | 'diamond' | 'cylinder' | 'cloud' | 'user' = 'rect';
      let label = 'Rectangle';

      if (mode === 'draw-circle') {
        shapeType = 'circle';
        label = 'Circle';
      } else if (mode === 'draw-diamond') {
        shapeType = 'diamond';
        label = 'Diamond';
      } else if (mode === 'draw-cylinder') {
        shapeType = 'cylinder';
        label = 'Cylinder';
      } else if (mode === 'draw-cloud') {
        shapeType = 'cloud';
        label = 'Cloud';
      } else if (mode === 'draw-user') {
        shapeType = 'user';
        label = 'Actor';
      }

      const newShapeNode: Node = {
        id: crypto.randomUUID(),
        type: label,
        icon: '', // Empty icon
        x,
        y,
        w,
        h,
        label: '', // Empty label
        fillColor: 'transparent', // Transparent background outline
        textColor: defaultTextColor,
        shape: shapeType,
      };

      onChangeState((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newShapeNode],
      }));

      onSelectNode(newShapeNode);
      setDrawStartPoint(null);
      setDrawEndPoint(null);
      setIsDrawingShape(false);
      onChangeMode('select'); // automatically reset mode
    }
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    node: Node,
    corner: 'tl' | 'tr' | 'bl' | 'br'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setResizingNode(node);
    setResizeCorner(corner);
    setResizeStartCoords(coords);
    setResizeStartDims({ x: node.x, y: node.y, w: node.w, h: node.h });
  };

  // Node event responders
  const handleNodeSelect = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    onSelectConnection(null);
    onSelectNode(node);

    if (mode === 'connect') {
      if (!connStartNode) {
        setConnStartNode(node);
        const coords = getCanvasCoords(e.clientX, e.clientY);
        setTempConnPoint(coords);
      } else {
        // Complete connection creation
        if (connStartNode.id !== node.id) {
          // Check if connection already exists
          const connectionExists = state.connections.some(
            (c) =>
              (c.fromNodeId === connStartNode.id && c.toNodeId === node.id) ||
              (c.fromNodeId === node.id && c.toNodeId === connStartNode.id)
          );

          if (!connectionExists) {
            const newConn: Connection = {
              id: crypto.randomUUID(),
              fromNodeId: connStartNode.id,
              toNodeId: node.id,
              label: '',
            };

            onChangeState((prev) => ({
              ...prev,
              connections: [...prev.connections, newConn],
            }));
            onSelectConnection(newConn);
          }
        }
        setConnStartNode(null);
        setTempConnPoint(null);
        onChangeMode('select'); // Reset mode
      }
    }
  };

  const handleNodeDragStart = (e: React.MouseEvent, node: Node) => {
    if (mode !== 'select') return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setDraggingNode(node);
    setDragOffset({
      x: coords.x - node.x,
      y: coords.y - node.y,
    });
  };

  const handleNodeUpdate = (updatedNode: Node) => {
    onChangeState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)),
    }));
    // Sync current select state with modified properties
    if (selectedNode?.id === updatedNode.id) {
      onSelectNode(updatedNode);
    }
  };

  // HTML5 drag/drop drop-in from sidebar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/cloudboard-node');
      if (!dataStr) return;

      const rawItem = JSON.parse(dataStr);
      const coords = getCanvasCoords(e.clientX, e.clientY);

      const newNode: Node = {
        id: crypto.randomUUID(),
        type: rawItem.type || 'Custom Node',
        icon: rawItem.icon || '📦',
        x: coords.x - 50,
        y: coords.y - 50,
        w: 100,
        h: 100,
        label: rawItem.label || 'Node Name',
        fillColor: 'transparent', // No background color for any dropped symbols
        textColor: rawItem.textColor || defaultTextColor,
        shape: rawItem.shape || 'rect',
      };

      onChangeState((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));

      onSelectNode(newNode);
      onSelectConnection(null);
    } catch (err) {
      console.error('Failed to drop library symbol:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex-1 bg-[#0f1117] relative overflow-hidden h-full w-full ${mode === 'draw-pencil' ? 'cursor-crosshair' : ''}`}
    >
      <svg
        width="100%"
        height="100%"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="block select-none"
      >
        <defs>
          {/* Infinite dot grid pattern definition */}
          <pattern
            id="dot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.2" fill="#1e2236" />
          </pattern>

          {/* Standard Arrowhead Marker */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748b" />
          </marker>

          {/* Selected Arrowhead Marker */}
          <marker
            id="arrow-selected"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#4f46e5" />
          </marker>
        </defs>

        {/* Transforming Container Group */}
        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          {/* Massive background rectangle for grid repeating */}
          <rect
            id="grid-background"
            x="-50000"
            y="-50000"
            width="100000"
            height="100000"
            fill="url(#dot-grid)"
            className="pointer-events-all"
          />

          {/* Draw committed freehand strokes as smooth SVG paths */}
          {(state.strokes || []).map((stroke) => (
            <path
              key={stroke.id}
              d={stroke.pathD || stroke.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width / zoom}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none"
            />
          ))}

          {/* Live freehand stroke preview */}
          {livePathD && (
            <path
              d={livePathD}
              fill="none"
              stroke={pencilColorRef.current}
              strokeWidth={pencilWidthRef.current / zoom}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none"
            />
          )}

          {/* Draw Connection paths first (rendered behind nodes) */}
          {state.connections.map((conn) => {
            const fromNode = state.nodes.find((n) => n.id === conn.fromNodeId);
            const toNode = state.nodes.find((n) => n.id === conn.toNodeId);
            if (!fromNode || !toNode) return null;

            return (
              <ConnectionRenderer
                key={conn.id}
                connection={conn}
                fromNode={fromNode}
                toNode={toNode}
                isSelected={selectedConnection?.id === conn.id}
                onSelect={(e, c) => {
                  e.stopPropagation();
                  onSelectNode(null);
                  onSelectConnection(c);
                  setConnStartNode(null);
                }}
              />
            );
          })}

          {/* Draw Temporary connector line in Connect Mode */}
          {connStartNode && tempConnPoint && (
            <path
              d={`M ${connStartNode.x + connStartNode.w / 2} ${
                connStartNode.y + connStartNode.h / 2
              } L ${tempConnPoint.x} ${tempConnPoint.y}`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="pointer-events-none"
            />
          )}

          {/* Live drawing preview outline */}
          {isDrawingShape && drawStartPoint && drawEndPoint && (() => {
            const x = Math.min(drawStartPoint.x, drawEndPoint.x);
            const y = Math.min(drawStartPoint.y, drawEndPoint.y);
            const w = Math.abs(drawEndPoint.x - drawStartPoint.x);
            const h = Math.abs(drawEndPoint.y - drawStartPoint.y);
            
            if (w < 4 && h < 4) return null;
            
            const strokeColor = '#6366f1';
            const strokeW = 1.5 / zoom;
            
            switch (mode) {
              case 'draw-circle':
                return (
                  <ellipse
                    cx={x + w / 2}
                    cy={y + h / 2}
                    rx={w / 2}
                    ry={h / 2}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeDasharray="4,4"
                  />
                );
              case 'draw-diamond':
                return (
                  <polygon
                    points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeDasharray="4,4"
                  />
                );
              case 'draw-cylinder':
                return (
                  <g>
                    <path
                      d={`M ${x} ${y + h * 0.15} A ${w / 2} ${h * 0.12} 0 0 0 ${x + w} ${y + h * 0.15} L ${x + w} ${y + h * 0.85} A ${w / 2} ${h * 0.12} 0 0 1 ${x} ${y + h * 0.85} Z`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      strokeDasharray="4,4"
                    />
                    <ellipse
                      cx={x + w / 2}
                      cy={y + h * 0.15}
                      rx={w / 2}
                      ry={h * 0.12}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      strokeDasharray="4,4"
                    />
                  </g>
                );
              case 'draw-cloud':
                return (
                  <path
                    d="M 25 75 A 18 18 0 0 1 30 39 A 22 22 0 0 1 70 35 A 18 18 0 0 1 85 70 A 14 14 0 0 1 72 85 H 28 A 14 14 0 0 1 25 75 Z"
                    transform={`translate(${x}, ${y}) scale(${w / 100}, ${h / 100})`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeW * (100 / Math.max(1, w))}
                    strokeDasharray="4,4"
                  />
                );
              case 'draw-user':
                return (
                  <g transform={`translate(${x}, ${y}) scale(${w / 100}, ${h / 100})`}>
                    <circle
                      cx="50"
                      cy="30"
                      r="18"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeW * (100 / Math.max(1, w))}
                      strokeDasharray="4,4"
                    />
                    <path
                      d="M 15 90 C 15 65 30 58 50 58 C 70 58 85 65 85 90 Z"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeW * (100 / Math.max(1, w))}
                      strokeDasharray="4,4"
                    />
                  </g>
                );
              case 'draw-rect':
              default:
                return (
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={10 / zoom}
                    ry={10 / zoom}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    strokeDasharray="4,4"
                  />
                );
            }
          })()}

          {/* Draw Nodes */}
          {state.nodes.map((node) => (
            <NodeRenderer
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              isConnecting={mode === 'connect'}
              onSelect={handleNodeSelect}
              onDragStart={handleNodeDragStart}
              onUpdate={handleNodeUpdate}
              onResizeStart={handleResizeStart}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};
