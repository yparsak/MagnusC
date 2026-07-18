# Magnus

A simple Node.js/Express web app that connects to a MariaDB database.

## Running the app

```bash
npm install
cp .env.example .env   # then fill in real DB credentials
npm start               # or: npm run dev (nodemon)
```

The entry point is [app/magnus.js](app/magnus.js). It reads configuration from `.env`
(via `dotenv`), starts an Express server, and serves an EJS-rendered home page that
reports the current MariaDB connection status. `GET /health` returns a JSON health
check for the database connection.

To create the database and load the example schema:

```bash
npm run db:init
```

## Directory structure

```
.
├── app/                      # Application source
│   ├── magnus.js             # Entry point — starts the Express server
│   ├── lib/
│   │   └── db.js             # MariaDB connection pool (mysql2/promise)
│   ├── routes/
│   │   └── index.js          # Route definitions (/, /health)
│   ├── views/                # EJS templates
│   │   ├── index.ejs
│   │   └── partials/
│   │       ├── header.ejs
│   │       └── footer.ejs
│   └── public/                # Static assets served at /
│       ├── styles/style.css
│       ├── js/main.js
│       ├── imgs/              # Static images
│       └── effects/           # Static visual effects assets
├── sql/
│   ├── template/schema.sql   # Table definitions used by scripts/init-db.js
│   └── data/                  # Seed/fixture data (empty by default)
├── scripts/
│   ├── init-db.js            # Creates the DB and applies sql/template/schema.sql
│   └── lib/                   # Shared helpers for scripts (empty by default)
├── .env / .env.example        # Environment configuration (DB credentials, port)
├── CLAUDE.md                  # This file
├── SPEC.md                    # User requirements
└── package.json
```

## Configuration

All configuration lives in `.env` (see `.env.example` for the full list):

| Variable      | Purpose                          |
|---------------|-----------------------------------|
| `PORT`        | HTTP port the server listens on   |
| `NODE_ENV`    | Environment name                  |
| `DB_HOST`     | MariaDB host                      |
| `DB_PORT`     | MariaDB port (default 3306)       |
| `DB_USER`     | MariaDB user                      |
| `DB_PASSWORD` | MariaDB password                  |
| `DB_NAME`     | MariaDB database name              |

`.env` is gitignored — never commit real credentials. `.env.example` documents the
required variables with placeholder values.

## Conventions

- MariaDB access goes through the shared pool in [app/lib/db.js](app/lib/db.js) — don't open ad-hoc connections elsewhere in `app/`.
- Routes are added under `app/routes/` and mounted in `app/magnus.js`.
- Views are EJS templates under `app/views/`, sharing `partials/header.ejs` and `partials/footer.ejs`.
- Standalone maintenance scripts (migrations, seeding, one-off jobs) go in `scripts/`, not under `app/`.
