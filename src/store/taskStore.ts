import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BoardColumn, Task, TaskLabel, User } from '../types/task';
import { INITIAL_COLUMNS, INITIAL_TASKS } from '../data/mockTasks';
import { MOCK_USERS } from '../data/mockUsers';

export type ToastType = 'success' | 'info' | 'danger';

export interface ToastInfo {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

export interface BoardItem {
  id: string;
  name: string;
}

interface TaskState {
  boards: BoardItem[];
  activeBoardId: string;
  columns: BoardColumn[];
  tasks: Record<string, Task>;
  users: User[];
  searchQuery: string;
  selectedLabelFilter: TaskLabel | 'All';
  selectedAssigneeFilter: string | 'All';
  selectedDueDateFilter: string | 'All';
  selectedTask: Task | null;
  isModalOpen: boolean;
  activeColumnForNewTask: string | null;
  toast: ToastInfo | null;

  // Actions
  setActiveBoard: (boardId: string) => void;
  createBoard: (name: string) => void;
  setSearchQuery: (query: string) => void;
  setLabelFilter: (label: TaskLabel | 'All') => void;
  setAssigneeFilter: (userId: string | 'All') => void;
  setDueDateFilter: (dueDate: string | 'All') => void;
  resetFilters: () => void;
  setSelectedTask: (task: Task | null) => void;
  openCreateModal: (columnId?: string) => void;
  openEditModal: (task: Task) => void;
  closeModal: () => void;
  showToast: (message: string, type?: ToastType, title?: string) => void;
  hideToast: () => void;

