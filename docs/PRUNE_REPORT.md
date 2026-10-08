# CampusLink role prune report

## Files removed (listed before deletion)

This is the file-by-file plan based on docs/ARCHITECTURE_MAP.md and an import scan. Each path below has the reason stated by its group heading. All paths in this list were removed in the Alumni and Faculty pruning commits.

### Alumni routes and pages (out of scope)

- `web/app/alumni/badges/page.tsx`
- `web/app/alumni/guidance/page.tsx`
- `web/app/alumni/impact/page.tsx`
- `web/app/alumni/mentees/page.tsx`
- `web/app/alumni/mentorship/page.tsx`
- `web/app/alumni/network-graph/page.tsx`
- `web/app/alumni/page.tsx`
- `web/app/alumni/proofs/page.tsx`
- `web/app/alumni/referrals/page.tsx`
- `web/app/alumni/referrals-pipeline/page.tsx`
- `web/app/alumni/resources/page.tsx`
- `web/app/alumni/sessions/page.tsx`
- `web/app/dashboard/alumni/page.tsx`

### Faculty academic routes replaced by a single Mentor dashboard placeholder

- `web/app/faculty/announcements/[id]/page.tsx`
- `web/app/faculty/announcements/page.tsx`
- `web/app/faculty/assignments/[id]/evaluator.tsx`
- `web/app/faculty/assignments/[id]/page.tsx`
- `web/app/faculty/assignments/assignment-list.tsx`
- `web/app/faculty/assignments/overdue.ts`
- `web/app/faculty/assignments/overdue-badge.tsx`
- `web/app/faculty/assignments/page.tsx`
- `web/app/faculty/materials/[courseId]/page.tsx`
- `web/app/faculty/materials/course-options.ts`
- `web/app/faculty/materials/page.tsx`
- `web/app/faculty/messages/[id]/page.tsx`
- `web/app/faculty/messages/page.tsx`
- `web/app/faculty/planner/page.tsx`
- `web/app/faculty/profile/page.tsx`
- `web/app/faculty/programs/page.tsx`
- `web/app/faculty/programs/plan/page.tsx`
- `web/app/faculty/students/[id]/page.tsx`
- `web/app/faculty/students/[id]/report/page.tsx`
- `web/app/faculty/students/page.tsx`
- `web/app/faculty/subjects/[id]/page.tsx`
- `web/app/faculty/subjects/[id]/proposal/page.tsx`
- `web/app/faculty/subjects/page.tsx`
- `web/app/faculty/timetable/page.tsx`
- `web/app/faculty/timetable/print-button.tsx`

### Legacy Faculty feature components (announcements, dashboard, materials, messages, planner, profile, programs, timetable, curriculum authoring)

