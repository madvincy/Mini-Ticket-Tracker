# Lodwar Services Mini Ticket Tracker

A small ticket desk built with Angular 18, Express 5 and MySQL 8. The API is layered into routes, controllers, services and a parameterized-query repository. Docker Compose runs MySQL, the API and the Angular app together.

## Run with Docker

Requirements: Docker Desktop with Compose enabled.

```sh
cp .env.example .env
docker compose up --build
```

Open <http://localhost:4200>. The API health endpoint is at <http://localhost:3000/health>. Compose creates the development schema `lodwar_tickets` and the isolated test schema `lodwar_tickets_test`; the API applies the migration when it starts.

To stop the services, run `docker compose down`. To also remove the local MySQL data volume, run `docker compose down -v`.

## Run locally

Requirements: Node.js 22 or newer, npm, and a running MySQL 8 server. Create `lodwar_tickets` and `lodwar_tickets_test`, then create `backend/.env` from `backend/.env.example` and set its database connection values.

```sh
cd backend
npm ci
npm run migrate
npm start
```

In another terminal:

```sh
cd frontend
npm ci
npm start
```

The Angular development server runs at <http://localhost:4200> and proxies `/api` to the API at port 3000.

## Tests

Integration tests use the real MySQL test schema; they do not mock the database. Start the database and configure `DB_TEST_NAME=lodwar_tickets_test`, then run:

```sh
cd backend
npm ci
npm test
```

Or run the suite against the Compose database:

```sh
docker compose up -d mysql
docker compose run --rm api npm test
```

The tests apply the migration, truncate the test table between cases, and close their connection pool after completion. Angular UI components are not covered by tests.

## API

- `POST /tickets`: create with required `title`, optional `description` and `priority`.
- `GET /tickets?status=&page=&limit=`: newest-first filtered, paginated list with `meta`.
- `PATCH /tickets/:id`: change one or both of `status` and `priority`.
- `GET /tickets/stats`: counts for all three statuses, including zeroes.

Success responses use `{ "data": ... }`; list responses also include `meta`. Errors use `{ "error": { "code", "message", "details?" } }`. Invalid input is a 400; a well-formed unknown ticket id is a 404.

## Decisions & Tradeoffs

- Integer auto-increment ids keep URLs and test fixtures readable. The tracker has no public-guessing or sharding requirement at this scale.
- MySQL ENUMs enforce status and priority at storage, while Zod validates API input before it reaches SQL.
- Omitted status and priority default to `open` and `medium`; the database migration owns those defaults.
- The `(status, created_at, id)` index supports filtered newest-first listing and grouped counts. The id tie-breaker makes order stable when timestamps match.
- SQL stays in the repository and all request values are parameterized. PATCH columns come from a fixed whitelist, never arbitrary request keys.
- Tests use a separate schema selected by `NODE_ENV=test` and share one database connection pool, so Jest runs in band.
- The UI reloads the list and stats after successful changes for correctness and simplicity. Authentication, deletion, title editing, real-time updates, UI component tests and deployment pipelines are intentionally out of scope.
- Compose publishes MySQL on the host for local tooling and uses development credentials by default. Change them in `.env` before exposing this stack beyond a local machine.