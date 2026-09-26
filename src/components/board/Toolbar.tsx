import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Edit2,
} from 'lucide-react';

interface ToolbarProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearBoard: () => void;
  onExportSVG: () => void;
  onSave: () => void;
  isSaving: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  zoomPercent: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  projectName,
  onRenameProject,
  onExportSVG,
  onSave,
  isSaving,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  zoomPercent,
}) => {
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectName);

  useEffect(() => {
    setTitleInput(projectName);
  }, [projectName]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput.trim() !== projectName) {
      onRenameProject(titleInput.trim());
    } else {
      setTitleInput(projectName);
    }
  };

  return (
    <header className="h-11 bg-[#1a1d27] border-b border-[#2a2d3e] flex items-center justify-between px-4 shrink-0 select-none text-slate-100 z-30">
      {/* Left Area: Back Button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[#2a2d3e]" />

        {/* Project Name Editable Inline */}
        <div className="flex items-center gap-2 max-w-xs sm:max-w-md">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-[#0f1117] border border-[#2a2d3e] focus:border-[#6366f1] rounded-lg px-2 py-0.5 text-sm text-slate-100 font-bold focus:outline-none w-44 sm:w-60"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1.5 group">
              <span
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-bold text-white hover:text-[#6366f1] cursor-pointer transition-colors truncate"
              >
                {projectName}
              </span>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-350 rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Area: Empty */}
      <div className="flex-1" />

      {/* Right Area: Actions & Zoom */}
      <div className="flex items-center gap-3">
        {/* Zoom Operations */}
        <div className="flex items-center gap-1 bg-[#0f1117] px-2 py-0.5 rounded-lg border border-[#2a2d3e] h-8">
          <button
            onClick={onZoomOut}
            className="p-1 text-[#64748b] hover:text-[#e2e8f0] rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-[#e2e8f0] font-bold select-none w-10 text-center">
            {zoomPercent}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1 text-[#64748b] hover:text-[#e2e8f0] rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitToScreen}
            className="p-1 text-[#64748b] hover:text-[#e2e8f0] rounded transition-colors border-l border-[#2a2d3e] pl-1.5"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-[#2a2d3e]" />

        {/* Save & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 border-0 shadow-sm h-8"
            title="Manual Save to Cloud"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={onExportSVG}
            className="border border-[#2a2d3e] hover:border-[#6366f1] text-[#e2e8f0] hover:text-white bg-transparent hover:bg-slate-800/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 h-8"
            title="Export Diagram as Clean SVG Vector File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>
    </header>
  );
};
