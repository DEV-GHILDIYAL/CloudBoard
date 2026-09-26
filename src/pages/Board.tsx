import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { BoardState, Node as BoardNode, Connection } from '../types/board';
import { useBoardHistory } from '../hooks/useBoardHistory';
import { Sidebar } from '../components/board/Sidebar';
import { Canvas } from '../components/board/Canvas';
import { Toolbar } from '../components/board/Toolbar';
import { LeftToolbar } from '../components/board/LeftToolbar';
import { Notes } from '../components/board/Notes';
import { LayoutPanelLeft, FileText, Columns2 } from 'lucide-react';

export const Board: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Core board states
  const [projectName, setProjectName] = useState('Untitled Project');
  const {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  } = useBoardHistory({ nodes: [], connections: [] });

  // Workspace configuration states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [mode, setMode] = useState<
    | 'select'
    | 'connect'
    | 'text'
    | 'draw-rect'
    | 'draw-circle'
    | 'draw-diamond'
    | 'draw-cylinder'
    | 'draw-cloud'
    | 'draw-user'
    | 'draw-pencil'
  >('select');
  const [panX, setPanX] = useState(100);
  const [panY, setPanY] = useState(100);
  const [zoom, setZoom] = useState(1.0);

  // Floating Sidebar state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // View mode: canvas only, notes only, or split both
  const [viewMode, setViewMode] = useState<'canvas' | 'notes' | 'both'>('canvas');

  // Default color selectors
  const [textColor, setTextColor] = useState('#e2e8f0');

  // Loading & Saving Statuses
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedStateStr, setLastSavedStateStr] = useState('');

  // Refs for auto-saving comparison
  const stateRef = useRef<BoardState>(state);
  const projectNameRef = useRef<string>(projectName);

  // Sync refs to avoid stale values in closures
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    projectNameRef.current = projectName;
  }, [projectName]);

  // Load project from database
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) {
          alert('Error loading project: ' + error.message);
          navigate('/dashboard');
        } else if (data) {
          setProjectName(data.name);
          const boardData = data.data as BoardState || { nodes: [], connections: [] };
          resetHistory(boardData);
          setLastSavedStateStr(JSON.stringify(boardData));
        }
      } catch (err) {
        console.error('Unexpected error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, navigate, resetHistory]);

  // Click outside floating panel to close it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const panelEl = document.getElementById('symbol-library-panel');
      const btnEl = document.getElementById('layout-grid-btn');
      if (
        panelEl &&
        !panelEl.contains(e.target as HTMLDivElement) &&
        btnEl &&
        !btnEl.contains(e.target as HTMLButtonElement)
      ) {
        setIsLibraryOpen(false);
      }
    };

    if (isLibraryOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isLibraryOpen]);

  // Manual save trigger
  const handleSave = async (showNotification = true) => {
    if (!projectId) return;
    setIsSaving(true);

    const currentState = stateRef.current;
    const currentName = projectNameRef.current;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: currentName,
          data: currentState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) {
        console.error('Failed to save project:', error);
        if (showNotification) alert('Failed to save: ' + error.message);
      } else {
        setLastSavedStateStr(JSON.stringify(currentState));
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save cycle every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const currentStateStr = JSON.stringify(stateRef.current);
      if (currentStateStr !== lastSavedStateStr) {
        handleSave(false);
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [lastSavedStateStr]);

  // Rename action handler
  const handleRenameProject = async (newName: string) => {
    setProjectName(newName);
    // Auto-save the title right away
    if (projectId) {
      await supabase
        .from('projects')
        .update({ name: newName })
        .eq('id', projectId);
    }
  };

  // Selected item references
  const selectedNode = state.nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedConnection = state.connections.find((c) => c.id === selectedConnectionId) || null;

  // Zoom commands
  const handleZoomIn = () => setZoom((z) => Math.min(3.0, z * 1.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.2, z / 1.15));

  const handleFitToScreen = () => {
    if (state.nodes.length === 0) {
      setZoom(1.0);
      setPanX(100);
      setPanY(100);
      return;
    }

    const minX = Math.min(...state.nodes.map((n) => n.x));
    const minY = Math.min(...state.nodes.map((n) => n.y));
    const maxX = Math.max(...state.nodes.map((n) => n.x + n.w));
    const maxY = Math.max(...state.nodes.map((n) => n.y + n.h));

    const drawingW = maxX - minX;
    const drawingH = maxY - minY;

    const boardContainer = document.getElementById('board-container');
    if (!boardContainer) return;

    const clientW = boardContainer.clientWidth;
    const clientH = boardContainer.clientHeight;

    const buffer = 100;
    const newZoom = Math.max(
      0.2,
      Math.min(3.0, Math.min(clientW / (drawingW + buffer), clientH / (drawingH + buffer)))
    );

    const drawingCenterCX = (minX + maxX) / 2;
    const drawingCenterCY = (minY + maxY) / 2;

    const newPanX = clientW / 2 - drawingCenterCX * newZoom;
    const newPanY = clientH / 2 - drawingCenterCY * newZoom;

    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  };


  const handleDeleteNode = (nodeId: string) => {
    setState((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      connections: prev.connections.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId),
    }));
    setSelectedNodeId(null);
  };


  const handleDeleteConnection = (connId: string) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connId),
    }));
    setSelectedConnectionId(null);
  };

  // Clear diagram map confirmation
  const handleClearBoard = () => {
    if (confirm('Are you sure you want to clear the entire diagram? This cannot be undone.')) {
      setState({ nodes: [], connections: [] });
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
    }
  };

  // Export SVG document generator
  const handleExportSVG = () => {
    if (state.nodes.length === 0) {
      alert('Your board is empty. Drag some nodes in before exporting.');
      return;
    }

    const padding = 60;
    const minX = Math.min(...state.nodes.map((n) => n.x));
    const minY = Math.min(...state.nodes.map((n) => n.y));
    const maxX = Math.max(...state.nodes.map((n) => n.x + n.w));
    const maxY = Math.max(...state.nodes.map((n) => n.y + n.h));

    const exportW = maxX - minX + padding * 2;
    const exportH = maxY - minY + padding * 2;
    const viewBoxX = minX - padding;
    const viewBoxY = minY - padding;

    const buildShapeStr = (node: BoardNode) => {
      const f = node.fillColor || '#ffffff';
      const tc = node.textColor || '#1e293b';
      const labelText = node.label.length > 14 ? `${node.label.substring(0, 11)}...` : node.label;
      const emojiY = node.shape === 'user' ? 36 : 45;

      const shapesMap: Record<string, string> = {
        circle: `<circle cx="50" cy="50" r="47" fill="${f}" stroke="#2a2d3e" stroke-width="1" />`,
        diamond: `<polygon points="50,3 97,50 50,97 3,50" fill="${f}" stroke="#2a2d3e" stroke-width="1" />`,
        cylinder: `<path d="M 3 15 A 47 12 0 0 0 97 15 L 97 85 A 47 12 0 0 1 3 85 Z" fill="${f}" stroke="#2a2d3e" stroke-width="1" />
                   <ellipse cx="50" cy="15" rx="47" ry="12" fill="${f}" stroke="#2a2d3e" stroke-width="1" />
                   <path d="M 3 85 A 47 12 0 0 0 97 85" fill="none" stroke="#2a2d3e" stroke-width="1" />`,
        cloud: `<path d="M 25 75 A 18 18 0 0 1 30 39 A 22 22 0 0 1 70 35 A 18 18 0 0 1 85 70 A 14 14 0 0 1 72 85 H 28 A 14 14 0 0 1 25 75 Z" fill="${f}" stroke="#2a2d3e" stroke-width="1" />`,
        user: `<circle cx="50" cy="30" r="18" fill="${f}" stroke="#2a2d3e" stroke-width="1" />
               <path d="M 15 90 C 15 65 30 58 50 58 C 70 58 85 65 85 90 Z" fill="${f}" stroke="#2a2d3e" stroke-width="1" />`,
        rect: `<rect x="3" y="3" width="94" height="94" rx="10" ry="10" fill="${f}" stroke="#2a2d3e" stroke-width="1" />`,
      };

      const shapeSVG = shapesMap[node.shape] || shapesMap.rect;

      return `
      <svg x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" viewBox="0 0 100 100" overflow="visible">
        ${shapeSVG}
        <text x="50" y="${emojiY}" font-family="sans-serif" font-size="34" text-anchor="middle" dominant-baseline="middle">${node.icon}</text>
        <text x="50" y="78" font-family="sans-serif" font-size="11" font-weight="bold" fill="${tc}" text-anchor="middle">${labelText}</text>
      </svg>`;
    };

    const buildConnStr = (conn: Connection) => {
      const fromNode = state.nodes.find((n) => n.id === conn.fromNodeId);
      const toNode = state.nodes.find((n) => n.id === conn.toNodeId);
      if (!fromNode || !toNode) return '';

      const fCx = fromNode.x + fromNode.w / 2;
      const fCy = fromNode.y + fromNode.h / 2;
      const tCx = toNode.x + toNode.w / 2;
      const tCy = toNode.y + toNode.h / 2;

      const getBorder = (node: BoardNode, targetX: number, targetY: number) => {
        const cx = node.x + node.w / 2;
        const cy = node.y + node.h / 2;
        const dx = targetX - cx;
        const dy = targetY - cy;
        if (dx === 0 && dy === 0) return { x: cx, y: cy };
        const factor = Math.abs(dx) * (node.h / 2) > Math.abs(dy) * (node.w / 2) 
          ? (node.w / 2) / Math.abs(dx) 
          : (node.h / 2) / Math.abs(dy);
        return { x: cx + dx * factor, y: cy + dy * factor };
      };

      const start = getBorder(fromNode, tCx, tCy);
      const end = getBorder(toNode, fCx, fCy);

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 5) return '';

      const pX = -dy / len;
      const pY = dx / len;
      const curveOffset = len * 0.12;
      const cpX = (start.x + end.x) / 2 + pX * curveOffset;
      const cpY = (start.y + end.y) / 2 + pY * curveOffset;

      const pathD = `M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}`;

      let labelTextSVG = '';
      if (conn.label) {
        const mX = 0.25 * start.x + 0.5 * cpX + 0.25 * end.x;
        const mY = 0.25 * start.y + 0.5 * cpY + 0.25 * end.y;
        const textLen = conn.label.length * 6;
        labelTextSVG = `
        <g transform="translate(${mX}, ${mY})">
          <rect x="-${textLen / 2 + 5}" y="-9" width="${textLen + 10}" height="18" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
          <text font-family="sans-serif" font-size="9" font-weight="bold" fill="#475569" text-anchor="middle" dominant-baseline="middle">${conn.label}</text>
        </g>`;
      }

      return `
      <g>
        <path d="${pathD}" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)" />
        ${labelTextSVG}
      </g>`;
    };

    const svgContentString = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxX} ${viewBoxY} ${exportW} ${exportH}" width="${exportW}" height="${exportH}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748b" />
    </marker>
  </defs>
  <!-- Connections -->
  ${state.connections.map(buildConnStr).join('\n')}
  <!-- Nodes -->
  ${state.nodes.map(buildShapeStr).join('\n')}
