import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { AvatarStack } from '../common/AvatarStack';
import { LockKeyhole, ChevronDown, UserPlus, Filter, ArrowUpDown, Search } from 'lucide-react';

interface BoardHeaderProps {
    onOpenFilter?: () => void;
    onOpenInvite?: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ onOpenFilter, onOpenInvite }) => {
    const { users, searchQuery, setSearchQuery } = useTaskStore();

    return (
        <header className="board-header bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-20 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 max-w-full">
                {/* Left & Middle Section: Board Title, Avatars & Invite */}
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Board Title Dropdown */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer">
                        <LockKeyhole className="w-4 h-4" />
                        <span className="text-lg font-semibold">Adhivasindo</span>
                        <ChevronDown className="w-4 h-4" />
                    </div>

                    {/* User Avatars & Invite Button */}
                    <div className="flex items-center gap-3">
                        <AvatarStack users={users} maxCount={4} size="md" />

                        <button
                            onClick={onOpenInvite}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Invite</span>
                        </button>
                    </div>
                </div>

                {/* Right Section: Filter, Export/Import, Search Input */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                    {/* Filter Button */}
                    <button
                        onClick={onOpenFilter}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filter</span>
                    </button>

                    {/* Export / Import Button */}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span>Export / Import</span>
                    </button>

                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64 min-w-[160px]">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3/4 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Tasks"
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-transparent focus:border-blue-400 focus:bg-white text-slate-800 text-xs rounded-lg outline-none transition-all placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};
