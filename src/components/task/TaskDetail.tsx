import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { TaskForm } from './TaskForm';

export const TaskDetail: React.FC = () => {
  const { isModalOpen, selectedTask, activeColumnForNewTask, closeModal } = useTaskStore();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={closeModal}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl">
        <TaskForm
          task={selectedTask}
          defaultColumnId={activeColumnForNewTask || 'todo'}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default TaskDetail;
