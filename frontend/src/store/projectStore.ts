import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project, LabelColor } from "@/types";
import { generateId } from "@/lib/utils";

interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  addProject: (project: Omit<Project, "id" | "createdAt" | "userId">) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setSelectedProject: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "project-1",
    name: "Personal",
    color: "indigo",
    description: "Personal tasks and goals",
    userId: "user-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "project-2",
    name: "Work",
    color: "teal",
    description: "Work-related tasks",
    userId: "user-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "project-3",
    name: "Learning",
    color: "violet",
    description: "Books, courses, and skills",
    userId: "user-1",
    createdAt: new Date().toISOString(),
  },
];

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: DEFAULT_PROJECTS,
      selectedProjectId: "project-1",
      isLoading: false,

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: generateId(),
          userId: "user-1",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject;
      },

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          selectedProjectId:
            state.selectedProjectId === id
              ? state.projects.find((p) => p.id !== id)?.id || null
              : state.selectedProjectId,
        })),

      setSelectedProject: (id) => set({ selectedProjectId: id }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "project-storage",
    }
  )
);
