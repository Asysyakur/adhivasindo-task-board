import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { TaskLabel } from '../../types/task';
import { User, Tag, RotateCcw, Filter } from 'lucide-react';
import { CalendarFilterPopover } from './CalendarFilterPopover';

const LABELS: (TaskLabel | 'All')[] = ['All', 'Feature', 'Bug', 'Issue', 'Undefined'];

export const FilterBar: React.FC = () => {
  const {
    users,
    tasks,
    selectedLabelFilter,
    selectedAssigneeFilter,
    selectedDueDateFilter,
    setLabelFilter,
    setAssigneeFilter,
    setDueDateFilter,
    resetFilters,
  } = useTaskStore();

  // Extract all due dates from active tasks for date indicators
  const taskDueDates = Object.values(tasks)
    .map((t) => t.dueDate)
    .filter((d): d is string => Boolean(d));

  const activeFiltersCount =
    (selectedLabelFilter !== 'All' ? 1 : 0) +
    (selectedAssigneeFilter !== 'All' ? 1 : 0) +
    (selectedDueDateFilter !== 'All' ? 1 : 0);

  return (
    <div className="filter-bar bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 flex-wrap relative z-10">
      <div className="flex items-center gap-3.5 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* 1. Label Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-0.5 flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>Label:</span>
          </span>
          {LABELS.map((lbl) => {
            const isActive = selectedLabelFilter === lbl;
            return (
              <button
                key={lbl}
                onClick={() => setLabelFilter(lbl)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {lbl}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-slate-200 hidden md:block" />

        {/* 2. Assignee Filter Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>Assignee:</span>
          </span>
          <select
            value={selectedAssigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="All">All Assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden md:block" />

        {/* 3. Interactive Due Date Calendar Popover with Task Indicators */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Due Date:</span>
          <CalendarFilterPopover
            selectedDate={selectedDueDateFilter}
            taskDueDates={taskDueDates}
            onSelectDate={(dateStr) => setDueDateFilter(dateStr)}
          />
        </div>
      </div>

      {/* Reset Filters Button */}
      {activeFiltersCount > 0 && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
