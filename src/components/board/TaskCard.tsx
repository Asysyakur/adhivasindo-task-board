import React from 'react';
import { Task, User } from '../../types/task';
import { AvatarStack } from '../common/AvatarStack';
import { Timer  , CheckSquare, MessageSquare, Paperclip } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  users: User[];
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, users, onClick }) => {
  // Get assignee user objects
  const assignees = users.filter((u) => task.assigneeIds.includes(u.id));

  // Checklist calculations
  const totalSubtasks = task.checklist.length;
  const completedSubtasks = task.checklist.filter((item) => item.completed).length;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Label color styling mapping
  const getLabelStyle = (label: Task['label']) => {
    switch (label) {
      case 'Feature':
        return 'bg-blue-100 text-blue-700 border-blue-200 font-medium';
      case 'Bug':
        return 'bg-red-100 text-red-600 border-red-200 font-medium';
      case 'Issue':
        return 'bg-orange-100 text-orange-600 border-orange-200 font-medium';
      case 'Undefined':
      default:
        return 'bg-slate-100 text-slate-600 font-medium';
    }
  };

  return (
    <div
      onClick={onClick}
      className="task-card group relative bg-slate-100 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden mb-3 select-none"
    >
      {/* Cover Image */}
      {task.coverImage && (
        <div className="task-cover w-full p-2 h-36 overflow-hidden relative">
          <img
            src={task.coverImage}
            alt={task.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg"
          />
        </div>
      )}

      <div className="p-3.5 flex flex-col gap-2.5">
        {/* Label Badge */}
        <div className="flex items-center justify-between">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${getLabelStyle(
              task.label
            )}`}
          >
            {task.label}
          </span>
        </div>

        {/* Progress Bar (Checklist progress) */}
        {totalSubtasks > 0 && (
          <div className="w-full bg-blue-200 h-1 rounded-full overflow-hidden my-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Task Title */}
        <h4 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
          {task.title}
        </h4>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between pt-1 mt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-full font-medium">
                <Timer   className="w-3 h-3 text-sky-600" />
                <span>{task.dueDate}</span>
              </div>
            )}

            {/* Checklist Count */}
            {totalSubtasks > 0 && (
              <div
                className={`flex items-center gap-1 ${
                  progressPercent === 100 ? 'text-emerald-600 font-medium' : 'text-slate-500'
                }`}
                title="Subtasks"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}

            {/* Comments count */}
            {task.commentsCount !== undefined && task.commentsCount > 0 && (
              <div className="flex items-center gap-1 text-slate-500" title="Comments">
                <MessageSquare className="w-3 h-3" />
                <span>{task.commentsCount}</span>
              </div>
            )}

            {/* Attachments count */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-slate-500" title="Attachments">
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Assignees */}
          {assignees.length > 0 && (
            <div className="ml-auto">
              <AvatarStack users={assignees} size="sm" maxCount={3} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
