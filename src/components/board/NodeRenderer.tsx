import React, { useState, useEffect, useRef } from 'react';
import type { Node } from '../../types/board';
import { getSymbolIconUrl } from '../../utils/symbolIcons';

interface NodeRendererProps {
  node: Node;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: (e: React.MouseEvent, node: Node) => void;
  onDragStart: (e: React.MouseEvent, node: Node) => void;
  onUpdate: (updatedNode: Node) => void;
  onResizeStart: (e: React.MouseEvent, node: Node, corner: 'tl' | 'tr' | 'bl' | 'br') => void;
}

export const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  isSelected,
  isConnecting,
  onSelect,
  onDragStart,
  onUpdate,
  onResizeStart,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditLabel(node.label);
  }, [node.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    const isText = node.type === 'Text';
    const isIcon = !isText && (!!node.icon || !!getSymbolIconUrl(node.type));
    if (isIcon) return; // Prevent double click editing on symbols!

    e.stopPropagation();
    if (!isConnecting) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editLabel.trim() && editLabel !== node.label) {
      onUpdate({ ...node, label: editLabel.trim() });
    } else {
      setEditLabel(node.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditLabel(node.label);
    }
  };

  const iconUrl = getSymbolIconUrl(node.type);
  const isTextNode = node.type === 'Text';
  const hasIcon = !isTextNode && (!!node.icon || !!iconUrl);
  const borderStroke = isSelected
    ? '#6366f1'
    : (isTextNode || hasIcon ? 'transparent' : '#ffffff');
  const borderWidth = isSelected ? 1.5 : 1;
  const fillColor = (isTextNode || hasIcon) ? 'transparent' : (node.fillColor || '#ffffff');
  const textColor = node.textColor === '#0f172a' ? '#e2e8f0' : (node.textColor || '#e2e8f0');

  // Scaling calculations
  const baseScale = Math.min(node.w, node.h) / 100;
  const emojiFontSize = Math.max(12, Math.round(34 * baseScale));
  
  const labelFontSize = isTextNode
    ? Math.max(10, Math.round(14 * (node.h / 40)))
    : Math.max(8, Math.round(11 * baseScale));

  // Renders the background shape based on type using actual node width and height
  const renderShapeBackground = () => {
    switch (node.shape) {
      case 'circle':
        return (
          <ellipse
            cx={node.w / 2}
            cy={node.h / 2}
            rx={Math.max(1, (node.w - 6) / 2)}
            ry={Math.max(1, (node.h - 6) / 2)}
            fill={fillColor}
            stroke={borderStroke}
            strokeWidth={borderWidth}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${node.w / 2},3 ${node.w - 3},${node.h / 2} ${node.w / 2},${node.h - 3} 3,${node.h / 2}`}
            fill={fillColor}
            stroke={borderStroke}
            strokeWidth={borderWidth}
          />
        );
      case 'cylinder': {
        const rx = (node.w - 6) / 2;
        const ry = Math.min(12, node.h * 0.15);
        const cyTop = ry + 3;
        const cyBottom = node.h - ry - 3;
        return (
          <g>
            {/* Cylinder Body */}
            <path
              d={`M 3 ${cyTop} A ${rx} ${ry} 0 0 0 ${node.w - 3} ${cyTop} L ${node.w - 3} ${cyBottom} A ${rx} ${ry} 0 0 1 3 ${cyBottom} Z`}
              fill={fillColor}
              stroke={borderStroke}
              strokeWidth={borderWidth}
            />
            {/* Cylinder Top Lid */}
            <ellipse
              cx={node.w / 2}
              cy={cyTop}
              rx={rx}
              ry={ry}
              fill={fillColor}
              stroke={borderStroke}
              strokeWidth={borderWidth}
            />
            {/* Lid border line inside */}
            <path
              d={`M 3 ${cyBottom} A ${rx} ${ry} 0 0 0 ${node.w - 3} ${cyBottom}`}
              fill="none"
              stroke={borderStroke}
              strokeWidth={borderWidth}
            />
          </g>
        );
      }
      case 'cloud':
        return (
          <path
            d="M 25 75 A 18 18 0 0 1 30 39 A 22 22 0 0 1 70 35 A 18 18 0 0 1 85 70 A 14 14 0 0 1 72 85 H 28 A 14 14 0 0 1 25 75 Z"
            transform={`scale(${node.w / 100}, ${node.h / 100})`}
            fill={fillColor}
            stroke={borderStroke}
            strokeWidth={borderWidth * (100 / Math.max(1, node.w))}
          />
        );
      case 'user':
        return (
          <g transform={`scale(${node.w / 100}, ${node.h / 100})`}>
            {/* User Head */}
            <circle
              cx="50"
              cy="30"
              r="18"
              fill={fillColor}
              stroke={borderStroke}
              strokeWidth={borderWidth * (100 / Math.max(1, node.w))}
            />
            {/* User Body */}
            <path
              d="M 15 90 C 15 65 30 58 50 58 C 70 58 85 65 85 90 Z"
              fill={fillColor}
              stroke={borderStroke}
              strokeWidth={borderWidth * (100 / Math.max(1, node.w))}
            />
          </g>
        );
      case 'rect':
      default:
        return (
          <rect
            x="3"
            y="3"
            width={node.w - 6}
            height={node.h - 6}
            rx="10"
            ry="10"
            fill={fillColor}
            stroke={borderStroke}
            strokeWidth={borderWidth}
          />
        );
    }
  };

  const hasLabel = isTextNode || (!hasIcon && !!node.label);
  const emojiY = hasLabel ? (node.shape === 'user' ? node.h * 0.36 : node.h * 0.45) : (node.h / 2);
  const labelY = isTextNode ? (node.h / 2) : (node.h * 0.78);
  const inputY = hasIcon ? (node.h * 0.62) : (node.h / 2 - (labelFontSize + 6) / 2);
  const inputHeight = labelFontSize + 14;

  return (
    <svg
      x={node.x}
      y={node.y}
      width={node.w}
      height={node.h}
      overflow="visible"
      className="cursor-move select-none"
      onMouseDown={(e) => {
        // Select node and trigger drag behavior
        onSelect(e, node);
        onDragStart(e, node);
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Node shape background */}
      {renderShapeBackground()}

      {/* Node emoji icon or official logo */}
      {iconUrl ? (
        <image
          href={iconUrl}
          x={node.w * 0.15}
          y={node.h * 0.15}
          width={node.w * 0.7}
          height={node.h * 0.7}
          pointerEvents="none"
        />
      ) : (
        <text
          x={node.w / 2}
          y={emojiY}
          fontSize={emojiFontSize}
          textAnchor="middle"
          dominantBaseline="middle"
          pointerEvents="none"
        >
          {node.icon}
        </text>
      )}

      {/* Node label */}
      {hasLabel && (
        isEditing ? (
          <foreignObject x="4" y={inputY} width={node.w - 8} height={inputHeight}>
            <input
              ref={inputRef}
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ fontSize: `${labelFontSize}px`, height: `${labelFontSize + 10}px` }}
              className="w-full font-bold text-center bg-[#0f1117] border border-[#6366f1] rounded px-0.5 text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            />
          </foreignObject>
        ) : (
          <text
            x={node.w / 2}
            y={labelY}
            fontSize={labelFontSize}
            fontWeight="bold"
            fill={textColor}
            textAnchor="middle"
            dominantBaseline={isTextNode ? "middle" : "auto"}
            pointerEvents="none"
            className="truncate"
          >
            {isTextNode ? node.label : (node.label.length > 14 ? `${node.label.substring(0, 11)}...` : node.label)}
          </text>
        )
      )}

      {/* Resize Handles */}
      {isSelected && (
        <g>
          {/* Top-Left */}
          <circle
            cx={0}
            cy={0}
            r="4.5"
            fill="#ffffff"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="cursor-nwse-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResizeStart(e, node, 'tl');
            }}
          />
          {/* Top-Right */}
          <circle
            cx={node.w}
            cy={0}
            r="4.5"
            fill="#ffffff"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="cursor-nesw-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResizeStart(e, node, 'tr');
            }}
          />
          {/* Bottom-Left */}
          <circle
            cx={0}
            cy={node.h}
            r="4.5"
            fill="#ffffff"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="cursor-nesw-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResizeStart(e, node, 'bl');
            }}
          />
          {/* Bottom-Right */}
          <circle
            cx={node.w}
            cy={node.h}
            r="4.5"
            fill="#ffffff"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="cursor-nwse-resize"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResizeStart(e, node, 'br');
            }}
          />
        </g>
      )}
    </svg>
  );
};
