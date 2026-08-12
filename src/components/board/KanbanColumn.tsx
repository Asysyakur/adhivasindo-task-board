import React, { useState } from 'react';
import { BoardColumn, Task, User } from '../../types/task';
import { TaskCard } from './TaskCard';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Plus,
  MoreVertical,
  Minimize2,
  Maximize2,
  Pencil,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTaskStore } from '../../store/taskStore';

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  users: User[];
  columnIndex?: number;
  totalColumns?: number;
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  users,
  columnIndex = 0,
  totalColumns = 1,
  onAddTask,
  onTaskClick,
}) => {
  const { renameColumn, deleteColumn, moveColumn } = useTaskStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canMoveLeft = columnIndex > 0;
  const canMoveRight = columnIndex < totalColumns - 1;

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== column.title) {
      renameColumn(column.id, editTitle.trim());
    } else {
      setEditTitle(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditTitle(column.title);
      setIsEditingTitle(false);
    }
  };

  // COLLAPSED / MINIMIZED COLUMN VIEW (Jira Style Vertical Pill)
  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        onClick={() => setIsCollapsed(false)}
        className="w-14 shrink-0 rounded-2xl p-2.5 flex flex-col items-center justify-between h-full max-h-full bg-slate-100/90 border border-slate-200/80 hover:bg-slate-200/80 transition-all cursor-pointer select-none group"
        title="Click to expand column"
      >
        {/* Top: Expand Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-all shadow-2xs"
          title="Expand column"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Middle: Rotated Vertical Column Title & Task Count Badge */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 my-4">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shadow-2xs">
            {tasks.length}
          </span>
          <div className="writing-mode-vertical rotate-180 text-sm font-bold text-slate-700 tracking-wider uppercase whitespace-nowrap">
            {column.title}
          </div>
        </div>

        {/* Bottom: Plus icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTask?.(column.id);
          }}
          className="w-8 h-8 rounded-xl bg-slate-200/70 text-slate-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all"
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // FULL EXPANDED KANBAN COLUMN
  return (
    <>
      <div
        ref={setNodeRef}
        className={`kanban-column w-80 shrink-0 rounded-2xl p-3.5 flex flex-col h-full max-h-full min-h-0 transition-all relative ${
          isOver ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/20' : 'bg-white border border-slate-200/80'
        }`}
      >
        {/* Column Header */}
        <div className="column-header flex items-center justify-between px-1 mb-3.5 shrink-0 relative">
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="px-2 py-0.5 bg-white border border-blue-500 rounded-lg text-base font-bold text-slate-800 outline-none w-full"
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="text-lg font-bold text-slate-800 tracking-tight truncate cursor-pointer hover:text-blue-600 transition-colors"
                title="Click to rename"
              >
                {column.title}
              </span>
            )}

            {/* Add task button */}
            <button
              onClick={() => onAddTask?.(column.id)}
              className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Minimize Button & 3 Dots Options */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-md transition-colors p-1 cursor-pointer"
              title="Minimize / Collapse list"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            {/* 3 Dots Options Button */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-md transition-colors p-1 cursor-pointer shrink-0"
                title="Column options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* 3 Dots Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute top-8 right-0 z-50 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-xs font-medium text-slate-700 animate-in fade-in duration-150">
                    {/* Rename Option */}
                    <button
                      onClick={() => {
                        setIsEditingTitle(true);
                        setShowDropdown(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rename List</span>
                    </button>

                    {/* Move Left Option (Only if not first column) */}
                    {canMoveLeft && (
                      <button
                        onClick={() => {
                          moveColumn(column.id, 'left');
                          setShowDropdown(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                        <span>Move Left (Ke Kiri)</span>
                      </button>
                    )}

                    {/* Move Right Option (Only if not last column) */}
                    {canMoveRight && (
                      <button
                        onClick={() => {
                          moveColumn(column.id, 'right');
                          setShowDropdown(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                        <span>Move Right (Ke Kanan)</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    {/* Delete Option */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete List</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Task List - Vertical Scrollable Container inside Column */}
        <div className="task-list pt-1 flex-1 min-h-0 overflow-y-auto pr-0.5 space-y-3 scrollbar-thin">
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
              <div className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 text-xs font-medium bg-white/40">
                <span>No tasks here</span>
                <button
                  onClick={() => onAddTask?.(column.id)}
                  className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  + Add a task
                </button>
              </div>
            )}
          </SortableContext>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Column List?"
        message={`Are you sure you want to delete column "${column.title}" and all ${tasks.length} tasks inside it?`}
        confirmText="Delete Column"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteColumn(column.id)}
      />
    </>
  );
};
