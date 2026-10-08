# CampusLink file ownership

Owners are responsible for reviewing changes within their assigned paths. Paths are relative to the repository root.

| Owner | Owned paths | Scope |
|---|---|---|
| Rudy | ai/**; contracts/** | AI service and generated API contracts |
| Rudy only | web/app/layout.tsx; web/app/globals.css; web/app/login/**; web/app/register/**; web/context/**; web/components/shared/**; web/components/ui/**; web/lib/**; web/package.json | Shared layout, auth, role/profile/theme/sidebar contexts, global CSS, shared components and utilities, package scripts/dependencies |
| Samir | web/app/dashboard/student/**; web/app/applications/**; web/app/career-intelligence/**; web/app/opportunities/**; web/app/profile/**; web/app/skill-analysis/**; web/features/samir/**; web/components/resume/** | Student routes and career/profile/resume features. Shared components used by these routes remain Rudy-only. |
| Ishaan | web/app/dashboard/industry/** | Industry routes, named Recruiter in CampusLink. |
| Sinu | web/app/dashboard/institution/**; web/components/institution/**; web/data/institution/**; web/lib/api/institution.ts | Institution routes and components, named Placement Cell in CampusLink. Shared lib/utilities remain Rudy-only; institution data modules are Sinu-owned. |
| Shiva | web/app/dashboard/faculty/**; web/app/faculty/**; web/components/faculty/**; web/data/faculty-*.ts; web/lib/api/faculty-*.ts; web/lib/api/lecture-planner*.ts; web/lib/api/timetable.ts | Faculty routes/components and related data/API files, used to deliver the Mentor screen. |
| Brajesh | web/features/offers/** | New feature area to create for offers, documents, joining and notifications. |

## Rules

- Edit only your own paths.
- Shared files change only through a pull request that Rudy reviews.
- Ask the owner before touching someone else’s folder.
- Keep generated contracts generated from their source; ownership does not authorize hand-editing them.
- For new files, place them under the matching owned path. If a file does not fit, agree on its owner before adding it.

