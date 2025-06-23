# AutoRep

AutoRep is a voice-first workout tracker that combines a React frontend with an Express/TypeScript backend. It focuses on hands‑free workout logging, AI‑powered coaching and progress tracking. The project is organised as a monorepo where the client, server and shared types live together.

## Project Overview

- **Voice driven UI** – use speech recognition to log sets and navigate the app.
- **AI workout suggestions** – the backend offers simple coaching endpoints.
- **Progress tracking** – workouts, sets and personal records are stored in PostgreSQL using Drizzle ORM.
- **Mobile first** – the frontend uses Tailwind CSS and a PWA friendly layout.

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Database**
   - Provision a local PostgreSQL database and copy the connection string.
   - Create a `.env` file in the project root with:
     ```env
     DATABASE_URL=postgres://username:password@localhost:5432/autorep
     ```
   - Push the schema:
     ```bash
     npm run db:push
     ```
3. **Start development server**
   ```bash
   npm run dev
   ```
   The API and React app will run together on <http://localhost:5000>.

## Development Workflow

- The `dev` script launches the Express API with Vite in middleware mode for hot reloading.
- Build for production with `npm run build`, then start with `npm run start`.
- Type checking can be run with `npm run check`.
- Use `npm run db:push` whenever the schema in `shared/schema.ts` changes.

## Project Structure

```
attached_assets/   Miscellaneous text assets
client/            React frontend (index.html and src/)
server/            Express API, database logic and Vite server helpers
shared/            TypeScript types and Drizzle schema shared by server and client
```

Other root files include `package.json` for scripts and dependencies, `vite.config.ts` for build configuration and Tailwind/postcss config for styling.

## Testing

Unit tests run with [Vitest](https://vitest.dev/) and React Testing Library. End-to-end tests are written with Cypress.

Run unit tests:

```bash
npm test
```

With the dev server listening on port 5000 you can run Cypress:

```bash
npm run test:e2e
```

## Feature Summary

- Voice‑powered onboarding and workout logging
- REST API for users, exercises, workouts and sets
- Simple AI coaching endpoint for progress suggestions
- Progress charts and personal record tracking

## Contributing

1. Fork the repository and create your feature branch.
2. Run `npm install` and `npm run check` to ensure type safety.
3. Make your changes with descriptive commit messages.
4. Open a pull request targeting the main branch.
5. Please include tests or update existing ones when adding features.