  createTask: (taskData: Omit<Task, 'id'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, sourceColId: string, destColId: string, newIndex: number) => void;

  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addColumn: (title: string) => void;
  renameColumn: (columnId: string, newTitle: string) => void;
  deleteColumn: (columnId: string) => void;
  moveColumn: (columnId: string, direction: 'left' | 'right') => void;
}

const DEFAULT_BOARDS: BoardItem[] = [
  { id: 'board-1', name: 'Adhivasindo' },
  { id: 'board-2', name: 'SCRUM Sprint 17' },
  { id: 'board-3', name: 'Adhivasindo Mobile App' },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      boards: DEFAULT_BOARDS,
      activeBoardId: 'board-1',
      columns: INITIAL_COLUMNS,
      tasks: INITIAL_TASKS,
      users: MOCK_USERS,
      searchQuery: '',
      selectedLabelFilter: 'All',
      selectedAssigneeFilter: 'All',
      selectedDueDateFilter: 'All',
      selectedTask: null,
      isModalOpen: false,
      activeColumnForNewTask: null,
      toast: null,

      setActiveBoard: (boardId) => {
        set((state) => {
          const board = state.boards.find((b) => b.id === boardId);
          if (!board) return state;
          return {
            activeBoardId: boardId,
            toast: {
              id: `toast-${Date.now()}`,
              title: 'Pindah Board',
              message: `Sekarang melihat papan "${board.name}".`,
              type: 'info',
            },
          };
        });
      },

      createBoard: (name) => {
        const newBoardId = `board-${Date.now()}`;
        const newBoard: BoardItem = { id: newBoardId, name };
        set((state) => ({
          boards: [...state.boards, newBoard],
          activeBoardId: newBoardId,
          toast: {
            id: `toast-${Date.now()}`,
            title: 'Board Dibuat',
            message: `Papan baru "${name}" berhasil ditambahkan.`,
            type: 'success',
          },
        }));
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setLabelFilter: (label) => set({ selectedLabelFilter: label }),
      setAssigneeFilter: (userId) => set({ selectedAssigneeFilter: userId }),
      setDueDateFilter: (dueDate) => set({ selectedDueDateFilter: dueDate }),
      resetFilters: () =>
        set({
          searchQuery: '',
          selectedLabelFilter: 'All',
          selectedAssigneeFilter: 'All',
          selectedDueDateFilter: 'All',
        }),
      setSelectedTask: (task) => set({ selectedTask: task }),

      showToast: (message, type = 'info', title) => {
        const defaultTitle =
          type === 'success'
            ? 'Berhasil'
            : type === 'danger'
              ? 'Dihapus'
              : 'Pemberitahuan';
        set({
          toast: {
            id: `toast-${Date.now()}`,
            title: title || defaultTitle,
            message,
            type,
          },
        });
      },

      hideToast: () => set({ toast: null }),

      openCreateModal: (columnId = 'todo') =>
        set({
          selectedTask: null,
          activeColumnForNewTask: columnId,
          isModalOpen: true,
        }),

      openEditModal: (task) =>
        set({
          selectedTask: task,
          activeColumnForNewTask: task.columnId,
          isModalOpen: true,
        }),

      closeModal: () =>
        set({
          selectedTask: null,
          isModalOpen: false,
          activeColumnForNewTask: null,
        }),

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
            col.id === newTask.columnId ? { ...col, taskIds: [...col.taskIds, newId] } : col
          );

          return {
            tasks: { ...state.tasks, [newId]: newTask },
            columns: updatedColumns,
            toast: {
              id: `toast-${Date.now()}`,
              title: 'Task Berhasil Dibuat',
              message: `Tugas "${newTask.title}" telah ditambahkan ke papan.`,
              type: 'success',
            },
          };
        });

        return newId;
      },

      updateTask: (id, updates) => {
        set((state) => {
          const existing = state.tasks[id];
          if (!existing) return state;

          const updatedTask = { ...existing, ...updates };

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
            toast: {
              id: `toast-${Date.now()}`,
              title: 'Task Diperbarui',
              message: `Perubahan pada "${updatedTask.title}" berhasil disimpan.`,
              type: 'info',
            },
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
            isModalOpen: state.selectedTask?.id === id ? false : state.isModalOpen,
            toast: {
              id: `toast-${Date.now()}`,
              title: 'Task Dihapus',
              message: `Tugas "${taskToDelete.title}" telah dihapus dari papan.`,
              type: 'danger',
            },
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

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;

          const updatedChecklist = task.checklist.filter((item) => item.id !== subtaskId);
          const updatedTask = { ...task, checklist: updatedChecklist };

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
            toast: {
              id: `toast-${Date.now()}`,
              title: 'Kolom Dibuat',
              message: `Daftar kolom baru "${title}" berhasil ditambahkan.`,
              type: 'success',
            },
          };
        });
      },

      renameColumn: (columnId, newTitle) => {
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === columnId ? { ...col, title: newTitle } : col
          ),
          toast: {
            id: `toast-${Date.now()}`,
            title: 'Kolom Diubah',
            message: `Nama kolom telah diubah menjadi "${newTitle}".`,
            type: 'info',
          },
        }));
      },

      deleteColumn: (columnId) => {
        set((state) => {
          const colToDelete = state.columns.find((c) => c.id === columnId);
          if (!colToDelete) return state;

          // Delete all tasks in column
          const newTasks = { ...state.tasks };
          colToDelete.taskIds.forEach((tId) => delete newTasks[tId]);

          return {
            columns: state.columns.filter((c) => c.id !== columnId),
            tasks: newTasks,
            toast: {
              id: `toast-${Date.now()}`,
              title: 'Kolom Dihapus',
              message: `Kolom "${colToDelete.title}" beserta tugasnya telah dihapus.`,
              type: 'danger',
            },
          };
        });
      },

      moveColumn: (columnId, direction) => {
        set((state) => {
          const index = state.columns.findIndex((c) => c.id === columnId);
          if (index === -1) return state;

          const newIndex = direction === 'left' ? index - 1 : index + 1;
          if (newIndex < 0 || newIndex >= state.columns.length) return state;

          const newColumns = [...state.columns];
          const [movedCol] = newColumns.splice(index, 1);
          newColumns.splice(newIndex, 0, movedCol);

          return {
            columns: newColumns,
            toast: {
              id: `toast-${Date.now()}`,
              title: 'Kolom Dipindahkan',
              message: `Kolom "${movedCol.title}" dipindahkan ke ${direction === 'left' ? 'kiri' : 'kanan'}.`,
              type: 'info',
            },
          };
        });
      },
    }),
    {
      name: 'adhivasindo-task-board-storage',
      partialize: (state) => ({
        boards: state.boards,
        activeBoardId: state.activeBoardId,
        columns: state.columns,
        tasks: state.tasks,
        users: state.users,
      }),
    }
  )
);
