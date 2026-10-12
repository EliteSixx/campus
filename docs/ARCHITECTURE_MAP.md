# CampusLink / The Plug Web Architecture Map

Read-only survey of web/ (excluding node_modules and .next). Source branding says The Plug and includes older academic/alumni product areas. Role names below follow the requested old-role vocabulary; current equivalents are Student, Recruiter (Industry), Placement Cell (Institution), Mentor (Faculty). Alumni is out of scope.

## 1. Folder tree (depth 3)

    web/
      app/
        alumni/{badges,guidance,impact,mentees,mentorship,network-graph,proofs,referrals,referrals-pipeline,resources,sessions}/
        api/imagekit/upload/
        applications/ career-intelligence/ dashboard/{alumni,faculty,industry,institution,student}/
        faculty/{announcements,assignments,materials,messages,planner,profile,programs,students,subjects,timetable}/
        landing-preview/ishaan/ opportunities/ profile/{resume,skills}/ register-preview/ishaan/
        settings/{account,connections,notifications,objectives}/ skill-analysis/
        globals.css layout.tsx login/ notifications/ page.tsx register/
      components/
        faculty/{announcements,curriculum,dashboard,materials,messages,planner,profile,programs,students,timetable}/
        institution/ landing/ resume/ shared/ ui/
      context/ data/{institution,theme}/ features/samir/{actions,components,data,integrations}/ lib/api/
      package.json package-lock.json next.config.js tailwind.config.ts tsconfig.json eslint.config.mjs

Brace groups abbreviate sibling directories; individual route files are described below.

## 2. Role areas and ownership

Ownership is inferred from route placement and component naming/imports.

