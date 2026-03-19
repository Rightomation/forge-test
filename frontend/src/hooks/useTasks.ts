import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/types";
import toast from "react-hot-toast";

export function useTasks(projectId?: string) {
  const {
    tasks,
    filter,
    sort,
    searchQuery,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    setFilter,
    setSort,
    setSearchQuery,
    getTasksByProject,
    isLoading,
  } = useTaskStore();

  const projectTasks = projectId ? getTasksByProject(projectId) : [];

  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const task = addTask(taskData);
    toast.success("Task created!");
    return task;
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
    toast.success("Task updated!");
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast.success("Task deleted");
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    toggleTask(id);
    if (task) {
      toast.success(task.completed ? "Task reopened" : "Task completed! 🎉", {
        duration: 2000,
      });
    }
  };

  return {
    tasks: projectTasks,
    filter,
    sort,
    searchQuery,
    isLoading,
    addTask: handleAddTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    toggleTask: handleToggleTask,
    setFilter,
    setSort,
    setSearchQuery,
  };
}
