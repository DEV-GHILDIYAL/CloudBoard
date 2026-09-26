import React from 'react';
import type { Node, Connection } from '../../types/board';

interface ConnectionRendererProps {
  connection: Connection;
  fromNode: Node;
  toNode: Node;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent, conn: Connection) => void;
}

// Computes the point on the bounding box of a node where the line intersects
const getNodeBorderPoint = (
  node: Node,
  targetX: number,
  targetY: number
): { x: number; y: number } => {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const halfW = node.w / 2;
  const halfH = node.h / 2;

  // Check if intersection is horizontal (left/right) or vertical (top/bottom)
  if (absDx * halfH > absDy * halfW) {
    const factor = halfW / absDx;
    return {
      x: cx + dx * factor,
      y: cy + dy * factor,
    };
  } else {
    const factor = halfH / absDy;
    return {
      x: cx + dx * factor,
      y: cy + dy * factor,
    };
  }
};

export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({
  connection,
  fromNode,
  toNode,
  isSelected,
  onSelect,
}) => {
  if (!fromNode || !toNode) return null;

  // Approximate centers
  const fromCx = fromNode.x + fromNode.w / 2;
  const fromCy = fromNode.y + fromNode.h / 2;
  const toCx = toNode.x + toNode.w / 2;
  const toCy = toNode.y + toNode.h / 2;

  // Get border intersections
  const start = getNodeBorderPoint(fromNode, toCx, toCy);
  const end = getNodeBorderPoint(toNode, fromCx, fromCy);

  // Math for curve bending
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  // Fallback to straight line if nodes are overlapping
  if (len < 5) return null;

  // Compute control point for quadratic Bezier (arc offset)
  const perpX = -dy / len;
  const perpY = dx / len;
  // Offset curve perpendicular to the line by 12% of the length
  const offset = len * 0.12;
  const cpX = (start.x + end.x) / 2 + perpX * offset;
  const cpY = (start.y + end.y) / 2 + perpY * offset;

  // Midpoint at t = 0.5 for quadratic Bezier: B(0.5) = 0.25*P0 + 0.5*P1 + 0.25*P2
  const midX = 0.25 * start.x + 0.5 * cpX + 0.25 * end.x;
  const midY = 0.25 * start.y + 0.5 * cpY + 0.25 * end.y;

  const pathData = `M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}`;

  const lineColor = isSelected ? '#4f46e5' : '#64748b'; // Indigo for selected, slate for default
  const lineWidth = isSelected ? 3 : 2;
  const markerId = isSelected ? 'url(#arrow-selected)' : 'url(#arrow)';

  return (
    <g className="group cursor-pointer select-none">
      {/* Invisible thicker line for easier clicking/hovering */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="16"
        onClick={(e) => onSelect(e, connection)}
        className="pointer-events-stroke"
      />

      {/* Selected highlighted background stroke */}
      {isSelected && (
        <path
          d={pathData}
          fill="none"
          stroke="#e0e7ff"
          strokeWidth={lineWidth + 4}
          className="transition-all duration-150"
        />
      )}

      {/* Main Connection Path */}
      <path
        d={pathData}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
        markerEnd={markerId}
        onClick={(e) => onSelect(e, connection)}
        className="transition-colors duration-150"
      />

      {/* Connection Label */}
      {connection.label && (
        <g transform={`translate(${midX}, ${midY})`}>
          {/* Label background card */}
          <rect
            x={-((connection.label.length * 6) / 2 + 6)}
            y="-10"
            width={connection.label.length * 6 + 12}
            height="18"
            rx="4"
            fill="#ffffff"
            stroke={isSelected ? '#4f46e5' : '#e2e8f0'}
            strokeWidth="1"
            onClick={(e) => onSelect(e, connection)}
          />
          {/* Label Text */}
          <text
            fontSize="9"
            fontWeight="semibold"
            fill={isSelected ? '#4f46e5' : '#475569'}
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
          >
            {connection.label}
          </text>
        </g>
      )}
    </g>
  );
};
