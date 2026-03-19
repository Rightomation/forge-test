export type Priority = "high" | "medium" | "low";

export type LabelColor =
  | "indigo"
  | "violet"
  | "pink"
  | "rose"
  | "orange"
  | "teal"
  | "sky"
  | "lime";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  color: LabelColor;
  description?: string;
  userId: string;
  createdAt: string;
  taskCount?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  projectId: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type FilterType = "all" | "active" | "completed";
export type SortType = "dueDate" | "priority" | "createdAt" | "title";