| Old role | Route folders under app/ | features/ folders | Role components |
|---|---|---|---|
| Student | /dashboard/student; shared /applications, /career-intelligence, /opportunities, /profile (resume, skills), /skill-analysis | None | components/resume/*; student-oriented shared opportunity, match, skill-gap, skill-progress, skill-radar and recommendation components. |
| Industry (Recruiter) | /dashboard/industry (colleagues, post-job); shared /opportunities and /opportunities/[id] | None | components/shared/industry-post-job, job-posted-banner; resume candidate viewer; dashboard-local candidate-table.tsx. |
| Institution (Placement Cell) | /dashboard/institution (archives, curriculum, departments/[id], departments, drives, faculty, internships, outcomes, partners, policies, skills, students); shared /career-intelligence | None | All components/institution/*: department, drive, eligibility, engagement, outcomes, policy, readiness, recruiter feedback, skill demand, student/faculty directory and drawers. |
| Faculty (Mentor) | /dashboard/faculty; extensive older /faculty portal: announcements/[id], assignments/[id], materials/[courseId], messages/[id], planner, profile, programs/plan, students/[id]/report, subjects/[id]/proposal, timetable and parent indexes | None | All components/faculty/*, grouped announcements, curriculum, dashboard, materials, messages, planner, profile, programs, students, timetable. This is a substantial academic portal, not one Mentor screen. |
| Alumni | /dashboard/alumni; /alumni plus badges, guidance, impact, mentees, mentorship, network-graph, proofs, referrals, referrals-pipeline, resources, sessions | None | No components/alumni directory; uses shared components and data/demo-alumni.ts. |

features/samir/ is the only feature directory, with career intelligence UI, data and bridges; it appears shared across career-intelligence flows rather than role-owned.

## 3. Shared code and role imports

Direct shared usage is inferred from imports and provider composition. Global code applies to all routes; shared components are used by whichever role pages import them.

| Shared code | Purpose / roles |
|---|---|
| app/layout.tsx | Root HTML/providers; app-wide. Contains unresolved merge conflict markers, so actual provider tree is ambiguous. |
| app/globals.css | Tailwind/theme/global styles; loaded app-wide by root layout. |
| context/role-context.tsx | RoleProvider/useRole and role union; app-wide. Wraps UserProfileProvider. |
| context/user-profile-context.tsx | Per-role profile and connected accounts; login/profile flows and consumers in multiple roles. |
| context/theme-context.tsx | Theme provider, app-wide. |
| context/sidebar-context.tsx | Dashboard sidebar state; DashboardShell/navigation. Layout currently has competing provider arrangements. |
| components/shared/landing-nav.tsx, site-footer.tsx, landing-motion.tsx | Public landing and auth UI. |
| components/shared/dashboard-shell.tsx, sidebar.tsx, top-navbar.tsx, role-switcher.tsx, notification-center.tsx | Dashboard frame/navigation and demo role switching; dashboard routes as wired. |
| components/shared/* | Common analytics, cards, charts, skills, recommendations, export, opportunities, jobs and state UI; role pages import as needed. |
| components/ui/{badge,button,card,input,progress,select}.tsx | Generic primitives used across role flows. |
| lib/utils.ts | Shared styling/class helper. |
| lib/api/*.ts | API-shaped modules for academics, analytics, assignments, curriculum, faculty, institution, planner, opportunities, resumes, skills, students, theme and timetable. Role ownership follows module names and actual importers. |
| data/* and features/samir/data/* | Static/demo records; see next section. |

## 4. Role selection, login, and route protection

- context/role-context.tsx defaults role to student, reads localStorage key skillsync-role after mount, and persists setRole changes.
- /login offers Student, Alumni, Industry Recruiter, Institution Admin and Faculty Member. Email submission updates role/profile state and routes to /dashboard/{role}.
- Login's Google option is simulated with hardcoded demo profiles and timers; it is not OAuth.
- components/shared/role-switcher.tsx changes role and navigates to its dashboard. /dashboard client-redirects to the selected role dashboard.
- / is the public landing page; /register and preview routes also exist.
- No middleware, server-side auth, or route guard was found in the surveyed tree. Context role selection is demo UI state, not access control.

## 5. Mock and hardcoded data locations

Centralized static/mock sources:

- data/analytics.ts, assignments.ts, companies.ts, curriculum.ts, demo-alumni.ts, opportunities.ts, programme-curriculum.ts, skills.ts, skill-syllabus.ts, student-academics.ts, students.ts, timetable.ts.
- data/faculty-academic-calendar.ts, faculty-announcements.ts, faculty-course-units.ts, faculty-materials.ts, faculty-messages.ts, faculty-profile.ts, faculty-programs.ts, faculty-student-records.ts.
- data/institution/mock-archives.ts, mock-curriculum.ts, mock-departments.ts, mock-drives.ts, mock-faculty.ts, mock-internships.ts, mock-overview.ts, mock-partners.ts, mock-policies.ts, mock-skills.ts, mock-students.ts; types.ts defines shapes.
- features/samir/data/career-analyzer.ts and career-intelligence.ts.
- components/faculty/** and app/faculty/** include local stores/utilities and demo state, including browser localStorage stores.
- Inline literals are also present in route/component files (notably demo login identities, dashboard/chart metrics, landing copy and Ishaan preview routes under app/landing-preview and app/register-preview).

lib/api modules provide API-shaped boundaries, but that alone does not establish a live backend. Check implementations before treating metrics or records as production data.

## 6. Apparent dead code or unrelated legacy areas

These appear outside focused placement workflows or need follow-up reference checks. This is not proof they are unused.

- Faculty academic portal: app/faculty/announcements, assignments, materials, messages, planner, programs, subjects, timetable; matching components/faculty areas; data/assignments.ts, faculty-academic-calendar.ts, faculty-announcements.ts, faculty-course-units.ts, faculty-materials.ts, faculty-messages.ts, faculty-programs.ts, timetable.ts; corresponding lib/api assignments, lecture-planner*, timetable, faculty-announcements, faculty-materials*, faculty-programs*.
- Alumni networking/recognition (out of current scope): app/alumni/network-graph, badges, impact, proofs, referrals-pipeline, other alumni routes and data/demo-alumni.ts.
- Preview artifacts: app/landing-preview/ishaan and app/register-preview/ishaan.
- web/disclosure-section.tsx duplicates the filename of components/shared/disclosure-section.tsx; check references before classifying it dead.
- features/samir/integrations/career-opportunities-bridge.ts and features/samir/actions/career-opportunities.ts may be scaffolding; verify references/runtime use.

Mentor scope needs a product decision: current Faculty surface is large and academic.

## 7. Dev server and build

From web/:

    npm run dev      # next dev
    npm run build    # next build
    npm run start    # next start
    npm run lint     # eslint .

There is no test script in package.json.

## Surprising or risky findings

- app/layout.tsx contains literal Git conflict markers (<<<<<<<, =======, >>>>>>>) around competing provider trees; the app is likely not buildable until resolved.
- Demo role switching/login has no route authorization and must not be treated as an auth boundary.
- Persisted role key skillsync-role conflicts with The Plug branding and CampusLink naming.
- Alumni is implemented despite being out of scope; Faculty is far broader than the requested single Mentor screen.
- The only feature directory is named after a person, obscuring ownership.
- API-shaped modules coexist with local/static stores; verify data provenance before relying on displayed figures.

