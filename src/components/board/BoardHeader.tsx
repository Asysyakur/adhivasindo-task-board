import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { AvatarStack } from '../common/AvatarStack';
import { InviteModal } from '../common/InviteModal';
import { SimpleFormModal } from '../common/SimpleFormModal';
import { ExportImportModal } from '../common/ExportImportModal';
import {
  LockKeyhole,
  ChevronDown,
  UserPlus,
  Filter,
  ArrowUpDown,
  Search,
  Check,
  Plus,
  Kanban,
} from 'lucide-react';

interface BoardHeaderProps {
  onOpenFilter?: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ onOpenFilter }) => {
  const {
    users,
    searchQuery,
    setSearchQuery,
    boards,
    activeBoardId,
    setActiveBoard,
    createBoard,
  } = useTaskStore();

  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showExportImportModal, setShowExportImportModal] = useState(false);

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  const handleOpenAddBoardModal = () => {
    setShowBoardDropdown(false);
    setShowAddBoardModal(true);
  };

  return (
    <>
      <header className="board-header bg-white border-b border-slate-200/80 px-3 py-2.5 sm:px-4 sm:py-3 sticky top-0 z-20 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 md:gap-3 max-w-full">
          {/* Row 1 (Mobile & Desktop): Board Title, Avatars & Invite */}
          <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
            {/* Board Title Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setShowBoardDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 rounded-xl transition-all cursor-pointer shadow-2xs group"
              >
                <LockKeyhole className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
                <span className="text-sm sm:text-base font-bold tracking-tight max-w-[130px] sm:max-w-none truncate">
                  {activeBoard?.name || 'Adhivasindo'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 group-hover:text-slate-700 transition-colors shrink-0" />
              </button>

              {/* Board Switcher Dropdown Menu */}
              {showBoardDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowBoardDropdown(false)}
                  />
                  <div className="absolute top-10 left-0 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Board Workspace
                    </div>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto pr-0.5">
                      {boards.map((b) => {
                        const isActive = b.id === activeBoardId;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              setActiveBoard(b.id);
                              setShowBoardDropdown(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${isActive
                                ? 'bg-blue-50 text-blue-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <Kanban className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{b.name}</span>
                            </div>
                            {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={handleOpenAddBoardModal}
                      className="w-full px-3.5 py-2 text-left text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create New Board</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User Avatars & Invite Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              <AvatarStack users={users} maxCount={4} size="md" />

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Invite</span>
              </button>
            </div>
          </div>

          {/* Row 2 (Mobile) & Right Section (Desktop): Search, Filter & Export */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3/4 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white text-slate-800 text-xs rounded-xl outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={onOpenFilter}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Toggle Filter Bar"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* Export / Import Button */}
            <button
              onClick={() => setShowExportImportModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-2xs shrink-0"
              title="Export / Import JSON Data"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export / Import</span>
            </button>
          </div>
        </div>
      </header>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Add Board Reusable Modal */}
      <SimpleFormModal
        isOpen={showAddBoardModal}
        type="board"
        onClose={() => setShowAddBoardModal(false)}
        onSubmit={(name) => createBoard(name)}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={showExportImportModal}
        onClose={() => setShowExportImportModal(false)}
      />
    </>
  );
};
