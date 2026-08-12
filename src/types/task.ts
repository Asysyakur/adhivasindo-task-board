export type TaskLabel = 'Feature' | 'Bug' | 'Issue' | 'Undefined';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeIds: string[];
  dueDate: string; // e.g., "8 Aug", "12 Aug", "2026-08-20"
  label: TaskLabel;
  priority?: TaskPriority;
  checklist: ChecklistItem[];
  attachments: Attachment[];
  coverImage?: string;
  columnId: string;
  boardName?: string;
  commentsCount?: number;
}

export interface BoardColumn {
  id: string;
  title: string;
  taskIds: string[];
}