import React, { useState } from 'react';
import { ChecklistItem } from '../../types/task';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';

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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddItem(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  return (
    <div className="checklist-section flex flex-col gap-3">
      {/* Title Header */}
      <h3 className="text-base font-bold text-slate-800 tracking-tight">Check List</h3>

      {/* Progress counter & progress bar matching reference screenshot */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-500">
          {completedCount}/{totalCount}
        </span>
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items list */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between group p-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-lg transition-colors"
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
              onClick={() => onDeleteItem(item.id)}
              className="text-slate-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Delete subtask"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Subtask Form / Button */}
      {isAdding ? (
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Type subtask title..."
            autoFocus
            className="flex-1 px-3 py-1.5 bg-slate-100 border border-blue-400 rounded-lg text-xs outline-none text-slate-800"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span>Add subtask</span>
        </button>
      )}
    </div>
  );
};
