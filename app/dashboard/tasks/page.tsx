"use client";
import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import { createTask as createTaskRecord, deleteTask as deleteTaskRecord, listTasks, updateTask as updateTaskRecord } from "@/lib/client/services/task.service";
import type { Task, Status } from "@/features/tasks/types";
import ViewSwitcher, { type ViewType } from "@/features/tasks/views/ViewSwitcher";
import ListView from "@/features/tasks/views/ListView";
import KanbanView from "@/features/tasks/views/KanbanView";
import TableView from "@/features/tasks/views/TableView";
import CalendarView from "@/features/tasks/views/CalendarView";
import TimelineView from "@/features/tasks/views/TimelineView";
import TaskDrawer from "@/features/tasks/TaskDrawer";
import CreateTaskModal from "@/features/tasks/CreateTaskModal";

import ModuleHeader from "@/components/common/ModuleHeader";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";

type GroupBy = "status" | "priority" | "assignee";
const GROUP_OPTIONS = [
  { value: "status",   label: "Status"   },
  { value: "priority", label: "Priority" },
  { value: "assignee", label: "Assignee" },
];

export default function TasksPage() {
  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [view,         setView]         = useState<ViewType>("list");
  const [search,       setSearch]       = useState("");
  const [groupBy,      setGroupBy]      = useState<GroupBy>("status");
  const [activeTask,   setActiveTask]   = useState<Task | null>(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [createStatus, setCreateStatus] = useState<Status | undefined>();
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await listTasks<Task>();
        setTasks(data);
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const nextId = `T-${String(tasks.length + 1).padStart(3, "0")}`;

  async function updateTask(id: string, patch: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    setActiveTask(prev => prev?.id === id ? { ...prev, ...patch } : prev);
    
    const taskToUpdate = tasks.find(t => t.id === id);
    if (taskToUpdate?.recordId) {
      try {
        await updateTaskRecord<Task>(taskToUpdate.recordId, patch);
      } catch (err) {
        console.error("Failed to update task", err);
      }
    }
  }

  async function deleteTask(id: string) {
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    setActiveTask(null);

    if (taskToDelete?.recordId) {
      try {
        await deleteTaskRecord(taskToDelete.recordId);
      } catch (err) {
        console.error("Failed to delete task", err);
      }
    }
  }

  async function createTask(task: Task) {
    // Add optimistically first
    const optimisticTask = { ...task, id: task.id || `T-${Date.now()}` };
    setTasks(prev => [...prev, optimisticTask]);
    
    try {
      const saved = await createTaskRecord<Task>(task);
      // Replace optimistic with saved
      setTasks(prev => prev.map(t => t.id === optimisticTask.id ? saved : t));
    } catch (err) {
      console.error("Failed to create task", err);
      // Revert if failed
      setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
    }
  }

  function openCreate(status?: Status) {
    setCreateStatus(status);
    setShowCreate(true);
  }

  const filtered = useMemo(() => {
    if (!search) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) =>
      (t.title ?? "").toLowerCase().includes(q) ||
      (t.id ?? "").toLowerCase().includes(q) ||
      (t.labels ?? []).some((l) => l.toLowerCase().includes(q)) ||
      (t.assignees ?? []).some((a) => a.name.toLowerCase().includes(q))
    );
  }, [tasks, search]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface-container-low">

      <ModuleHeader 
        title="Tasks"
        count={tasks.length}
        rightContent={(
          <>
            <SearchInput 
              value={search} 
              onChange={setSearch} 
              placeholder="Search tasks, labels..." 
              width={200}
            />
            
            {view === "list" && (
              <Dropdown 
                label="Group"
                value={groupBy}
                options={GROUP_OPTIONS}
                onChange={(v) => setGroupBy(v as GroupBy)}
              />
            )}

            <ViewSwitcher active={view} onChange={setView} />

            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => openCreate()}
            >
              NEW TASK
            </Button>
          </>
        )}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest relative">

        {view === "list" && (
          <ListView tasks={filtered} groupBy={groupBy} onTaskClick={setActiveTask} onAddTask={openCreate} search={search} loading={loading} />
        )}
        {view === "kanban" && (
          <KanbanView tasks={filtered} onTaskClick={setActiveTask} onAddTask={openCreate} onStatusChange={(id, status) => updateTask(id, { status })} />
        )}
        {view === "table" && (
          <TableView tasks={filtered} onTaskClick={setActiveTask} onStatusChange={(id, status) => updateTask(id, { status })} />
        )}
        {view === "calendar" && (
          <CalendarView tasks={filtered} onTaskClick={setActiveTask} />
        )}
        {view === "timeline" && (
          <TimelineView tasks={filtered} onTaskClick={setActiveTask} />
        )}
      </div>

      {activeTask && (
        <TaskDrawer
          task={activeTask}
          allTasks={tasks}
          onClose={() => setActiveTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={createTask}
          nextId={nextId}
          defaultStatus={createStatus}
        />
      )}
    </div>
  );
}

