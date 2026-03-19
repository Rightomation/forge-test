import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task, Priority, FilterType, SortType } from "@/types";
import { generateId } from "@/lib/utils";

interface TaskStore {
  tasks: Task[];
  filter: FilterType;
  sort: SortType;
  searchQuery: string;
  isLoading: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSort: (sort: SortType) => void;
  setSearchQuery: (query: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  setLoading: (loading: boolean) => void;
}

const DEFAULT_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Design the new landing page",
    description: "Create wireframes and high-fidelity mockups for the new marketing site",
    completed: false,
    priority: "high",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: "project-2",
    assignee: "Alice Johnson",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Read Atomic Habits",
    description: "Finish chapters 10-15 and take notes",
    completed: false,
    priority: "medium",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: "project-3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Grocery shopping",
    description: "Milk, eggs, bread, vegetables",
    completed: true,
    priority: "low",
    projectId: "project-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Fix authentication bug",
    description: "JWT token not refreshing properly on session expiry",
    completed: false,
    priority: "high",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: "project-2",
    assignee: "Bob Smith",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Plan weekend trip",
    description: "Research hotels and activities for the hiking trip",
    completed: false,
    priority: "low",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: "project-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-6",
    title: "Complete TypeScript course",
    description: "Finish advanced TypeScript patterns module",
    completed: false,
    priority: "medium",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: "project-3",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: DEFAULT_TASKS,
      filter: "all",
      sort: "createdAt",
      searchQuery: "",
      isLoading: false,

      addTask: (taskData) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
              : t
          ),
        })),

      setFilter: (filter) => set({ filter }),
      setSort: (sort) => set({ sort }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      getTasksByProject: (projectId) => {
        const { tasks, filter, sort, searchQuery } = get();
        let filtered = tasks.filter((t) => t.projectId === projectId);

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description?.toLowerCase().includes(q)
          );
        }

        if (filter === "active") filtered = filtered.filter((t) => !t.completed);
        if (filter === "completed") filtered = filtered.filter((t) => t.completed);

        filtered.sort((a, b) => {
          if (sort === "dueDate") {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          if (sort === "priority") {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
          }
          if (sort === "title") return a.title.localeCompare(b.title);
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return filtered;
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "task-storage",
    }
  )
);
