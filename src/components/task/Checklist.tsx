import React, { useState } from 'react';
import { ChecklistItem } from '../../types/task';
import { Plus, Trash2, CheckSquare, Square, X } from 'lucide-react';

interface ChecklistProps {
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (title: string) => void;
  onDeleteItem: (id: string) => void;
}

export const Checklist: React.FC<ChecklistProps> = ({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddSubmit = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (newSubtaskTitle.trim()) {
      onAddItem(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsAdding(true); // Keep input open for quick consecutive subtask additions!
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAddSubmit(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setIsAdding(false);
    }
  };

  return (
    <div className="checklist-section flex flex-col gap-3">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">Check List</h3>
        <span className="text-xs font-semibold text-slate-500">
          {completedCount}/{totalCount} ({Math.round(progressPercent)}%)
        </span>
      </div>

      {/* Progress counter & progress bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist items list */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between group p-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-colors shadow-2xs"
          >
            <label className="flex items-center gap-2.5 cursor-pointer flex-1 select-none overflow-hidden">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleItem(item.id)}
                className="hidden"
              />
              {item.completed ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span
                className={`text-xs font-medium truncate ${
                  item.completed ? 'line-through text-slate-400' : 'text-slate-700'
                }`}
              >
                {item.title}
              </span>
            </label>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
              className="text-slate-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-lg hover:bg-red-50"
              title="Delete subtask"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Subtask Form / Button (Div-based to avoid outer form trigger) */}
      {isAdding ? (
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type subtask title & press Enter..."
            autoFocus
            className="flex-1 px-3 py-2 bg-slate-50 border border-blue-500 rounded-xl text-xs outline-none text-slate-800 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={handleAddSubmit}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Add
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAdding(false);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsAdding(true);
          }}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span>Add subtask</span>
        </button>
      )}
    </div>
  );
};