- `web/components/faculty/announcements/AnnouncementCard.tsx`
- `web/components/faculty/announcements/AnnouncementDetail.tsx`
- `web/components/faculty/announcements/AnnouncementsClient.tsx`
- `web/components/faculty/announcements/ComposeAnnouncement.tsx`
- `web/components/faculty/announcements/utils.ts`
- `web/components/faculty/curriculum/AddDraftTopicForm.tsx`
- `web/components/faculty/curriculum/AlignmentExplainer.tsx`
- `web/components/faculty/curriculum/CurriculumStatCards.tsx`
- `web/components/faculty/curriculum/DraftEditor.tsx`
- `web/components/faculty/curriculum/DraftScorePanel.tsx`
- `web/components/faculty/curriculum/DraftTopicRow.tsx`
- `web/components/faculty/curriculum/IndustryDemandTab.tsx`
- `web/components/faculty/curriculum/MissingSkillsTab.tsx`
- `web/components/faculty/curriculum/ProposalClient.tsx`
- `web/components/faculty/curriculum/ProposalDocument.tsx`
- `web/components/faculty/curriculum/QuickWinsCard.tsx`
- `web/components/faculty/curriculum/SharedGapsCard.tsx`
- `web/components/faculty/curriculum/SkillCoverageMatrix.tsx`
- `web/components/faculty/curriculum/StudentImpactTab.tsx`
- `web/components/faculty/curriculum/SubjectDetailClient.tsx`
- `web/components/faculty/curriculum/SubjectDetailTabs.tsx`
- `web/components/faculty/curriculum/SubjectOverviewCard.tsx`
- `web/components/faculty/curriculum/SubjectOverviewList.tsx`
- `web/components/faculty/curriculum/SubjectSummaryCards.tsx`
- `web/components/faculty/curriculum/TopicsTab.tsx`
- `web/components/faculty/curriculum/useCurriculumDrafts.ts`
- `web/components/faculty/curriculum/useDraftStore.ts`
- `web/components/faculty/dashboard/CurriculumSnapshot.tsx`
- `web/components/faculty/dashboard/DashboardHeader.tsx`
- `web/components/faculty/dashboard/DashboardStatCards.tsx`
- `web/components/faculty/dashboard/FacultyDashboardClient.tsx`
- `web/components/faculty/dashboard/MaterialsCoverageCard.tsx`
- `web/components/faculty/dashboard/NeedsAttention.tsx`
- `web/components/faculty/dashboard/PlannerProgressCard.tsx`
- `web/components/faculty/dashboard/RecentAnnouncements.tsx`
- `web/components/faculty/dashboard/RecentMessages.tsx`
- `web/components/faculty/dashboard/SkillGapsAndRecommendation.tsx`
- `web/components/faculty/dashboard/TodaySchedule.tsx`
- `web/components/faculty/dashboard/useDashboardLocalData.ts`
- `web/components/faculty/dashboard/utils.ts`
- `web/components/faculty/materials/CourseTreeClient.tsx`
- `web/components/faculty/materials/MaterialDetailPanel.tsx`
- `web/components/faculty/materials/MaterialRow.tsx`
- `web/components/faculty/materials/MaterialsLibraryClient.tsx`
- `web/components/faculty/materials/UploadMaterial.tsx`
- `web/components/faculty/materials/useMaterialsStore.ts`
- `web/components/faculty/materials/utils.ts`
- `web/components/faculty/messages/ConversationList.tsx`
- `web/components/faculty/messages/ConversationThread.tsx`
- `web/components/faculty/messages/MessageAttachments.tsx`
- `web/components/faculty/messages/MessagesClient.tsx`
- `web/components/faculty/messages/NewMessage.tsx`
- `web/components/faculty/messages/utils.ts`
- `web/components/faculty/planner/AddLectureForm.tsx`
- `web/components/faculty/planner/GeneratePlanEmpty.tsx`
- `web/components/faculty/planner/IndustryCheckCard.tsx`
- `web/components/faculty/planner/LectureDetailPanel.tsx`
- `web/components/faculty/planner/LectureList.tsx`
- `web/components/faculty/planner/LectureRow.tsx`
- `web/components/faculty/planner/PlanCalendarView.tsx`
- `web/components/faculty/planner/PlannerClient.tsx`
- `web/components/faculty/planner/PlanProgressCard.tsx`
- `web/components/faculty/planner/PlanSetupCard.tsx`
- `web/components/faculty/planner/PlanStatusBar.tsx`
- `web/components/faculty/planner/PrintablePlan.tsx`
- `web/components/faculty/planner/usePlannerStore.ts`
- `web/components/faculty/planner/utils.ts`
- `web/components/faculty/planner/ViewToggle.tsx`
- `web/components/faculty/profile/AppearanceCard.tsx`
- `web/components/faculty/profile/DemoDataCard.tsx`
- `web/components/faculty/profile/FacultyProfileClient.tsx`
- `web/components/faculty/profile/NotificationsCard.tsx`
- `web/components/faculty/profile/OverviewTab.tsx`
- `web/components/faculty/profile/ProfileHeader.tsx`
- `web/components/faculty/profile/ProfileSettingsCard.tsx`
- `web/components/faculty/profile/ResearchTabs.tsx`
- `web/components/faculty/profile/SettingsTab.tsx`
- `web/components/faculty/profile/storage.ts`
- `web/components/faculty/profile/TeachingTab.tsx`
- `web/components/faculty/profile/utils.ts`
- `web/components/faculty/programs/AllProgramsTab.tsx`
- `web/components/faculty/programs/DevelopmentPlan.tsx`
- `web/components/faculty/programs/PlanPrintButton.tsx`
- `web/components/faculty/programs/PlanTab.tsx`
- `web/components/faculty/programs/ProgramCard.tsx`
- `web/components/faculty/programs/ProgramsClient.tsx`
- `web/components/faculty/programs/ProgramsStatCards.tsx`
- `web/components/faculty/programs/RecommendedTab.tsx`
- `web/components/faculty/programs/useSavedPrograms.ts`
- `web/components/faculty/programs/utils.ts`
- `web/components/faculty/timetable/ClashCheckCard.tsx`
- `web/components/faculty/timetable/HoursBySubject.tsx`
- `web/components/faculty/timetable/SlotDetailPanel.tsx`
- `web/components/faculty/timetable/TimetableClient.tsx`
- `web/components/faculty/timetable/TimetableDayView.tsx`
- `web/components/faculty/timetable/TimetableGrid.tsx`
- `web/components/faculty/timetable/TimetableSlotCard.tsx`
- `web/components/faculty/timetable/TimetableSummary.tsx`
- `web/components/faculty/timetable/utils.ts`

### Alumni-only mock data

- `web/data/demo-alumni.ts`

### Faculty mock data exclusive to removed sections

- `web/data/faculty-academic-calendar.ts`
- `web/data/faculty-announcements.ts`
- `web/data/faculty-messages.ts`
- `web/data/faculty-profile.ts`
- `web/data/timetable.ts`

### API helpers exclusive to removed academic Faculty sections

