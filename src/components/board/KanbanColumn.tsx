import React from 'react';
import { BoardColumn, Task, User } from '../../types/task';
import { TaskCard } from './TaskCard';
import { Plus, MoreVertical, Minimize2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  users: User[];
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  users,
  onAddTask,
  onTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column w-80 shrink-0 rounded-2xl p-3 flex flex-col max-h-fulltransition-colors ${
        isOver ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/20' : ''
      }`}
    >
      {/* Column Header */}
      <div className="column-header flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-800 tracking-tight">{column.title}</span>
          <button
            onClick={() => onAddTask?.(column.id)}
            className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Add task"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            className="text-slate-600 hover:bg-slate-100 hover:rounded-md transition-colors p-1"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="text-slate-600 hover:bg-slate-100 hover:rounded-md transition-colors p-1"
            title="Expand/Collapse"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list flex-1 overflow-y-auto pr-0.5 space-y-3 min-h-[120px] scrollbar-thin">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onClick={() => onTaskClick?.(task)}
              />
            ))
          ) : (
            <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
              No tasks here
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
