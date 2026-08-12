import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { BoardHeader } from '../components/board/BoardHeader';
import { FilterBar } from '../components/common/FilterBar';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types/task';

export const BoardPage: React.FC = () => {
  const [showFilterBar, setShowFilterBar] = useState(false);
  const { setSelectedTask } = useTaskStore();

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleAddTaskClick = (columnId: string) => {
    const title = prompt('Enter new task title:');
    if (title && title.trim()) {
      useTaskStore.getState().createTask({
        columnId,
        title: title.trim(),
        description: '',
        label: 'Feature',
        priority: 'Medium',
        dueDate: 'Today',
        assigneeIds: ['user-1'],
        checklist: [],
        attachments: [],
        commentsCount: 0,
      });
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div className="adhivasindo-board-app flex flex-col h-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
          {/* Header */}
          <BoardHeader
            onOpenFilter={() => setShowFilterBar((prev) => !prev)}
            onOpenInvite={() => alert('Invite team members feature')}
          />

          {/* Filter Bar (Collapsible / Toggleable) */}
          {showFilterBar && <FilterBar />}

          {/* Kanban Board Container */}
          <KanbanBoard onTaskClick={handleTaskClick} onAddTaskClick={handleAddTaskClick} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BoardPage;
