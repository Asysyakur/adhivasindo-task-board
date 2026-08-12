import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { KanbanColumn } from './KanbanColumn';
import { Task } from '../../types/task';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  onTaskClick?: (task: Task) => void;
  onAddTaskClick?: (columnId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onTaskClick, onAddTaskClick }) => {
  const {
    columns,
    tasks,
    users,
    searchQuery,
    selectedLabelFilter,
    selectedAssigneeFilter,
    selectedDueDateFilter,
    moveTask,
    addColumn,
  } = useTaskStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks by Label, Assignee, Due Date, and Search Query
  const getFilteredTasksForColumn = (columnTaskIds: string[]) => {
    return columnTaskIds
      .map((id) => tasks[id])
      .filter(Boolean)
      .filter((task) => {
        // 1. Label filter
        if (selectedLabelFilter !== 'All' && task.label !== selectedLabelFilter) {
          return false;
        }

        // 2. Assignee filter
        if (
          selectedAssigneeFilter !== 'All' &&
          !task.assigneeIds.includes(selectedAssigneeFilter)
        ) {
          return false;
        }

        // 3. Due Date filter
        if (selectedDueDateFilter !== 'All' && task.dueDate !== selectedDueDateFilter) {
          return false;
        }

        // 4. Search query filter (matches title, description, assignee name, label, due date)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          const matchLabel = task.label.toLowerCase().includes(q);
          const matchDueDate = task.dueDate ? task.dueDate.toLowerCase().includes(q) : false;
          const matchAssignee = users.some(
            (u) => task.assigneeIds.includes(u.id) && u.name.toLowerCase().includes(q)
          );

          return matchTitle || matchDesc || matchLabel || matchDueDate || matchAssignee;
        }

        return true;
      });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    if (tasks[taskId]) {
      setActiveTask(tasks[taskId]);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskObj = tasks[activeId];
    if (!activeTaskObj) return;

    let overColId: string | null = null;

    if (columns.some((col) => col.id === overId)) {
      overColId = overId;
    } else if (tasks[overId]) {
      overColId = tasks[overId].columnId;
    }

    if (!overColId || activeTaskObj.columnId === overColId) return;

    const destCol = columns.find((c) => c.id === overColId);
    if (destCol) {
      moveTask(activeId, activeTaskObj.columnId, overColId, destCol.taskIds.length);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskObj = tasks[activeId];
    if (!activeTaskObj) return;

    let overColId: string | null = null;
    let newIndex = 0;

    if (columns.some((col) => col.id === overId)) {
      overColId = overId;
      const targetCol = columns.find((c) => c.id === overId);
      newIndex = targetCol ? targetCol.taskIds.length : 0;
    } else if (tasks[overId]) {
      overColId = tasks[overId].columnId;
      const targetCol = columns.find((c) => c.id === overColId);
      if (targetCol) {
        newIndex = targetCol.taskIds.indexOf(overId);
      }
    }

    if (overColId) {
      moveTask(activeId, activeTaskObj.columnId, overColId, newIndex);
    }
  };

  const handleAddNewList = () => {
    const title = prompt('Enter list title:');
    if (title && title.trim()) {
      addColumn(title.trim());
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board-container flex-1 min-h-0 overflow-x-auto overflow-y-hidden p-6 bg-white scrollbar-thin">
        <div className="flex gap-5 items-stretch h-full min-h-0 min-w-max pb-2">
          {columns.map((col) => {
            const colTasks = getFilteredTasksForColumn(col.taskIds);
            return (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={colTasks}
                users={users}
                onAddTask={onAddTaskClick}
                onTaskClick={onTaskClick}
              />
            );
          })}

          {/* Add New List Button Column */}
          <div className="w-72 shrink-0">
            <button
              onClick={handleAddNewList}
              className="w-full h-14 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-800 hover:text-blue-600 text-sm font-semibold transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add new List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drag Overlay for smooth preview while dragging */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
            <TaskCard task={activeTask} users={users} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
