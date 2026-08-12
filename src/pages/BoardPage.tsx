import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { BoardHeader } from '../components/board/BoardHeader';
import { FilterBar } from '../components/common/FilterBar';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { TaskDetail } from '../components/task/TaskDetail';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types/task';

export const BoardPage: React.FC = () => {
  const [showFilterBar, setShowFilterBar] = useState(false);
  const { openEditModal, openCreateModal } = useTaskStore();

  const handleTaskClick = (task: Task) => {
    openEditModal(task);
  };

  const handleAddTaskClick = (columnId: string) => {
    openCreateModal(columnId);
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div className="adhivasindo-board-app flex flex-col h-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
          {/* Header */}
          <BoardHeader
            onOpenFilter={() => setShowFilterBar((prev) => !prev)}
            onOpenInvite={() => alert('Invite team members: Alex, Budi, Citra, David, Eka, Fajar')}
          />

          {/* Filter Bar (Collapsible / Toggleable) */}
          {showFilterBar && <FilterBar />}

          {/* Kanban Board Container */}
          <KanbanBoard onTaskClick={handleTaskClick} onAddTaskClick={handleAddTaskClick} />

          {/* Task Detail / Form Modal */}
          <TaskDetail />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BoardPage;
