-- Minimal local isolation fixtures for manual testing.
-- Password accounts are intentionally omitted; create/login users through the app,
-- then attach their user ids to these tenants if needed.

INSERT INTO "organization" (id, name, slug, status, "createdAt", "inviteCode")
VALUES
  ('tenant_acme_demo', 'Acme Demo', 'acme', 'active', NOW(), 'OP-ACME-0001'),
  ('tenant_globex_demo', 'Globex Demo', 'globex', 'active', NOW(), 'OP-GLOB-0001')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    status = EXCLUDED.status,
    "inviteCode" = EXCLUDED."inviteCode";

INSERT INTO "subscription_plan" (id, name, "displayName", "maxMembers", "maxBots", features, "createdAt")
VALUES ('plan_free_demo', 'free', 'Free', 5, 1, '{"tasks": true}'::jsonb, NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO "tenant_settings" (id, "organizationId", timezone, locale, "createdAt", "updatedAt")
VALUES
  ('settings_acme_demo', 'tenant_acme_demo', 'UTC', 'en', NOW(), NOW()),
  ('settings_globex_demo', 'tenant_globex_demo', 'UTC', 'en', NOW(), NOW())
ON CONFLICT ("organizationId") DO NOTHING;

INSERT INTO "tenant_plan" (id, "organizationId", "planId", status, "createdAt", "updatedAt")
VALUES
  ('tenant_plan_acme_demo', 'tenant_acme_demo', 'plan_free_demo', 'active', NOW(), NOW()),
  ('tenant_plan_globex_demo', 'tenant_globex_demo', 'plan_free_demo', 'active', NOW(), NOW())
ON CONFLICT ("organizationId") DO NOTHING;
