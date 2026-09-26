import React from 'react';
import {
  MousePointer2,
  Link2,
  Type,
  LayoutGrid,
  Undo2,
  Redo2,
  Trash2,
  Square,
  Circle,
  Diamond,
  Database,
  Cloud,
  User,
  Pencil,
} from 'lucide-react';

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

interface LeftToolbarProps {
  mode: ToolMode;
  onChangeMode: (mode: ToolMode) => void;
  isLibraryOpen: boolean;
  onToggleLibrary: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onDeleteSelected: () => void;
  hasSelection: boolean;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  mode,
  onChangeMode,
  isLibraryOpen,
  onToggleLibrary,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onDeleteSelected,
  hasSelection,
}) => {
  const tools = [
    {
      id: 'select',
      name: 'Select mode',
      icon: MousePointer2,
      action: () => onChangeMode('select'),
      active: mode === 'select',
    },
    {
      id: 'connect',
      name: 'Connect mode',
      icon: Link2,
      action: () => onChangeMode('connect'),
      active: mode === 'connect',
    },
    {
      id: 'text',
      name: 'Text mode',
      icon: Type,
      action: () => onChangeMode('text'),
      active: mode === 'text',
    },
    {
      id: 'draw-rect',
      name: 'Draw Rectangle',
      icon: Square,
      action: () => onChangeMode('draw-rect'),
      active: mode === 'draw-rect',
    },
    {
      id: 'draw-circle',
      name: 'Draw Circle',
      icon: Circle,
      action: () => onChangeMode('draw-circle'),
      active: mode === 'draw-circle',
    },
    {
      id: 'draw-diamond',
      name: 'Draw Diamond',
      icon: Diamond,
      action: () => onChangeMode('draw-diamond'),
      active: mode === 'draw-diamond',
    },
    {
      id: 'draw-cylinder',
      name: 'Draw Cylinder',
      icon: Database,
      action: () => onChangeMode('draw-cylinder'),
      active: mode === 'draw-cylinder',
    },
    {
      id: 'draw-cloud',
      name: 'Draw Cloud',
      icon: Cloud,
      action: () => onChangeMode('draw-cloud'),
      active: mode === 'draw-cloud',
    },
    {
      id: 'draw-user',
      name: 'Draw Actor',
      icon: User,
      action: () => onChangeMode('draw-user'),
      active: mode === 'draw-user',
    },
    {
      id: 'draw-pencil',
      name: 'Pencil (Freehand)',
      icon: Pencil,
      action: () => onChangeMode('draw-pencil'),
      active: mode === 'draw-pencil',
    },
    {
      id: 'library',
      name: 'Symbols library',
      icon: LayoutGrid,
      action: onToggleLibrary,
      active: isLibraryOpen,
    },
  ];

  return (
    <aside className="w-12 bg-[#1a1d27] border-r border-[#2a2d3e] flex flex-col items-center py-3 h-full shrink-0 select-none z-20">
      {/* Modes & Library Toggles */}
      <div className="flex-1 flex flex-col gap-2 w-full items-center overflow-y-auto no-scrollbar">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="relative group">
              <button
                id={tool.id === 'library' ? 'layout-grid-btn' : undefined}
                onClick={tool.action}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 outline-none border-0 ${
                  tool.active
                    ? 'bg-[#6366f1] text-white shadow-sm shadow-[#6366f1]/20'
                    : 'text-[#64748b] hover:text-[#6366f1] hover:bg-[#1e2035]'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </button>
              {/* CSS Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#1a1d27] border border-[#2a2d3e] text-slate-200 text-[10px] font-semibold px-2 py-1 rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                {tool.name}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-[#2a2d3e] my-3 w-7 shrink-0" />

      {/* History & Actions */}
      <div className="flex flex-col gap-2 w-full items-center shrink-0">
        {/* Undo */}
        <div className="relative group">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 outline-none border-0 text-[#64748b] hover:text-[#6366f1] hover:bg-[#1e2035] disabled:opacity-30 disabled:hover:text-[#64748b] disabled:hover:bg-transparent"
          >
            <Undo2 className="w-4.5 h-4.5" />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#1a1d27] border border-[#2a2d3e] text-slate-200 text-[10px] font-semibold px-2 py-1 rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
            Undo (Ctrl+Z)
          </div>
        </div>

        {/* Redo */}
        <div className="relative group">
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 outline-none border-0 text-[#64748b] hover:text-[#6366f1] hover:bg-[#1e2035] disabled:opacity-30 disabled:hover:text-[#64748b] disabled:hover:bg-transparent"
          >
            <Redo2 className="w-4.5 h-4.5" />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#1a1d27] border border-[#2a2d3e] text-slate-200 text-[10px] font-semibold px-2 py-1 rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
            Redo (Ctrl+Y)
          </div>
        </div>

        {/* Delete */}
        <div className="relative group">
          <button
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 outline-none border-0 text-[#64748b] hover:text-rose-500 hover:bg-rose-950/20 disabled:opacity-30 disabled:hover:text-[#64748b] disabled:hover:bg-transparent"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#1a1d27] border border-[#2a2d3e] text-slate-200 text-[10px] font-semibold px-2 py-1 rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
            Delete selection (Delete)
          </div>
        </div>
      </div>
    </aside>
  );
};
