import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/server/auth-utils";

function getChecklistProgress(checklist?: Array<{ done: boolean }>) {
  if (!checklist || checklist.length === 0) return { done: 0, total: 0, progress: 0 };
  const done = checklist.filter((c) => c.done).length;
  const total = checklist.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, progress };
}

function toShortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

const ICON_MAP: Record<string, string> = {
  Created: "add_circle",
  Updated: "edit",
  Deleted: "delete",
};

export async function getDashboardSummary() {
  const ctx = await requireTenant();

  const [org, taskRecords, flowRecords, saleRecords, activityRecords, members, contentRecords] = await Promise.all([
    // Use organization (correct model name)
    prisma.organization.findUnique({
      where: { id: ctx.tenantId },
      select: { name: true },
    }),
    prisma.task.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.flow.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.sale.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.tenantActivity.findMany({
      where: { organizationId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.member.findMany({
      where: { organizationId: ctx.tenantId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.contentPost.findMany({
      where: { organizationId: ctx.tenantId },
      orderBy: { createdAt: "desc" }
    }),
  ]);

  const tasks = taskRecords.map((r: any) => ({ ...r, ...(r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {}) }));
  const flows = flowRecords.map((r: any) => ({ ...r, ...(r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {}) }));
  const sales = saleRecords.map((r: any) => ({ ...r, ...(r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {}) }));

  // ── Active tasks (top 5) ────────────────────────────────────────────────
  const activeTasks = tasks.slice(0, 5).map((task: any) => {
    const checklist = getChecklistProgress(task.checklist as Array<{ done: boolean }> | undefined);
    const allAssignees = Array.isArray(task.assignees) ? task.assignees : [];
    const firstAssignee = allAssignees[0] ?? null;
    return {
      id: task.id ?? task.recordId,
      title: task.title ?? "Untitled",
      priority: task.priority ?? "medium",
      status: task.status ?? "Todo",
      assignee: firstAssignee?.initials ?? (firstAssignee?.name ? toShortName(firstAssignee.name) : "--"),
      assignees: allAssignees.map((a: any) => ({
        id: a.id ?? "",
        name: a.name ?? "",
        initials: a.initials ?? toShortName(a.name ?? "?"),
      })),
      due: task.due ?? null,
      labels: Array.isArray(task.labels) ? task.labels : [],
      checklist: { done: checklist.done, total: checklist.total },
      progress: checklist.progress,
    };
  });

  // ── Hero stats ──────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const activeTaskCount = tasks.filter((t: any) => t.status !== "Done" && t.status !== "Cancelled").length;
  const dueTodayCount = tasks.filter((t: any) => {
    if (!t.due) return false;
    return String(t.due).slice(0, 10) === todayStr && t.status !== "Done";
  }).length;
  const openDealsCount = sales.filter((s: any) => s.status !== "Won" && s.status !== "Lost").length;

  // ── Recent activity feed ────────────────────────────────────────────────
  const recentActivity = activityRecords.map((log: any) => ({
    id: log.id,
    icon: ICON_MAP[log.action] ?? "timeline",
    user: log.user?.name ?? log.user?.email ?? "System",
    action: log.action.toLowerCase(),
    target: log.entityName ?? log.entityType ?? "Record",
    time: log.createdAt.toISOString(),
  }));

  // ── Productivity bars (tasks completed per weekday) ─────────────────────
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  const bars = weekDays.map((day, idx) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + idx);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    const count = taskRecords.filter((r: any) => {
      const payloadObj = r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {};
      const s = r.status || payloadObj.status;
      return s === "Done" && r.updatedAt >= dayStart && r.updatedAt < dayEnd;
    }).length;
    return { day, tasks: count };
  });

  const totalTasks = taskRecords.length;
  const doneTasks = tasks.filter((t: any) => t.status === "Done").length;
  const blockedTasks = tasks.filter((t: any) => t.status === "Blocked" || t.status === "In Review").length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const productivityMetrics = [
    { label: "Tasks completed", value: String(doneTasks), delta: `+${doneTasks}`, up: true },
    { label: "Completion rate", value: totalTasks > 0 ? `${completionRate}%` : "--", delta: "0", up: true },
    { label: "Blocked tasks", value: String(blockedTasks), delta: "0", up: blockedTasks === 0 },
    { label: "Active tasks", value: String(activeTaskCount), delta: "0", up: true },
  ];

  // ── Team performance ────────────────────────────────────────────────────
  const teamMembers = members.map((m: any) => {
    const name = m.user.name ?? m.user.email ?? "Member";
    const assigned = tasks.filter((t: any) => Array.isArray(t.assignees) && t.assignees.some((a: any) => a.id === m.userId));
    const doneCount = assigned.filter((t: any) => t.status === "Done").length;
    const load = assigned.length ? Math.round((doneCount / assigned.length) * 100) : 0;
    return {
      name,
      role: m.role === "owner" ? "Owner" : m.role === "admin" ? "Admin" : "Staff",
      tasks: assigned.length,
      done: doneCount,
      initials: toShortName(name),
      load,
    };
  });

  // ── Workflow boards ─────────────────────────────────────────────────────
  const workflowBoards = flows.map((flow: any) => {
    const stages = Array.isArray(flow.stages) ? flow.stages : [];
    const completed = stages.filter((s: any) => s.isCompleted).length;
    const total = stages.length || 1;
    return {
      id: flow.id ?? flow.recordId,
      name: flow.name ?? "Flow",
      columns: [
        { name: "Completed", count: completed },
        { name: "Remaining", count: Math.max(0, total - completed) },
      ],
      total,
    };
  });

  // ── Sales pipeline ──────────────────────────────────────────────────────
  const pipelineStages = ["Pending", "Processing", "Completed", "Cancelled"].map((label, index) => {
    const count = sales.filter((s: any) => s.status === label || s.stage === label).length;
    const value = sales
      .filter((s: any) => s.status === label || s.stage === label)
      .reduce((acc: any, s: any) => acc + (Number(s.value) || 0), 0);
    const pct = sales.length ? Math.round((count / sales.length) * 100) : 0;
    return { label, count, value, pct, colorIndex: index };
  });

  const recentDeals = sales.slice(0, 2).map((sale: any) => ({
    name: sale.title ?? sale.contactName ?? sale.name ?? "Deal",
    stage: sale.status ?? "Pending",
    value: sale.total ? `$${Number(sale.total).toLocaleString()}` : "$0",
    ago: "Updated",
  }));

  // ── Calendar (Content Planner) ──────────────────────────────────────────
  const contents = contentRecords.map((r: any) => ({ ...r, ...(r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {}) }));

  const calendarEvents = contents
    .filter((c: any) => {
      const dateStr = c.date || c.postDate || c.publishDate || (c.createdAt ? String(c.createdAt) : "");
      return dateStr && String(dateStr).slice(0, 10) === todayStr;
    })
    .map((c: any) => ({
      title: c.title ?? c.name ?? "Content Post",
      type: "event",
      time: c.time ?? "Today",
    }))
    .slice(0, 5);
  const performanceMetrics = [
    {
      label: "Tasks Completed",
      value: String(doneTasks),
      suffix: "",
      delta: String(doneTasks),
      icon: "task_alt",
      trend: bars.map((b) => b.tasks),
    },
    {
      label: "Active Flows",
      value: String(flows.length),
      suffix: "",
      delta: String(flows.length),
      icon: "bolt",
      trend: [0, 0, 0, 0, 0, 0, flows.length],
    },
    {
      label: "Team Members",
      value: String(members.length),
      suffix: "",
      delta: String(members.length),
      icon: "group",
      trend: [0, 0, 0, 0, 0, 0, members.length],
    },
    {
      label: "Open Deals",
      value: String(openDealsCount),
      suffix: "",
      delta: String(openDealsCount),
      icon: "shopping_cart",
      trend: [0, 0, 0, 0, 0, 0, openDealsCount],
    },
  ];

  return {
    tenantName: org?.name ?? "Your Workspace",
    heroStats: {
      activeTasks: activeTaskCount,
      dueToday: dueTodayCount,
      openDeals: openDealsCount,
      totalMembers: members.length,
    },
    activeTasks: { items: activeTasks, total: taskRecords.length },
    recentActivity: { items: recentActivity },
    productivity: { bars, metrics: productivityMetrics },
    teamPerformance: {
      members: teamMembers,
      summary: {
        membersCount: teamMembers.length,
        tasksCount: taskRecords.length,
        donePct: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
      },
    },
    workflowProgress: { boards: workflowBoards },
    salesOverview: { stages: pipelineStages, recentDeals },
    calendar: { events: calendarEvents },
    performance: { metrics: performanceMetrics },
  };
}
