import React, { useState, useEffect } from 'react';
import { X, Plus, Layout, Kanban } from 'lucide-react';

interface SimpleFormModalProps {
  isOpen: boolean;
  type: 'column' | 'board';
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export const SimpleFormModal: React.FC<SimpleFormModalProps> = ({
  isOpen,
  type,
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isColumn = type === 'column';
  const modalTitle = isColumn ? 'Add New Column List' : 'Create New Board Workspace';
  const labelText = isColumn ? 'Column Title' : 'Board Name';
  const placeholder = isColumn
    ? 'e.g., Testing, Backlog, QA Review...'
    : 'e.g., Adhivasindo Mobile App, Sprint 18...';
  const buttonText = isColumn ? 'Create Column' : 'Create Board';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            {isColumn ? (
              <Layout className="w-5 h-5 text-blue-600" />
            ) : (
              <Kanban className="w-5 h-5 text-blue-600" />
            )}
            <div className="text-base font-bold tracking-tight">{modalTitle}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {labelText} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{buttonText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
