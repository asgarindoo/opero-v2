-- OPERO now uses fixed membership roles stored in member.role:
-- owner, admin, and member. The old custom role catalog is no longer used.

DROP TABLE IF EXISTS "role" CASCADE;
