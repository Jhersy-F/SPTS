## Repo snapshot & purpose

This is a Next.js (App Router) + Prisma MySQL project that implements a small LMS-like system
with three user roles: student, instructor, and admin. Key areas:

- `app/` - Primary Next.js 13+ App Router UI (layouts, route groups like `(auth)`).
- `pages/` - Some legacy or specialized pages remain under `pages/`.
- `components/` - UI and feature components (see `components/ui/` and `components/auth/`).
- `lib/` - Server helpers (Prisma client in `lib/prisma.ts`, auth setup in `lib/auth.ts`).
- `prisma/` - `schema.prisma` and migrations; DB is MySQL via `DATABASE_URL`.

## Important technical conventions (what an AI agent must know)

- App Router is used: prefer modifying `app/` routes and `layout.tsx` files for UI-level changes.
- There is also a `pages/` folder — treat it as legacy or special-case routing. Check both if routing bugs appear.
- Prisma client: `lib/prisma.ts` exports `prisma` (singleton) and attaches an error-logging middleware. Use that for DB access.
- NextAuth config lives in `lib/auth.ts`. It uses CredentialsProvider for three providers:
  - `student-credentials`, `instructor-credentials`, `admin-credentials`.
  - Session strategy: `jwt`. Custom JWT/session fields: `id`, `role`, `firstName`, `middleName`, `lastName`, `extensionName`, `studentNumber`.
  - sign-in page is set to `/login/student` in the auth options.

## File patterns and examples to reference

- Authentication flows: see `lib/auth.ts` for how providers return user shape and how `jwt`/`session` callbacks map fields.
- Database schema: `prisma/schema.prisma` shows models Student, Instructor, Subject, Section, Upload, Admin and cross-table relations (e.g., InstructorSubject, StudentSection).
- UI primitives: `components/ui/*` contains shared design-system components (button, input, table, toast, etc.). Reuse these for consistency.
- Auth UI: `app/(auth)/` and `components/auth/` contain login/register forms. Follow their props/data patterns when adding new auth-related UI.

## Dev / build / run commands

- Local dev: `npm run dev` (uses `next dev --turbopack`).
- Build: `npm run build`.
- Start (production): `npm run start`.
- Lint: `npm run lint`.

No test scripts are present. Prisma CLI is available as a dev dep (`prisma`). DB migrations live in `prisma/migrations/`.

## Typical change workflows (practical tips for an agent)

- When changing DB models:
  1. Update `prisma/schema.prisma`.
 2. Run `npx prisma migrate dev` (note: developers will need a local MySQL `DATABASE_URL`).
 3. Use `lib/prisma.ts` for queries; it has a global error middleware — avoid creating additional Prisma clients.

- When adding auth fields or behavior:
  - Edit `lib/auth.ts` and update the JWT/session callbacks; other code expects `token.studentNumber` and user role fields.
  - Update type definitions in `type/` and `types/` (there are custom next-auth typings in `types/next-auth.d.ts`).

- When changing UI/components:
  - Prefer `components/ui/*` primitives for accessibility and consistent styling.
  - Follow the existing form validation approach (react-hook-form + zod/resolvers are used).

## Integration points & external dependencies

- NextAuth (next-auth) for authentication; configured manually in `lib/auth.ts` using CredentialsProvider.
- Prisma + MySQL (`@prisma/client`, `prisma` CLI). Environment variable: `DATABASE_URL`.
- Other libs: Tailwind CSS, Headless UI, Radix primitives, Sonner for toasts, Recharts for charts.

## What not to change without human review

- Middleware (`middleware.ts`) — affects routing and auth checks.
- `lib/prisma.ts` singleton or its middleware — replacing will risk connection churn.
- Low-level auth contract: the shape of JWT/session fields. Many components (and type files) expect specific fields.

## Quick pointers for common AI tasks

- To add a new API route use `app/api/` or `pages/api/` depending on pattern used by nearby routes; inspect both for consistency.
- To debug auth problems, check `lib/auth.ts` → `authorize()` implementations and the `jwt`/`session` callbacks first.
- To run locally, ensure `DATABASE_URL` points to a MySQL instance and run `npm run dev`.

If any section should be expanded (for example, more examples of common queries, or a map of the most-used components), tell me which part to expand and I will update this file.
