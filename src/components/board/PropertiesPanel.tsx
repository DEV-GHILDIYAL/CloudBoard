import React from 'react';
import type { Node, Connection } from '../../types/board';
import { Trash2, Type, Paintbrush, Move, FileText, Compass, X } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  selectedConnection: Connection | null;
  onUpdateNode: (node: Node) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateConnection: (conn: Connection) => void;
  onDeleteConnection: (connId: string) => void;
  onClose: () => void;
}

const PRESET_FILLS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Slate', value: '#f8fafc' },
  { name: 'Blue', value: '#e0f2fe' },
  { name: 'Green', value: '#dcfce7' },
  { name: 'Orange', value: '#ffedd5' },
  { name: 'Red', value: '#fee2e2' },
  { name: 'Yellow', value: '#fef9c3' },
  { name: 'Purple', value: '#f3e8ff' },
];

const PRESET_TEXTS = [
  { name: 'Dark', value: '#0f172a' },
  { name: 'Gray', value: '#475569' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Red', value: '#b91c1c' },
  { name: 'Green', value: '#15803d' },
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedConnection,
  onUpdateNode,
  onDeleteNode,
  onUpdateConnection,
  onDeleteConnection,
  onClose,
}) => {
  // If nothing is selected, don't show the panel at all
  if (!selectedNode && !selectedConnection) {
    return null;
  }

  return (
    <aside className="w-[220px] bg-[#1a1d27] border-l border-[#2a2d3e] flex flex-col h-full overflow-y-auto shrink-0 select-none text-slate-205">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#2a2d3e] flex items-center justify-between bg-[#1a1d27] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#6366f1]" />
          <h3 className="text-[11px] font-semibold text-[#6366f1] uppercase tracking-wider">PROPERTIES</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white rounded p-1 hover:bg-[#1e2035] transition-colors border-0 bg-transparent"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* --- NODE PROPERTIES --- */}
        {selectedNode && (
          <>
            {/* Label Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#64748b]" />
                Node Label
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => onUpdateNode({ ...selectedNode, label: e.target.value })}
                className="bg-[#0f1117] border border-[#2a2d3e] focus:border-[#6366f1] rounded-[6px] px-3 py-1.5 text-xs text-[#e2e8f0] focus:outline-none transition-colors w-full font-medium"
              />
            </div>

            {/* Note Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#64748b]" />
                Notes / Info
              </label>
              <textarea
                value={selectedNode.note || ''}
                onChange={(e) => onUpdateNode({ ...selectedNode, note: e.target.value })}
                placeholder="DNS, subnets, variables..."
                rows={3}
                className="bg-[#0f1117] border border-[#2a2d3e] focus:border-[#6366f1] rounded-[6px] px-3 py-1.5 text-xs text-[#e2e8f0] focus:outline-none transition-colors w-full resize-none placeholder-slate-700 font-medium"
              />
            </div>

            {/* Fill Color Preset grid */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-[#64748b]" />
                Fill Color
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESET_FILLS.map((fill) => (
                  <button
                    key={fill.value}
                    onClick={() => onUpdateNode({ ...selectedNode, fillColor: fill.value })}
                    style={{ backgroundColor: fill.value }}
                    className={`w-6 h-6 rounded-md border transition-all ${
                      selectedNode.fillColor === fill.value
                        ? 'border-[#6366f1] ring-2 ring-[#6366f1]/25 scale-105'
                        : 'border-[#2a2d3e] hover:border-slate-600'
                    }`}
                    title={fill.name}
                  />
                ))}
              </div>
            </div>

            {/* Text Color Preset grid */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-[#64748b]" />
                Text Color
              </label>
              <div className="flex items-center gap-2">
                {PRESET_TEXTS.map((tc) => (
                  <button
                    key={tc.value}
                    onClick={() => onUpdateNode({ ...selectedNode, textColor: tc.value })}
                    style={{ color: tc.value }}
                    className={`w-6 h-6 rounded-md border bg-[#0f1117] flex items-center justify-center font-bold text-[10px] transition-all ${
                      selectedNode.textColor === tc.value
                        ? 'border-[#6366f1] ring-2 ring-[#6366f1]/25 scale-105'
                        : 'border-[#2a2d3e] hover:border-slate-600'
                    }`}
                    title={tc.name}
                  >
                    A
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-[#64748b]" />
                Dimensions (px)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-[#64748b]">Width</span>
                  <input
                    type="number"
                    value={selectedNode.w}
                    min="40"
                    max="300"
                    onChange={(e) =>
                      onUpdateNode({ ...selectedNode, w: Math.max(40, parseInt(e.target.value) || 40) })
                    }
                    className="bg-[#0f1117] border border-[#2a2d3e] focus:border-[#6366f1] rounded-[6px] px-2 py-1 text-xs text-[#e2e8f0] focus:outline-none transition-colors w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-[#64748b]">Height</span>
                  <input
                    type="number"
                    value={selectedNode.h}
                    min="40"
                    max="300"
                    onChange={(e) =>
                      onUpdateNode({ ...selectedNode, h: Math.max(40, parseInt(e.target.value) || 40) })
                    }
                    className="bg-[#0f1117] border border-[#2a2d3e] focus:border-[#6366f1] rounded-[6px] px-2 py-1 text-xs text-[#e2e8f0] focus:outline-none transition-colors w-full"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#2a2d3e] my-2" />

            {/* Delete Node Button */}
            <button
              onClick={() => onDeleteNode(selectedNode.id)}
              className="w-full border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-150 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Node
            </button>
          </>
        )}

        {/* --- CONNECTION PROPERTIES --- */}
        {selectedConnection && (
          <>
            {/* Connection Label */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#64748b]" />
                Connection Label
              </label>
              <input
                type="text"
                value={selectedConnection.label || ''}
                placeholder="e.g. HTTPS / Port 443"
                onChange={(e) => onUpdateConnection({ ...selectedConnection, label: e.target.value })}
                className="bg-[#0f1117] border border-[#2a2d3e] focus:border-[#6366f1] rounded-[6px] px-3 py-1.5 text-xs text-[#e2e8f0] focus:outline-none transition-colors w-full placeholder-slate-700"
              />
            </div>

            <div className="border-t border-[#2a2d3e] my-2" />

            {/* Delete Connection Button */}
            <button
              onClick={() => onDeleteConnection(selectedConnection.id)}
              className="w-full border border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-150 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Line
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
