import { useDroppable } from '@dnd-kit/core';
import type { KanbanColumn as ColumnType } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  column: ColumnType;
  children: React.ReactNode;
}

export function KanbanDropZone({ column, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-drop-${column.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn('min-h-[60px] rounded-lg transition-colors border-2 border-dashed', isOver && 'border-[#7170ff] bg-[#7170ff]/5')}
    >
      {children}
    </div>
  );
}
