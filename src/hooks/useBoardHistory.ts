import { useState, useCallback, useEffect, useRef } from 'react';
import type { BoardState } from '../types/board';

const MAX_HISTORY_LENGTH = 50;

export const useBoardHistory = (initialState: BoardState) => {
  const [state, setStateInternal] = useState<BoardState>(initialState);
  
  // Use refs to keep history stack without triggering re-renders
  const undoStack = useRef<BoardState[]>([]);
  const redoStack = useRef<BoardState[]>([]);
  
  // Track if current state update should skip pushing to history
  const skipHistoryRef = useRef<boolean>(false);

  // Reset history stacks (e.g., on project load)
  const resetHistory = useCallback((newState: BoardState) => {
    setStateInternal(newState);
    undoStack.current = [];
    redoStack.current = [];
    skipHistoryRef.current = false;
  }, []);

  // Update board state, optionally adding to history stack
  const updateBoardState = useCallback((
    newStateOrUpdater: BoardState | ((prev: BoardState) => BoardState),
    saveToHistory = true
  ) => {
    setStateInternal((prev) => {
      let resolvedState: BoardState;
      if (typeof newStateOrUpdater === 'function') {
        resolvedState = newStateOrUpdater(prev);
      } else {
        resolvedState = newStateOrUpdater;
      }

      // Check if state is identical to avoid redundant history states
      if (JSON.stringify(resolvedState) === JSON.stringify(prev)) {
        return prev;
      }

      if (saveToHistory && !skipHistoryRef.current) {
        // Push deep copy of previous state to undo stack
        undoStack.current.push(JSON.parse(JSON.stringify(prev)));
        
        // Truncate stack if it exceeds maximum limit
        if (undoStack.current.length > MAX_HISTORY_LENGTH) {
          undoStack.current.shift();
        }
        
        // Reset redo stack when a new action is performed
        redoStack.current = [];
      }

      return resolvedState;
    });
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    
    const prev = undoStack.current.pop()!;
    
    // Push current state to redo stack
    redoStack.current.push(JSON.parse(JSON.stringify(state)));
    
    // Set current state
    skipHistoryRef.current = true;
    setStateInternal(prev);
    setTimeout(() => {
      skipHistoryRef.current = false;
    }, 0);
  }, [state]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    
    const next = redoStack.current.pop()!;
    
    // Push current state to undo stack
    undoStack.current.push(JSON.parse(JSON.stringify(state)));
    
    // Set current state
    skipHistoryRef.current = true;
    setStateInternal(next);
    setTimeout(() => {
      skipHistoryRef.current = false;
    }, 0);
  }, [state]);

  // Bind keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea to avoid conflicts
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.hasAttribute('contenteditable'))
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        // Fallback redo (Ctrl+Shift+Z)
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  return {
    state,
    setState: updateBoardState,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    resetHistory,
  };
};
