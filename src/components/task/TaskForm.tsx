import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskLabel, TaskPriority, ChecklistItem, Attachment } from '../../types/task';
import { useTaskStore } from '../../store/taskStore';
import { AttachmentList } from './AttachmentList';
import { Checklist } from './Checklist';
import { ConfirmModal } from '../common/ConfirmModal';
import { DatePicker } from '../common/DatePicker';
import {
  X,
  Check,
  ImagePlus as ImageIcon,
  Pencil,
  Calendar,
  Plus,
  Trash2,
  ChevronDown,
  Upload,
} from 'lucide-react';

interface TaskFormProps {
  task?: Task | null;
  defaultColumnId?: string;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
];

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  defaultColumnId = 'todo',
  onClose,
  onSaveSuccess,
}) => {
  const { columns, users, boards, activeBoardId, createTask, updateTask, deleteTask } = useTaskStore();

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];
  const isEditing = Boolean(task);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [columnId, setColumnId] = useState(task?.columnId || defaultColumnId);
  const [label, setLabel] = useState<TaskLabel>(task?.label || 'Feature');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assigneeIds || []);
  const [coverImage, setCoverImage] = useState<string | undefined>(task?.coverImage);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task?.checklist || []);
  const [attachments, setAttachments] = useState<Attachment[]>(task?.attachments || []);
  const [boardName, setBoardName] = useState(task?.boardName || activeBoard?.name || 'Adhivasindo');
  const [isMarkedComplete, setIsMarkedComplete] = useState(task?.columnId === 'done');
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setColumnId(task.columnId);
      setLabel(task.label);
      setPriority(task.priority || 'Medium');
      setDueDate(task.dueDate);
      setAssigneeIds(task.assigneeIds || []);
      setCoverImage(task.coverImage);
      setChecklist(task.checklist || []);
      setAttachments(task.attachments || []);
      setBoardName(task.boardName || activeBoard?.name || 'Adhivasindo');
      setIsMarkedComplete(task.columnId === 'done');
    }
  }, [task, activeBoard]);

  // Read cover image file from computer
  const handleCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCoverImage(e.target.result as string);
        setShowCoverPicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCoverFile(e.target.files[0]);
    }
  };

  const handleCoverDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(true);
  };

  const handleCoverDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(false);
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Mark Complete toggle
  const handleToggleComplete = () => {
    const nextComplete = !isMarkedComplete;
    setIsMarkedComplete(nextComplete);
    if (nextComplete) {
      setColumnId('done');
    } else if (columnId === 'done') {
      setColumnId('todo');
    }
  };

  // Toggle user assignee
  const handleToggleAssignee = (userId: string) => {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Checklist handlers
  const handleToggleCheckitem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddCheckitem = (itemTitle: string) => {
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      title: itemTitle,
      completed: false,
    };
    setChecklist((prev) => [...prev, newItem]);
  };

  const handleDeleteCheckitem = (itemId: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Attachment handlers
  const handleAddAttachment = (attachment: Attachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attId));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      columnId,
      label,
      priority,
      dueDate,
      assigneeIds,
      coverImage,
      checklist,
      attachments,
      boardName,
      commentsCount: task?.commentsCount || 0,
    };

    if (isEditing && task) {
      updateTask(task.id, payload);
    } else {
      createTask(payload);
    }

    onSaveSuccess?.();
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="task-form-container bg-white rounded-2xl max-w-2xl w-full mx-auto overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
      {/* Hidden Cover Image Input */}
      <input
        type="file"
        ref={coverFileInputRef}
        onChange={handleCoverFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <button
          type="button"
          onClick={handleToggleComplete}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            isMarkedComplete
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isMarkedComplete ? 'Completed' : 'Mark Complete'}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content Scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {/* Cover Image Area with Drag & Drop and Local Image Upload */}
        <div className="cover-image-section">
          {coverImage ? (
            <div
              onDragOver={handleCoverDragOver}
              onDragLeave={handleCoverDragLeave}
              onDrop={handleCoverDrop}
              className={`relative group rounded-xl overflow-hidden h-54 bg-slate-100 border-2 transition-all ${
                isCoverDragging ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCoverPicker((prev) => !prev)}
                  className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setCoverImage(undefined)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => coverFileInputRef.current?.click()}
              onDragOver={handleCoverDragOver}
              onDragLeave={handleCoverDragLeave}
              onDrop={handleCoverDrop}
              className={`h-54 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-blue-600 cursor-pointer transition-all ${
                isCoverDragging
                  ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                  : 'border-slate-200 hover:border-blue-600 hover:bg-blue-50/50'
              }`}
            >
              <ImageIcon
                className={`w-8 h-8 transition-transform ${
                  isCoverDragging ? 'text-blue-600 scale-125' : 'text-slate-400'
                }`}
              />
              <span className="text-xs font-semibold text-slate-600">
                {isCoverDragging ? (
                  <span className="text-blue-600">Drop image here for cover</span>
                ) : (
                  <>
                    <span className="text-blue-600 font-semibold underline">Click to upload cover image</span> or drag & drop image file
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCoverPicker((prev) => !prev);
                }}
                className="mt-1 text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Or choose from presets
              </button>
            </div>
          )}

          {/* Preset Cover Selector */}
          {showCoverPicker && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600">Select preset or upload image:</p>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload local image</span>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COVERS.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCoverImage(url);
                      setShowCoverPicker(false);
                    }}
                    className="h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-600 cursor-pointer"
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Task Title Input */}
        <div className="flex items-center gap-2 border-b border-transparent focus-within:border-blue-400 pb-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="CRUD Employe / Task Title"
            className="w-full text-2xl font-semibold text-slate-900 bg-transparent outline-none placeholder:text-slate-400"
          />
          <Pencil className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Fields Grid (2 Columns matching reference screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
          {/* Assignee Field */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-slate-600 tracking-tight">Assignee</label>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden items-center">
                {assigneeIds.map((uId) => {
                  const u = users.find((usr) => usr.id === uId);
                  if (!u) return null;
                  return (
                    <img
                      key={u.id}
                      src={u.avatar}
                      alt={u.name}
                      title={u.name}
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                  );
                })}
              </div>

              {assigneeIds.length === 0 && (
                <span className="text-xs text-slate-400 font-medium italic">Unassigned</span>
              )}

              <button
                type="button"
                onClick={() => setShowAssigneePicker((prev) => !prev)}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Add Assignee"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Assignee Popover */}
            {showAssigneePicker && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowAssigneePicker(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 p-2.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-700">Assign Team Members</p>
                    <button
                      type="button"
                      onClick={() => setShowAssigneePicker(false)}
                      className="p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {users.map((u) => {
                      const isAssigned = assigneeIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => handleToggleAssignee(u.id)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isAssigned ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                            <span>{u.name}</span>
                          </div>
                          {isAssigned && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Due Date Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 tracking-tight">Due Date</label>
            <DatePicker
              value={dueDate}
              onChange={(dStr) => setDueDate(dStr)}
              placeholder="Select due date..."
            />
          </div>

          {/* Board Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 tracking-tight">Board</label>
            <div className="relative ">
              <select
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="w-full appearance-none bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none cursor-pointer pr-8"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2/3 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Column Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 tracking-tight">Column</label>
            <div className="relative">
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full appearance-none bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none cursor-pointer pr-8"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2/3 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Label Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 tracking-tight">Label</label>
            <div className="relative">
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value as TaskLabel)}
                className="w-full appearance-none bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none cursor-pointer pr-8"
              >
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Issue">Issue</option>
                <option value="Undefined">Undefined</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2/3 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Priority Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 tracking-tight">Priority</label>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full appearance-none bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none cursor-pointer pr-8"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2/3 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Description</h3>
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add detailed task description..."
            className="w-full p-3 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-400 transition-all resize-none"
          />
        </div>

        {/* Attachments Section with DnD support */}
        <AttachmentList
          attachments={attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
        />

        {/* Check List Section */}
        <Checklist
          items={checklist}
          onToggleItem={handleToggleCheckitem}
          onAddItem={handleAddCheckitem}
          onDeleteItem={handleDeleteCheckitem}
        />

        {/* Activity Placeholder Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Activity</h3>
          <p className="text-xs text-slate-400 italic">No recent activity recorded.</p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Task</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </form>

      {/* Delete Task Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Task?"
        message={`Are you sure you want to delete task "${title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (task) {
            deleteTask(task.id);
            onClose();
          }
        }}
      />
    </div>
  );
};