- `web/lib/api/faculty-announcements.ts`
- `web/lib/api/faculty-dashboard.ts`
- `web/lib/api/faculty-dashboard-meta.ts`
- `web/lib/api/faculty-messages.ts`
- `web/lib/api/faculty-profile.ts`
- `web/lib/api/lecture-planner.ts`
- `web/lib/api/lecture-planner-meta.ts`
- `web/lib/api/timetable.ts`

## Kept as unsure

These are linked to the Mentor student-roster/skill-gap workflow, have dependencies crossing into curriculum insight data, or may be directly reusable in the Mentor screen. They remain until their use is clear:

- `web/components/faculty/students/**`, `web/components/faculty/breadcrumb.tsx`, `web/components/faculty/section-nav.tsx`, `web/components/faculty/section-tabs.tsx`, and `web/components/faculty/curriculum/utils.ts`.
- `web/data/assignments.ts`, `web/data/faculty-course-units.ts`, `web/data/faculty-materials.ts`, `web/data/faculty-programs.ts`, `web/data/faculty-student-records.ts`, and `web/data/analytics.ts` (shared analytics source).
- `web/lib/api/assignments.ts`, `web/lib/api/curriculum-insights*.ts`, `web/lib/api/faculty-materials*.ts`, `web/lib/api/faculty-programs*.ts`, `web/lib/api/faculty-roster.ts`, and `web/lib/api/faculty-students*.ts`.
- Shared landing components remain; their Alumni stakeholder entry and Alumni-specific copy were edited to show the four CampusLink roles.

## Non-deletion changes completed

- Keep `web/app/dashboard/faculty/page.tsx` as the only Faculty/Mentor route and replace the old aggregate dashboard with a minimal Mentor placeholder.
- Remove Alumni from role selection, profile defaults, role switcher, and sidebar navigation; simplify the Mentor sidebar to its dashboard entry.

## Completion summary

- Removed 151 files: all listed Alumni routes and Alumni-only mock data, the old /faculty academic route tree, legacy Faculty announcements, assignments, materials, messages, planner, profile, programs, timetable, and curriculum-authoring UI, plus exclusive data/API helpers.
- Kept /dashboard/faculty as the single Mentor placeholder route.
- Removed Alumni from role state/default profiles, login and registration selection, role switcher, sidebar, notification settings, resume access labels, and landing role messaging. Updated remaining role labels to Recruiter, Placement Cell, and Mentor.
- Three focused commits on chore/prune-roles: Alumni routes/mock removal; Faculty pruning/Mentor placeholder; Alumni role, auth, navigation, and copy cleanup.

## Kept as unsure

These paths stay because they support possible Mentor roster/readiness reuse or are dependency inputs to that workflow. The retained student components are currently not wired into the placeholder route. Their old /faculty links must be updated before reuse.

- web/components/faculty/students/**
- web/components/faculty/breadcrumb.tsx, web/components/faculty/section-nav.tsx, web/components/faculty/section-tabs.tsx, web/components/faculty/curriculum/utils.ts
- web/data/assignments.ts, web/data/faculty-course-units.ts, web/data/faculty-materials.ts, web/data/faculty-programs.ts, web/data/faculty-student-records.ts
- web/lib/api/assignments.ts, web/lib/api/curriculum-insights.ts, web/lib/api/curriculum-insights-meta.ts, web/lib/api/faculty-materials.ts, web/lib/api/faculty-materials-meta.ts, web/lib/api/faculty-programs.ts, web/lib/api/faculty-programs-meta.ts, web/lib/api/faculty-roster.ts, web/lib/api/faculty-students.ts, web/lib/api/faculty-students-meta.ts, web/lib/api/faculty-students-workspace.ts
- web/data/analytics.ts remains as shared data. The landing components remain as shared UI; their Alumni roles/copy were removed.
- web/app/layout.tsx still contains the baseline unresolved Git conflict markers around provider setup. Its page metadata was updated, but provider conflicts were outside this pruning change.

## Verification results

Type checks and builds were attempted after each focused source commit as requested. The repository has no installed node_modules, and npm is in offline-only cache mode. The final source commit includes this report and was rechecked after amendment.

| Focused commit | Type check: npx tsc --noEmit | Build: npm run build |
|---|---|---|
| Alumni routes/mock removal | Could not start: npm ENOTCACHED trying to resolve tsc; no cached registry response | Could not start: next executable is not installed |
| Faculty pruning/Mentor placeholder | Could not start: npm ENOTCACHED trying to resolve tsc; no cached registry response | Could not start: next executable is not installed |
| Role/auth/navigation cleanup (final source commit) | Could not start: npm ENOTCACHED trying to resolve tsc; no cached registry response | Could not start: next executable is not installed |

Lint: npm run lint was attempted; could not start because eslint is not installed. Static alias-import scan found no unresolved @/ imports after pruning. git diff --check passed.
