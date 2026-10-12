# CampusLink six-minute demo walkthrough

Start the web app and AI service before the walkthrough. The Student and Placement Cell demo routes run in the web app; the recruiting AI endpoints and analytics summary are exercised in FastAPI Swagger at `http://localhost:8000/docs` because those exact API-backed recruiter and analytics views do not yet have dedicated web routes.

## 0:00-1:00 - Profile

**Click:** In the web app, choose the Student role if needed, open **Profile** (`/profile`), and point to the loaded demo profile **ST001, Aarav Sharma**. The profile's AI experience uses ST001 as its demo student.

**Say:** "CampusLink starts with one student record that carries academics, skills, projects, and assessment results into the rest of the placement flow. I'll follow ST001, a CSE student targeting backend roles, then compare the same workflow with ST104, our at-risk example."

## 1:00-2:00 - Readiness and skill gap

**Click:** On `/profile`, scroll to **Your Career Readiness** and leave the target role set to **Backend Developer**. Point out the readiness card and the role gap analysis. For the comparison, open Swagger's `POST /ai/readiness` and submit the ST104 record from `web/data/demo/students.ts`.

**Say:** "For ST001, the service evaluates readiness and shows the skills that match or remain missing for JOB001's Backend Developer requirements. ST104 makes the contrast concrete: the lower CGPA and active backlogs affect readiness, and the skill-gap response separates matched skills from gaps. These are service results from the demo records, not values typed into the presentation."

## 2:00-3:00 - Recruiter JD and ranking with explanations

**Click:** In Swagger, open `POST /ai/parse-job` and submit the sample Backend Developer JD. Then open `POST /ai/match` for **ST001 x JOB001 (Acme Tech, Backend Developer)** and **ST104 x JOB001**; inspect each `fit_level`, `summary`, and reasons. Open `POST /ai/rank` for the three drive jobs: **JOB001 Acme Tech**, **JOB002 Northstar Analytics**, and **JOB005 PixelForge**, using the demo student list.

**Say:** "The parser turns recruiter text into eligibility and skill fields. Matching keeps eligibility gates explicit, then returns a fit level and a plain-language explanation. Ranking is job-specific: Acme is a backend role, Northstar is a data role, and PixelForge is a frontend role, so the strongest candidates can change with the job."

## 3:00-4:00 - Scheduler clash and suggested slot

**Click:** Switch to the Placement Cell role, open **Placement Drives** (`/dashboard/institution/drives`), and keep the **Conflict-Aware Placement Drive Scheduler** tab selected. Select **DRIVE-NORTHSTAR-2026-01 - Northstar Analytics Data Analyst Drive**; compare it with **DRIVE-ACME-2026-01 - Acme Tech Backend Developer Drive** on October 22, 2026, 10:00-12:00. Point out the shared students **ST001** and **ST008**, venue **Seminar Hall 1**, and **Panel A**. Select the first displayed conflict-free suggestion for the Northstar drive.

**Say:** "The conflict check finds the student, room, and panel collision instead of silently double-booking any resource. I'll move the Northstar drive to a suggested free slot; the PixelForge drive, **DRIVE-PIXELFORGE-2026-01 / JOB005**, is already separate on October 27 at Seminar Hall 2 with Panel B."

## 4:00-5:00 - Offer and notifications

**Click:** Switch to Student, open **Offers** (`/offers`), and select **OFFER-ACME-ST001**, the Acme Tech Backend Developer offer for ST001. Review the 8 LPA details, joining date, document checklist, and lifecycle timeline. Open the top-navbar notification bell.

**Say:** "Selection flows into the same student journey: the offer, acceptance decision, onboarding documents, and joining date are visible together. Notifications are generated from offer deadlines and lifecycle state, so the student can open the relevant offer directly from the bell."

## 5:00-6:00 - Analytics and at-risk escalation

**Click:** In Swagger, run `GET /ai/analytics/summary` and point to `totals`, `branch_conversion`, and the funnel. Then open the Mentor screen (`/dashboard/faculty`), select **ST104**, and open the escalation action for that student. The demo activity is six drives applied, zero shortlisted, zero interviews, and six rejections.

**Say:** "The summary aggregates branch conversion, recruiter pipeline, offers, and funnel totals from the synthetic cohort. ST104's risk prediction combines that student's profile and placement activity; the Mentor can review the evidence and escalate support. This is a synthetic demo, and the analytics summary is currently presented through the API rather than a dedicated web analytics page."
