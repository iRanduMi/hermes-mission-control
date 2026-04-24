import { createContext, useContext, type ReactNode } from 'react';

interface KanbanContextValue {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedTask: Record<string, unknown> | null;
  setSelectedTask: (task: Record<string, unknown> | null) => void;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

export function KanbanProvider({ children, isModalOpen, setIsModalOpen, selectedTask, setSelectedTask }: KanbanContextValue & { children: ReactNode }) {
  return (
    <KanbanContext.Provider value={{ isModalOpen, setIsModalOpen, selectedTask, setSelectedTask }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error('useKanban must be used within KanbanProvider');
  return ctx;
}
