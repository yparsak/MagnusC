# Magnus — Requirements Specification

## Overview

Magnus is a simple Node.js web application. This document tracks the requirements
gathered so far. Update it as new requirements are added.

## Confirmed requirements

1. **Runtime**: Node.js.
2. **Entry point**: the app must start via `app/magnus.js`.
3. **Configuration**: environment-specific settings (DB credentials, port, etc.)
   must be provided via a `.env` file, not hardcoded.
4. **Database**: the app must be able to connect to a MariaDB database.
5. **Documentation**:
   - [CLAUDE.md](CLAUDE.md) describes the project's directory structure and how
     to run it, for future development sessions.
   - `SPEC.md` (this file) captures user-facing requirements.

## Current implementation

- Express server (`app/magnus.js`) with EJS views and static asset serving.
- MariaDB connection pool (`app/lib/db.js`) using `mysql2/promise`, configured
  entirely from `.env`.
- Home page (`GET /`) displays the current database connection status.
- Health check endpoint (`GET /health`) returns JSON with DB connectivity status.
- `scripts/init-db.js` creates the configured database and applies
  `sql/template/schema.sql`, a placeholder schema (a single `users` table).

## Open items / not yet specified

The following have not been defined by the user yet and should be clarified
before further feature work:

- What business functionality Magnus should actually provide beyond a DB
  connectivity check (its actual purpose/domain).
- Real data model (tables beyond the placeholder `users` example in
  `sql/template/schema.sql`).
- Authentication/authorization requirements, if any.
- Deployment target/environment.

## Change log

- 2026-07-18: Initial scaffold created — Node.js project, `app/magnus.js` entry
  point, `.env`-based config, MariaDB connectivity, `CLAUDE.md`, `SPEC.md`.
