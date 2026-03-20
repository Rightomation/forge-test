"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  FolderKanban,
  LayoutList,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { cn, formatDate, LABEL_COLORS, PRIORITY_CONFIG } from "@/lib/utils";
import { FilterType, LabelColor, Priority, SortType } from "@/types";

const COLORS = Object.keys(LABEL_COLORS) as LabelColor[];

export function TodoApp() {
  const {
    projects,
    selectedProjectId,
    selectedProject,
    addProject,
    deleteProject,
    setSelectedProject,
  } = useProjects();

  const {
    tasks,
    filter,
    sort,
    searchQuery,
    setFilter,
    setSort,
    setSearchQuery,
    addTask,
    toggleTask,
    deleteTask,
  } = useTasks(selectedProjectId ?? undefined);

  const [projectOpen, setProjectOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [pColor, setPColor] = useState<LabelColor>("indigo");
  const [tTitle, setTTitle] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tPriority, setTPriority] = useState<Priority>("medium");
  const [tDue, setTDue] = useState("");

  const resetProjectForm = () => {
    setPName("");
    setPColor("indigo");
  };

  const resetTaskForm = () => {
    setTTitle("");
    setTDesc("");
    setTPriority("medium");
    setTDue("");
  };

  const onAddProject = (e: FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    addProject({
      name: pName.trim(),
      color: pColor,
      description: "",
    });
    setProjectOpen(false);
    resetProjectForm();
  };

  const onAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!tTitle.trim() || !selectedProjectId) return;
    addTask({
      title: tTitle.trim(),
      description: tDesc.trim() || undefined,
      completed: false,
      priority: tPriority,
      dueDate: tDue ? new Date(tDue).toISOString() : undefined,
      projectId: selectedProjectId,
    });
    setTaskOpen(false);
    resetTaskForm();
  };

  const header = useMemo(
    () => selectedProject?.name ?? "Select a project",
    [selectedProject]
  );

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-4">
          <LayoutList className="h-6 w-6 text-primary-600" />
          <span className="font-semibold tracking-tight text-slate-800">
            Todo Projects
          </span>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {projects.map((p) => {
            const active = p.id === selectedProjectId;
            const dot = LABEL_COLORS[p.color].hex;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProject(p.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-primary-50 text-primary-800"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: dot }}
                />
                <span className="flex-1 truncate font-medium">{p.name}</span>
                <span className="text-xs text-slate-400">{p.taskCount}</span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-slate-100 p-2">
          <Dialog.Root open={projectOpen} onOpenChange={setProjectOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-2 text-sm font-medium text-primary-600 hover:border-primary-300 hover:bg-primary-50/50"
              >
                <Plus className="h-4 w-4" />
                New project
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px]" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    New project
                  </Dialog.Title>
                  <Dialog.Close
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>
                <form onSubmit={onAddProject} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Name
                    </label>
                    <input
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-primary-500 focus:ring-2"
                      placeholder="e.g. Marketing"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Color
                    </label>
                    <select
                      value={pColor}
                      onChange={(e) => setPColor(e.target.value as LabelColor)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {COLORS.map((c) => (
                        <option key={c} value={c}>
                          {LABEL_COLORS[c].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                  >
                    Create
                  </button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-6 py-4 shadow-xs">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FolderKanban className="h-5 w-5 shrink-0 text-slate-400" />
            <h1 className="truncate text-xl font-semibold text-slate-900">
              {header}
            </h1>
          </div>
          {selectedProject && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(`Delete project “${selectedProject.name}”?`)
                ) {
                  deleteProject(selectedProject.id);
                }
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </header>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-6 py-3">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Done</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="createdAt">Newest</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
          <Dialog.Root open={taskOpen} onOpenChange={setTaskOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                disabled={!selectedProjectId}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add task
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px]" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100%,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    New task
                  </Dialog.Title>
                  <Dialog.Close
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>
                <form onSubmit={onAddTask} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Title
                    </label>
                    <input
                      required
                      value={tTitle}
                      onChange={(e) => setTTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Description
                    </label>
                    <textarea
                      value={tDesc}
                      onChange={(e) => setTDesc(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Priority
                      </label>
                      <select
                        value={tPriority}
                        onChange={(e) =>
                          setTPriority(e.target.value as Priority)
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Due
                      </label>
                      <input
                        type="date"
                        value={tDue}
                        onChange={(e) => setTDue(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Save task
                  </button>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-6">
          {!selectedProjectId ? (
            <p className="text-center text-sm text-slate-500">
              Choose a project or create one.
            </p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              No tasks match your filters.
            </p>
          ) : (
            tasks.map((task) => {
              const pr = PRIORITY_CONFIG[task.priority];
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xs transition-shadow hover:shadow-sm",
                    task.completed ? "border-slate-100 opacity-70" : "border-slate-200"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-[10px] font-bold text-white",
                      task.completed
                        ? "border-primary-600 bg-primary-600"
                        : "border-slate-300 bg-white"
                    )}
                    aria-label={task.completed ? "Mark incomplete" : "Complete"}
                  >
                    {task.completed ? "✓" : ""}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "font-medium text-slate-900",
                          task.completed && "line-through"
                        )}
                      >
                        {task.title}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          color: pr.color,
                          backgroundColor: pr.bg,
                          border: `1px solid ${pr.border}`,
                        }}
                      >
                        {pr.label}
                      </span>
                    </div>
                    {task.description ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {task.description}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      {task.dueDate ? (
                        <span>Due {formatDate(task.dueDate)}</span>
                      ) : null}
                      {task.assignee ? <span>{task.assignee}</span> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
