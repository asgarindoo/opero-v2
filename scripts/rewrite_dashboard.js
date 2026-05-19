const fs = require('fs');
const file = 'app/api/tenant/dashboard/summary/route.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace prisma.tenantRecord
code = code.replace(
  /prisma\.tenantRecord\.findMany\(\{\s*where: \{\s*organizationId: ctx\.tenantId,\s*type: "tasks"\s*\},\s*orderBy: \{\s*updatedAt: "desc"\s*\},?\s*\}\)/g,
  'prisma.task.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { updatedAt: "desc" } })'
);

code = code.replace(
  /prisma\.tenantRecord\.findMany\(\{\s*where: \{\s*organizationId: ctx\.tenantId,\s*type: "flows"\s*\},\s*orderBy: \{\s*updatedAt: "desc"\s*\},?\s*\}\)/g,
  'prisma.flow.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { updatedAt: "desc" } })'
);

code = code.replace(
  /prisma\.tenantRecord\.findMany\(\{\s*where: \{\s*organizationId: ctx\.tenantId,\s*type: "sales"\s*\},\s*orderBy: \{\s*updatedAt: "desc"\s*\},?\s*\}\)/g,
  'prisma.sale.findMany({ where: { organizationId: ctx.tenantId }, orderBy: { updatedAt: "desc" } })'
);

// Replace mapping logic
code = code.replace(
  /const tasks = taskRecords\.map\(\(r: any\) => r\.data as Record<string, any>\);/g,
  `const tasks = taskRecords.map((r: any) => ({ ...r, ...(r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {}) }));`
);

code = code.replace(
  /const flows = flowRecords\.map\(\(r: any\) => r\.data as Record<string, any>\);/g,
  `const flows = flowRecords.map((r: any) => ({ ...r, ...(r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {}) }));`
);

code = code.replace(
  /const sales = saleRecords\.map\(\(r: any\) => r\.data as Record<string, any>\);/g,
  `const sales = saleRecords.map((r: any) => ({ ...r, ...(r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {}) }));`
);

// Update productivity bars logic
code = code.replace(
  /const d = r\.data as Record<string, any>;\s*return d\.status === "Done" && r\.updatedAt >= dayStart && r\.updatedAt < dayEnd;/g,
  `const payloadObj = r.payload ? (typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload) : {};\n        const s = r.status || payloadObj.status;\n        return s === "Done" && r.updatedAt >= dayStart && r.updatedAt < dayEnd;`
);

// Update task specific filters
code = code.replace(
  /const doneTasks = taskRecords\.filter\(\(r: any\) => \(r\.data as Record<string, any>\)\.status === "Done"\)\.length;/g,
  `const doneTasks = tasks.filter((t: any) => t.status === "Done").length;`
);

code = code.replace(
  /const blockedTasks = taskRecords\.filter\(\(r: any\) => \{\s*const s = \(r\.data as Record<string, any>\)\.status;\s*return s === "Blocked" \|\| s === "In Review";\s*\}\)\.length;/g,
  `const blockedTasks = tasks.filter((t: any) => t.status === "Blocked" || t.status === "In Review").length;`
);

fs.writeFileSync(file, code);
console.log('Dashboard summary route updated successfully');
