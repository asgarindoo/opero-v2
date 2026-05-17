# Multi-Tenant Architecture

OPERO uses a shared database/shared schema model. Tenants are Better Auth
organizations stored in `organization`; tenant-owned rows must be scoped with the
server-resolved tenant id (`organizationId`, equivalent to `tenant_id`).

## Tenant Resolver

`proxy.ts` resolves workspace subdomains such as `acme.localhost:3000` or
`acme.<NEXT_PUBLIC_ROOT_DOMAIN>`. It validates:

- tenant slug exists
- tenant `status` is `active`
- session user is an active `member`

After validation it forwards trusted request headers:

- `x-tenant-id`
- `x-tenant-slug`
- `x-user-id`
- `x-user-role`

Client-supplied versions of these headers are stripped before forwarding.

Root-domain routes (`/`, `/login`, `/register`, `/onboarding`, `/tenants`) stay
on the root host. If they are opened on a tenant subdomain, Proxy redirects them
back to the root host. Tenant subdomains are reserved for `/dashboard` and
tenant-scoped APIs after authentication. Short tenant paths such as `/tasks`,
`/members`, and `/settings` on a tenant subdomain are rewritten to the matching
`/dashboard/...` route after tenant validation.

## User Flow

1. User opens the root domain landing page.
2. User logs in or registers.
3. If the user has no tenants, they go to onboarding to create or join a tenant.
4. If the user has exactly one tenant, OPERO opens it directly; if the user has multiple tenants, OPERO shows the tenant selector.
5. The selected tenant becomes the active organization and the browser moves to `tenant-slug.localhost:3000/dashboard`.
6. Proxy resolves the subdomain, validates tenant status and membership, then injects tenant context headers.
7. Server helpers re-check tenant context and all tenant-owned data is filtered by `tenantId`.

## Server Context

Use `getTenantContext()`, `requireTenant()`, `requireTenantMember()`, and
`requireRole()` from `lib/server/auth-utils.ts`. These helpers never trust
`tenant_id` from query params, JSON payloads, or client headers. They re-check
the session, tenant status, and membership before returning a context.

## Tenant Filtering

Every tenant-owned query must filter by `context.tenantId`; every create must
set `organizationId`/`tenant_id` on the server. The optional
`lib/server/tenant-prisma.ts` wrapper demonstrates the pattern for scoped Prisma
queries.

## RBAC

Supported roles are `owner`, `admin`, and `member`.

- `owner` and `admin`: tenant settings, invite codes, invite links, and member management
- `member`: read/access tenant data only

## Local Testing

Use `localhost:3000` for landing/auth/onboarding/create/join flows. Use
`<tenant-slug>.localhost:3000/dashboard` for tenant workspaces in local
development. Examples:

- `localhost:3000` -> root landing/auth/onboarding
- `app.localhost:3000` -> root app host
- `main.localhost:3000/dashboard` -> tenant `main`
- `bisnis-a.localhost:3000/dashboard` -> tenant `bisnis-a`

A user who is not a member of that tenant is redirected to `/unauthorized`;
inactive tenants are redirected to `/tenant-inactive`.

If your browser or OS does not resolve wildcard localhost names, add entries to
your hosts file, for example:

```text
127.0.0.1 main.localhost
127.0.0.1 bisnis-a.localhost
```

## Isolation Tests

1. Open `localhost:3000`; it should show the root app.
2. Open `main.localhost:3000/dashboard` as a member; it should show tenant `main`.
3. Open `unknown.localhost:3000/dashboard`; it should show Tenant Not Found.
4. Log in as a user from tenant A and open tenant B; it should show Unauthorized.
5. Mark a tenant inactive and open its subdomain; it should show Tenant Inactive.
6. Create a tenant; the browser should redirect to `<slug>.localhost:3000/dashboard`.
7. Join a tenant with invite code/link; the browser should redirect to that tenant subdomain.
