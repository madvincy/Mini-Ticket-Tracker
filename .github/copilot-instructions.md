# Workspace Notes

- This repository contains the Angular 18 client in `frontend/` and Express 5 API in `backend/`.
- Keep all database access in `backend/src/repositories/`; use parameterized MySQL queries.
- Validate API inputs with the Zod schemas under `backend/src/validation/` and preserve the documented response envelopes.
- Use the separate `lodwar_tickets_test` database for integration tests; run Jest with `--runInBand`.
- The application stack is orchestrated by the root `docker-compose.yml`.
- Setup, test, API and tradeoff details are documented in `README.md`.