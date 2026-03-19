import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { Project, LabelColor } from "@/types";
import toast from "react-hot-toast";

export function useProjects() {
  const { projects, selectedProjectId, addProject, updateProject, deleteProject, setSelectedProject } =
    useProjectStore();
  const { tasks } = useTaskStore();

  const projectsWithCount = projects.map((p) => ({
    ...p,
    taskCount: tasks.filter((t) => t.projectId === p.id && !t.completed).length,
  }));

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  const handleAddProject = (
    data: Omit<Project, "id" | "createdAt" | "userId">
  ) => {
    const project = addProject(data);
    toast.success(`Project "${project.name}" created!`);
    setSelectedProject(project.id);
    return project;
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    updateProject(id, updates);
    toast.success("Project updated!");
  };

  const handleDeleteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    deleteProject(id);
    toast.success(`Project "${project?.name}" deleted`);
  };

  return {
    projects: projectsWithCount,
    selectedProjectId,
    selectedProject,
    addProject: handleAddProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    setSelectedProject,
  };
}
