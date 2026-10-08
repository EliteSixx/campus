# CampusLink Web

CampusLink is a placement readiness and hiring platform for Students, Recruiters, Placement Cells, and Mentors. This Next.js App Router app is a prototype derived from The Plug.

## Roles

- **Student:** skill readiness, ranked opportunities, resume, and applications.
- **Recruiter:** candidate intelligence, job posting, and talent pipeline.
- **Placement Cell:** campus readiness, skill gaps, drives, and placement outcomes.
- **Mentor:** a focused placeholder route at `/dashboard/faculty`, ready for mentor workflow development.

## Getting started

From this directory:

```bash
npm install
npm run dev
```

Open http://localhost:3000. The role switcher supports Student, Recruiter, Placement Cell, and Mentor preview roles.

## Scripts

- `npm run dev` starts Next.js in development mode.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Lucide React
- Recharts

## Main folders

- `app/` routes
- `components/shared/` shared navigation and product UI
- `components/institution/` Placement Cell UI
- `components/faculty/students/` retained Mentor roster and student insight components for possible reuse
- `components/ui/` UI primitives
- `context/` role, profile, theme, and sidebar state
- `data/` prototype data
- `features/samir/` Student career intelligence
