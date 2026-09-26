import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, FileText, Clock,
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Code, Link2, Minus,
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string; // stored as HTML
  createdAt: string;
  updatedAt: string;
  color: string;
}

interface NotesProps {
  projectId: string;
}

const NOTE_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4',
];

const FONT_SIZES = ['11', '12', '13', '14', '16', '18', '20', '24', '28', '32'];

const STORAGE_KEY = (projectId: string) => `cloudboard_notes_${projectId}`;

const execCmd = (cmd: string, value?: string) => {
  document.execCommand(cmd, false, value);
};

interface ToolbarBtnProps {
  title: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}
const ToolbarBtn: React.FC<ToolbarBtnProps> = ({ title, onClick, active, children }) => (
  <button
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`w-7 h-7 flex items-center justify-center rounded text-[11px] transition-all shrink-0 ${
      active
        ? 'bg-[#6366f1] text-white'
        : 'text-[#94a3b8] hover:bg-[#2a2d3e] hover:text-[#e2e8f0]'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-[#2a2d3e] mx-0.5 shrink-0" />;

export const Notes: React.FC<NotesProps> = ({ projectId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState('13');
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(projectId));
      if (saved) {
        const parsed = JSON.parse(saved) as Note[];
        setNotes(parsed);
        if (parsed.length > 0) setActiveNoteId(parsed[0].id);
      }
    } catch { /* ignore */ }
  }, [projectId]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(notes));
    }
  }, [notes, projectId]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // Sync editor content when switching notes
  useEffect(() => {
    if (editorRef.current && activeNote) {
      editorRef.current.innerHTML = activeNote.content || '';
      editorRef.current.focus();
    }
  }, [activeNoteId]);

  const saveContent = useCallback(() => {
    if (!activeNoteId || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === activeNoteId ? { ...n, content: html, updatedAt: now } : n))
    );
  }, [activeNoteId]);

  const handleEditorInput = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveContent, 600);
  };

  const createNote = () => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdAt: now,
      updatedAt: now,
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length],
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateNote = (id: string, changes: Partial<Note>) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...changes, updatedAt: now } : n))
    );
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) execCmd('createLink', url);
  };

  const handleInsertHR = () => execCmd('insertHTML', '<hr style="border-color:#2a2d3e;margin:12px 0"/>');

  const handleFontSize = (size: string) => {
    setFontSize(size);
    // execCommand fontSize only supports 1-7, use font tag workaround
    execCmd('fontSize', '7');
    const editor = editorRef.current;
    if (!editor) return;
    const fontEls = editor.querySelectorAll('font[size="7"]');
    fontEls.forEach((el) => {
      el.removeAttribute('size');
      (el as HTMLElement).style.fontSize = `${size}px`;
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex bg-[#0f1117] overflow-hidden">
      {/* Left: Note List */}
      <div className="w-[196px] shrink-0 flex flex-col border-r border-[#2a2d3e] bg-[#13151f]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6366f1]" />
            <span className="text-[11px] font-bold text-[#6366f1] uppercase tracking-widest">Notes</span>
          </div>
          <button
            onClick={createNote}
            className="w-6 h-6 flex items-center justify-center rounded-md bg-[#6366f1] hover:bg-[#4f52c9] transition-colors"
            title="New note"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <FileText className="w-8 h-8 text-[#2a2d3e] mb-3" />
              <p className="text-[11px] text-[#64748b] leading-relaxed">No notes yet.<br />Click + to create one.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => { saveContent(); setActiveNoteId(note.id); }}
                className={`group flex flex-col px-3 py-2.5 cursor-pointer border-b border-[#1e2030] transition-colors ${
                  activeNoteId === note.id ? 'bg-[#1e2030]' : 'hover:bg-[#1a1d27]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: note.color }} />
                  <span className="text-[11px] font-semibold text-[#e2e8f0] truncate flex-1">
                    {note.title || 'Untitled'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="opacity-0 group-hover:opacity-100 shrink-0 text-[#64748b] hover:text-[#ef4444] transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[9px] text-[#64748b] line-clamp-1 pl-3.5">
                  {note.content.replace(/<[^>]*>/g, '') || 'Empty note...'}
                </p>
                <div className="flex items-center gap-1 mt-1 pl-3.5">
                  <Clock className="w-2.5 h-2.5 text-[#475569]" />
                  <span className="text-[9px] text-[#475569]">{formatDate(note.updatedAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeNote ? (
          <>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2a2d3e] bg-[#13151f] shrink-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: activeNote.color }} />
              {/* Color picker */}
              <div className="flex gap-1">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateNote(activeNote.id, { color: c })}
                    className={`w-3 h-3 rounded-full border-[1.5px] transition-transform hover:scale-125 ${
                      activeNote.color === c ? 'border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Note title..."
                className="flex-1 bg-transparent text-[13px] font-bold text-[#e2e8f0] placeholder-[#475569] focus:outline-none"
              />
              <button
                onClick={() => deleteNote(activeNote.id)}
                className="text-[#64748b] hover:text-[#ef4444] transition-colors p-1"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rich text Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-[#2a2d3e] bg-[#13151f] shrink-0 flex-wrap">
              {/* Font size selector */}
              <select
                value={fontSize}
                onChange={(e) => handleFontSize(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                className="h-7 text-[11px] bg-[#1e2030] text-[#94a3b8] border border-[#2a2d3e] rounded px-1.5 mr-1 focus:outline-none hover:border-[#6366f1] cursor-pointer"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>

              <Divider />

              <ToolbarBtn title="Bold (Ctrl+B)" onClick={() => execCmd('bold')}><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Italic (Ctrl+I)" onClick={() => execCmd('italic')}><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Underline (Ctrl+U)" onClick={() => execCmd('underline')}><Underline className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Strikethrough" onClick={() => execCmd('strikeThrough')}><Strikethrough className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Inline code" onClick={() => execCmd('insertHTML', '<code style="background:#1e2030;padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.9em">code</code>')}><Code className="w-3.5 h-3.5" /></ToolbarBtn>

              <Divider />

              <ToolbarBtn title="Heading 1" onClick={() => execCmd('formatBlock', '<h1>')}><Heading1 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Heading 2" onClick={() => execCmd('formatBlock', '<h2>')}><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Paragraph" onClick={() => execCmd('formatBlock', '<p>')}>
                <span className="text-[10px] font-bold leading-none">P</span>
              </ToolbarBtn>

              <Divider />

              <ToolbarBtn title="Bullet list" onClick={() => execCmd('insertUnorderedList')}><List className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Numbered list" onClick={() => execCmd('insertOrderedList')}><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Insert horizontal rule" onClick={handleInsertHR}><Minus className="w-3.5 h-3.5" /></ToolbarBtn>

              <Divider />

              <ToolbarBtn title="Align left" onClick={() => execCmd('justifyLeft')}><AlignLeft className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Align center" onClick={() => execCmd('justifyCenter')}><AlignCenter className="w-3.5 h-3.5" /></ToolbarBtn>
              <ToolbarBtn title="Align right" onClick={() => execCmd('justifyRight')}><AlignRight className="w-3.5 h-3.5" /></ToolbarBtn>

              <Divider />

              <ToolbarBtn title="Insert link" onClick={handleInsertLink}><Link2 className="w-3.5 h-3.5" /></ToolbarBtn>

              {/* Text color */}
              <div className="relative group ml-0.5">
                <div
                  className="w-7 h-7 flex items-center justify-center rounded text-[11px] text-[#94a3b8] hover:bg-[#2a2d3e] hover:text-[#e2e8f0] cursor-pointer transition-all"
                  title="Text color"
                >
                  <span className="text-[11px] font-bold" style={{ borderBottom: '3px solid #6366f1', lineHeight: '1' }}>A</span>
                </div>
                <input
                  type="color"
                  defaultValue="#e2e8f0"
                  onChange={(e) => execCmd('foreColor', e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                  title="Text color"
                />
              </div>

              {/* Highlight color */}
              <div className="relative group">
                <div
                  className="w-7 h-7 flex items-center justify-center rounded text-[11px] text-[#94a3b8] hover:bg-[#2a2d3e] hover:text-[#e2e8f0] cursor-pointer transition-all"
                  title="Highlight color"
                >
                  <span className="text-[11px] font-bold" style={{ background: '#f59e0b', padding: '0 3px', borderRadius: 2, color: '#000' }}>H</span>
                </div>
                <input
                  type="color"
                  defaultValue="#f59e0b"
                  onChange={(e) => execCmd('backColor', e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                  title="Highlight"
                />
              </div>
            </div>

            {/* Contenteditable editor */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onBlur={saveContent}
              className="flex-1 overflow-y-auto px-6 py-5 text-[13px] text-[#e2e8f0] focus:outline-none bg-[#0f1117] notes-editor"
              style={{
                lineHeight: '1.75',
                minHeight: 0,
              }}
            />

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2 border-t border-[#2a2d3e] bg-[#13151f] shrink-0">
              <span className="text-[10px] text-[#475569]">
                Last updated: {formatDate(activeNote.updatedAt)}
              </span>
              <span className="text-[10px] text-[#475569]">
                {activeNote.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1e2030] flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#2a2d3e]" />
            </div>
            <h3 className="text-sm font-bold text-[#64748b] mb-2">No note selected</h3>
            <p className="text-xs text-[#475569] leading-relaxed mb-5">
              Select a note or create a new one to start writing.
            </p>
            <button
              onClick={createNote}
              className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#4f52c9] rounded-lg text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
