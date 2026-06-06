-- OPERO RLS defense-in-depth example for one tenant-owned operational table.
-- Better Auth core tables are intentionally untouched:
-- "user", "session", "account", "verification".
--
-- Task is used as the thesis/prototype RLS example because it is tenant-owned,
-- operational, and still keeps application-layer tenant filtering in the app.

ALTER TABLE "task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "task" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_tenant_select ON "task";
DROP POLICY IF EXISTS task_tenant_insert ON "task";
DROP POLICY IF EXISTS task_tenant_update ON "task";
DROP POLICY IF EXISTS task_tenant_delete ON "task";

CREATE POLICY task_tenant_select
ON "task"
FOR SELECT
USING ("organizationId" = current_setting('app.organization_id', true));

CREATE POLICY task_tenant_insert
ON "task"
FOR INSERT
WITH CHECK ("organizationId" = current_setting('app.organization_id', true));

CREATE POLICY task_tenant_update
ON "task"
FOR UPDATE
USING ("organizationId" = current_setting('app.organization_id', true))
WITH CHECK ("organizationId" = current_setting('app.organization_id', true));

CREATE POLICY task_tenant_delete
ON "task"
FOR DELETE
USING ("organizationId" = current_setting('app.organization_id', true));
