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
      <header className="board-header bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-20 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 max-w-full">
          {/* Left & Middle Section: Board Title, Avatars & Invite */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Board Title Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setShowBoardDropdown((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 rounded-xl transition-all cursor-pointer shadow-2xs group"
              >
                <LockKeyhole className="w-4 h-4 text-slate-600" />
                <span className="text-base font-bold tracking-tight">{activeBoard?.name || 'Adhivasindo'}</span>
                <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-slate-700 transition-colors" />
              </button>

              {/* Board Switcher Dropdown Menu */}
              {showBoardDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowBoardDropdown(false)}
                  />
                  <div className="absolute top-11 left-0 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-150">
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
                            className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              isActive
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
            <div className="flex items-center gap-3">
              <AvatarStack users={users} maxCount={4} size="md" />

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                <span>Invite</span>
              </button>
            </div>
          </div>

          {/* Right Section: Filter, Export/Import, Search Input */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Filter Button */}
            <button
              onClick={onOpenFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {/* Export / Import Button */}
            <button
              onClick={() => setShowExportImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Export / Import</span>
            </button>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 min-w-[160px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, assignees..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white text-slate-800 text-xs rounded-xl outline-none transition-all placeholder:text-slate-400"
              />
            </div>
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
