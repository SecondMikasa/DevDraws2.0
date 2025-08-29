"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

// TypeScript interfaces for loading state management
export interface LoadingState {
  boardId: string;
  timestamp: number;
  type: 'navigation' | 'action';
}

export interface BoardLoadingContextType {
  loadingBoardId: string | null;
  setLoadingBoard: (id: string | null) => void;
  isLoading: (id: string) => boolean;
  loadingStates: LoadingState[];
  addLoadingState: (boardId: string, type: 'navigation' | 'action') => void;
  removeLoadingState: (boardId: string) => void;
}

// Create the context
const BoardLoadingContext = createContext<BoardLoadingContextType | undefined>(undefined);

interface BoardLoadingProviderProps {
  children: ReactNode;
}

// Provider component
export function BoardLoadingProvider({ children }: BoardLoadingProviderProps) {
  const [loadingBoardId, setLoadingBoardId] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);

  const setLoadingBoard = useCallback((id: string | null) => {
    setLoadingBoardId(id);
  }, []);

  const isLoading = useCallback((id: string): boolean => {
    return loadingBoardId === id || loadingStates.some(state => state.boardId === id);
  }, [loadingBoardId, loadingStates]);

  const addLoadingState = useCallback((boardId: string, type: 'navigation' | 'action') => {
    const newState: LoadingState = {
      boardId,
      timestamp: Date.now(),
      type
    };
    
    setLoadingStates(prev => {
      // Remove any existing state for this board to avoid duplicates
      const filtered = prev.filter(state => state.boardId !== boardId);
      return [...filtered, newState];
    });
  }, []);

  const removeLoadingState = useCallback((boardId: string) => {
    setLoadingStates(prev => prev.filter(state => state.boardId !== boardId));
    
    // Also clear the main loading board if it matches
    setLoadingBoardId(prev => prev === boardId ? null : prev);
  }, []);

  const value = useMemo((): BoardLoadingContextType => ({
    loadingBoardId,
    setLoadingBoard,
    isLoading,
    loadingStates,
    addLoadingState,
    removeLoadingState
  }), [loadingBoardId, setLoadingBoard, isLoading, loadingStates, addLoadingState, removeLoadingState]);

  return (
    <BoardLoadingContext.Provider value={value}>
      {children}
    </BoardLoadingContext.Provider>
  );
}

// Custom hook for accessing loading state
export function useBoardLoading(): BoardLoadingContextType {
  const context = useContext(BoardLoadingContext);
  
  if (context === undefined) {
    throw new Error('useBoardLoading must be used within a BoardLoadingProvider');
  }
  
  return context;
}

// Export the context for advanced use cases
export { BoardLoadingContext };