</svg>`;

    const blob = new Blob([svgContentString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-architecture.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366f1]"></div>
        <p className="text-slate-450 mt-4 font-medium text-sm">Loading Board Engine...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f1117] overflow-hidden select-none font-sans text-[#e2e8f0]">
      {/* Top Header Toolbar */}
      <Toolbar
        projectName={projectName}
        onRenameProject={handleRenameProject}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClearBoard={handleClearBoard}
        onExportSVG={handleExportSVG}
        onSave={() => handleSave(true)}
        isSaving={isSaving}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToScreen={handleFitToScreen}
        zoomPercent={Math.round(zoom * 100)}
      />

      {/* Main Workspace splits */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Left vertical narrow Icon Toolbar — only in canvas/both modes */}
        {viewMode !== 'notes' && (
          <LeftToolbar
            mode={mode}
            onChangeMode={setMode}
            isLibraryOpen={isLibraryOpen}
            onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onDeleteSelected={() => {
              if (selectedNodeId) {
                handleDeleteNode(selectedNodeId);
              } else if (selectedConnectionId) {
                handleDeleteConnection(selectedConnectionId);
              }
            }}
            hasSelection={!!selectedNodeId || !!selectedConnectionId}
          />
        )}

        {/* Floating Symbol Library Popup */}
        {viewMode !== 'notes' && (
          <div
            id="symbol-library-panel"
            className={`fixed left-[52px] top-[48px] w-[280px] h-[calc(100vh-56px)] bg-[#1a1d27] border border-[#2a2d3e] rounded-r-xl shadow-[0_8px_32px_rgba(0,0,0,0.55)] z-50 transition-all duration-200 ease-in-out ${
              isLibraryOpen
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-4 pointer-events-none'
            }`}
          >
            <Sidebar />
          </div>
        )}

        {/* Canvas (hidden in notes-only mode) */}
        {viewMode !== 'notes' && (
          <div
            id="board-container"
            className={`h-full overflow-hidden relative ${viewMode === 'both' ? 'flex-[3]' : 'flex-1'}`}
          >
            <Canvas
              state={state}
              onChangeState={setState}
              selectedNode={selectedNode}
              onSelectNode={(node) => {
                setSelectedNodeId(node ? node.id : null);
                if (node) {
                  setTextColor(node.textColor);
                  setSelectedConnectionId(null);
                }
              }}
              selectedConnection={selectedConnection}
              onSelectConnection={(conn) => {
                setSelectedConnectionId(conn ? conn.id : null);
                if (conn) {
                  setSelectedNodeId(null);
                }
              }}
              mode={mode}
              onChangeMode={setMode}
              panX={panX}
              panY={panY}
              onPanChange={(x, y) => {
                setPanX(x);
                setPanY(y);
              }}
              zoom={zoom}
              onZoomChange={setZoom}
              defaultTextColor={textColor}
            />
          </div>
        )}

        {/* Divider in both mode */}
        {viewMode === 'both' && (
          <div className="w-px bg-[#2a2d3e] shrink-0" />
        )}

        {/* Notes Panel (shown in notes or both mode) */}
        {viewMode !== 'canvas' && (
          <div className={`h-full overflow-hidden ${viewMode === 'both' ? 'flex-[2]' : 'flex-1'}`}>
            <Notes projectId={projectId || 'default'} />
          </div>
        )}

        {/* View mode toggle — floating in bottom-right corner */}
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 bg-[#1a1d27] border border-[#2a2d3e] rounded-xl p-1 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <button
            onClick={() => setViewMode('canvas')}
            title="Canvas only"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              viewMode === 'canvas'
                ? 'bg-[#6366f1] text-white'
                : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e2030]'
            }`}
          >
            <LayoutPanelLeft className="w-3.5 h-3.5" />
            Canvas
          </button>
          <button
            onClick={() => setViewMode('both')}
            title="Canvas + Notes"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              viewMode === 'both'
                ? 'bg-[#6366f1] text-white'
                : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e2030]'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            Both
          </button>
          <button
            onClick={() => setViewMode('notes')}
            title="Notes only"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              viewMode === 'notes'
                ? 'bg-[#6366f1] text-white'
                : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1e2030]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Notes
          </button>
        </div>
      </div>
    </div>
  );
};
export default Board;
