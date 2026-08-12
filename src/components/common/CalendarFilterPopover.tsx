import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react';

interface CalendarFilterPopoverProps {
  selectedDate: string; // "All" or e.g. "8 Aug" / "8 Aug, 2026"
  taskDueDates: string[]; // List of all due dates present on the board
  onSelectDate: (dateStr: string) => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const CalendarFilterPopover: React.FC<CalendarFilterPopoverProps> = ({
  selectedDate,
  taskDueDates,
  onSelectDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default calendar month to August 2026 (matching mock dataset) or current month
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 1));

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar day calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Helper function to check if a specific day has tasks scheduled (Indicator Dot)
  const getTasksCountForDay = (dayNum: number) => {
    const monthName = MONTH_NAMES[month];
    // Formats to match mock due dates e.g. "8 Aug" or "8 Aug, 2026"
    const target1 = `${dayNum} ${monthName}`;
    const target2 = `${dayNum} ${monthName}, ${year}`;

    return taskDueDates.filter(
      (d) => d === target1 || d === target2 || d.startsWith(`${dayNum} ${monthName}`)
    ).length;
  };

  const handleSelectDay = (dayNum: number) => {
    const monthName = MONTH_NAMES[month];
    const formattedDate = `${dayNum} ${monthName}`;
    onSelectDate(formattedDate);
    setIsOpen(false);
  };

  const isFiltering = selectedDate !== 'All';

  return (
    <div ref={containerRef} className="relative inline-block z-40">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-2xs ${isFiltering
            ? 'bg-blue-600 text-white font-bold'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
      >
        <Calendar className={`w-3.5 h-3.5 ${isFiltering ? 'text-white' : 'text-blue-600'}`} />
        <span>{isFiltering ? selectedDate : 'All Dates'}</span>
        {isFiltering && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onSelectDate('All');
            }}
            className="ml-1 p-0.5 rounded-full hover:bg-blue-700 text-white"
            title="Reset Date Filter"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Backdrop & Calendar Filter Dropdown Popover */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-10 left-0 sm:left-auto sm:right-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800">
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const monthName = MONTH_NAMES[month];
                const dateString = `${dayNum} ${monthName}`;
                const isSelected = selectedDate === dateString || selectedDate.startsWith(dateString);
                const taskCount = getTasksCountForDay(dayNum);
                const hasTasks = taskCount > 0;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={`h-8 rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative transition-all cursor-pointer ${isSelected
                        ? 'bg-blue-600 text-white shadow-md font-bold scale-105'
                        : hasTasks
                          ? 'bg-blue-50 text-blue-700 font-bold hover:bg-blue-100'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    title={hasTasks ? `${taskCount} task(s) due on ${dateString}` : undefined}
                  >
                    <span>{dayNum}</span>

                    {/* Indicator Dot Badge for dates with scheduled tasks */}
                    {hasTasks && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? 'bg-white' : 'bg-blue-600 ring-1 ring-white'
                          }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Action to Clear Filter */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> = Has Tasks
              </span>

              <button
                type="button"
                onClick={() => {
                  onSelectDate('All');
                  setIsOpen(false);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Show All Tasks</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
