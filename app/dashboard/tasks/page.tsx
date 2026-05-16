"use client";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { SEED_TASKS } from "./types";
import type { Task, Status } from "./types";
import ViewSwitcher, { type ViewType } from "./views/ViewSwitcher";
import ListView from "./views/ListView";
import KanbanView from "./views/KanbanView";
import TableView from "./views/TableView";
import CalendarView from "./views/CalendarView";
import TimelineView from "./views/TimelineView";
import TaskDrawer from "./TaskDrawer";
import CreateTaskModal from "./CreateTaskModal";

import ModuleHeader from "../components/shared/ModuleHeader";
import SearchInput from "../components/shared/SearchInput";
import Button from "../components/ui/Button";
import Dropdown from "../components/ui/Dropdown";

type GroupBy = "status" | "priority" | "assignee";
const GROUP_OPTIONS = [
  { value: "status",   label: "Status"   },
  { value: "priority", label: "Priority" },
  { value: "assignee", label: "Assignee" },
];

export default function TasksPage() {
  const [tasks,        setTasks]        = useState<Task[]>(SEED_TASKS);
  const [view,         setView]         = useState<ViewType>("list");
  const [search,       setSearch]       = useState("");
  const [groupBy,      setGroupBy]      = useState<GroupBy>("status");
  const [activeTask,   setActiveTask]   = useState<Task | null>(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [createStatus, setCreateStatus] = useState<Status | undefined>();

  const nextId = `T-${String(tasks.length + 1).padStart(3, "0")}`;

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    setActiveTask(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setActiveTask(null);
  }

  function createTask(task: Task) {
    setTasks(prev => [...prev, task]);
  }

  function openCreate(status?: Status) {
    setCreateStatus(status);
    setShowCreate(true);
  }

  const filtered = useMemo(() => {
    if (!search) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.labels.some(l => l.toLowerCase().includes(q)) ||
      t.assignees.some(a => a.name.toLowerCase().includes(q))
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

      <div className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest">
        {view === "list" && (
          <ListView tasks={filtered} groupBy={groupBy} onTaskClick={setActiveTask} onAddTask={openCreate} search={search} />
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
