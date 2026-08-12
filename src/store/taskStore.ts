import { create } from 'zustand';
import { BoardColumn, Task, TaskLabel, User } from '../types/task';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '../data/mockTasks';
import { MOCK_USERS } from '../data/mockUsers';

interface TaskState {
  columns: BoardColumn[];
  tasks: Record<string, Task>;
  users: User[];
  searchQuery: string;
  selectedLabelFilter: TaskLabel | 'All';
  selectedTask: Task | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setLabelFilter: (label: TaskLabel | 'All') => void;
  setSelectedTask: (task: Task | null) => void;

  createTask: (taskData: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, sourceColId: string, destColId: string, newIndex: number) => void;

  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addColumn: (title: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  columns: INITIAL_COLUMNS,
  tasks: INITIAL_TASKS,
  users: MOCK_USERS,
  searchQuery: '',
  selectedLabelFilter: 'All',
  selectedTask: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setLabelFilter: (label) => set({ selectedLabelFilter: label }),
  setSelectedTask: (task) => set({ selectedTask: task }),

  createTask: (taskData) => {
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id: newId,
    };

    set((state) => {
      const targetCol = state.columns.find((col) => col.id === newTask.columnId);
      if (!targetCol) return state;

      const updatedColumns = state.columns.map((col) =>
        col.id === newTask.columnId
          ? { ...col, taskIds: [...col.taskIds, newId] }
          : col
      );

      return {
        tasks: { ...state.tasks, [newId]: newTask },
        columns: updatedColumns,
      };
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const existing = state.tasks[id];
      if (!existing) return state;

      const updatedTask = { ...existing, ...updates };

      // Handle column move if columnId changed in update
      let updatedColumns = state.columns;
      if (updates.columnId && updates.columnId !== existing.columnId) {
        updatedColumns = state.columns.map((col) => {
          if (col.id === existing.columnId) {
            return { ...col, taskIds: col.taskIds.filter((tId) => tId !== id) };
          }
          if (col.id === updates.columnId) {
            return { ...col, taskIds: [...col.taskIds, id] };
          }
          return col;
        });
      }

      return {
        tasks: { ...state.tasks, [id]: updatedTask },
        columns: updatedColumns,
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
      };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const taskToDelete = state.tasks[id];
      if (!taskToDelete) return state;

      const newTasks = { ...state.tasks };
      delete newTasks[id];

      const updatedColumns = state.columns.map((col) => ({
        ...col,
        taskIds: col.taskIds.filter((tId) => tId !== id),
      }));

      return {
        tasks: newTasks,
        columns: updatedColumns,
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
      };
    });
  },

  moveTask: (taskId, sourceColId, destColId, newIndex) => {
    set((state) => {
      const sourceCol = state.columns.find((c) => c.id === sourceColId);
      const destCol = state.columns.find((c) => c.id === destColId);

      if (!sourceCol || !destCol) return state;

      let newColumns = [...state.columns];

      if (sourceColId === destColId) {
        const newTaskIds = Array.from(sourceCol.taskIds);
        const currentIndex = newTaskIds.indexOf(taskId);
        if (currentIndex > -1) {
          newTaskIds.splice(currentIndex, 1);
          newTaskIds.splice(newIndex, 0, taskId);
        }

        newColumns = newColumns.map((col) =>
          col.id === sourceColId ? { ...col, taskIds: newTaskIds } : col
        );
      } else {
        const sourceTaskIds = sourceCol.taskIds.filter((id) => id !== taskId);
        const destTaskIds = Array.from(destCol.taskIds);
        destTaskIds.splice(newIndex, 0, taskId);

        newColumns = newColumns.map((col) => {
          if (col.id === sourceColId) return { ...col, taskIds: sourceTaskIds };
          if (col.id === destColId) return { ...col, taskIds: destTaskIds };
          return col;
        });
      }

      const updatedTask = state.tasks[taskId]
        ? { ...state.tasks[taskId], columnId: destColId }
        : null;

      return {
        columns: newColumns,
        tasks: updatedTask ? { ...state.tasks, [taskId]: updatedTask } : state.tasks,
      };
    });
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;

      const updatedChecklist = task.checklist.map((item) =>
        item.id === subtaskId ? { ...item, completed: !item.completed } : item
      );

      const updatedTask = { ...task, checklist: updatedChecklist };

      return {
        tasks: { ...state.tasks, [taskId]: updatedTask },
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
      };
    });
  },

  addSubtask: (taskId, title) => {
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;

      const newItem = {
        id: `chk-${Date.now()}`,
        title,
        completed: false,
      };

      const updatedTask = {
        ...task,
        checklist: [...task.checklist, newItem],
      };

      return {
        tasks: { ...state.tasks, [taskId]: updatedTask },
        selectedTask: state.selectedTask?.id === taskId ? updatedTask : state.selectedTask,
      };
    });
  },

  addColumn: (title) => {
    set((state) => {
      const newColId = `col-${Date.now()}`;
      const newCol: BoardColumn = {
        id: newColId,
        title,
        taskIds: [],
      };
      return {
        columns: [...state.columns, newCol],
      };
    });
  },
}));
