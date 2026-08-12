import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { TaskLabel } from '../../types/task';

const LABELS: (TaskLabel | 'All')[] = ['All', 'Feature', 'Bug', 'Issue', 'Undefined'];

export const FilterBar: React.FC = () => {
  const { selectedLabelFilter, setLabelFilter } = useTaskStore();

  return (
    <div className="filter-bar bg-white border-b border-slate-200/60 px-6 py-2 flex items-center gap-2 overflow-x-auto">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
        Filter Label:
      </span>
      {LABELS.map((lbl) => {
        const isActive = selectedLabelFilter === lbl;
        return (
          <button
            key={lbl}
            onClick={() => setLabelFilter(lbl)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
};
