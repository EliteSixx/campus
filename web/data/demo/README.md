# CampusLink demo seed

The records in this folder are isolated demo seeds. `ST001`, `ST104`, and `JOB001` match the published contract examples; custom drive, application, and offer records use local TypeScript types because the AI contract does not define those business entities.

## Demo story

1. **Profile:** Open the eleven student profiles, starting with strong backend candidate ST001 and at-risk candidate ST104.
2. **Readiness:** Compare ST001's backend skills and project evidence with ST104's lower CGPA, active backlogs, and assessment scores.
3. **JD parse:** Parse the Acme Tech Backend Developer role and inspect its required Python, SQL, REST APIs, and Docker skills.
4. **Ranking:** Rank all eleven student profiles against JOB001, JOB002, and JOB005. The backend, data analyst, and frontend skill requirements produce different top candidates.
5. **Conflict:** Schedule Acme and Northstar on October 22, 2026, from 10:00 to 12:00. They deliberately share ST001 and ST008, Seminar Hall 1, and Panel A, so student, venue, and panel conflicts are visible. The PixelForge frontend drive is on October 27 from 10:00 to 12:00 at Seminar Hall 2 with Panel B and students ST007, ST002, ST004, and ST006; ST007 and ST002 also appear on the Acme roster. All slots fall within the requested October 19 to 30 free window, before the supplied November 2 to 9 Class Test II and November 20 to December 19 exam periods.
6. **Offer and at-risk follow-up:** Show ST001's Acme Tech offer at 8 LPA, July 1, 2027 joining date, and document checklist; then review ST104's activity of six applications, zero shortlists, and six rejections.

## Drive schedule

| Drive | Date | Time | Venue | Panel | Job | Students |
| --- | --- | --- | --- | --- | --- | --- |
| Acme | 2026-10-22 | 10:00-12:00 | Seminar Hall 1 | Panel A | JOB001 | ST001, ST002, ST007, ST008 |
| Northstar | 2026-10-22 | 10:00-12:00 | Seminar Hall 1 | Panel A | JOB002 | ST001, ST003, ST008, ST104 |
| PixelForge | 2026-10-27 | 10:00-12:00 | Seminar Hall 2 | Panel B | JOB005 | ST007, ST002, ST004, ST006 |

## Expected ranking results

Engine version **0.2.0**. Scores below come from running the AI service locally on **2026-10-09** with all eleven demo students in each `/ai/rank` request.

| Job | Top two students (match score) | Ineligible students (first FAIL reason) |
| --- | --- | --- |
| JOB001, Acme Tech, Backend Developer | ST001 (86), ST008 (61) | ST004: "EEE is not eligible; eligible branches are CSE, IT"; ST003: "ECE is not eligible; eligible branches are CSE, IT"; ST006: "CE is not eligible; eligible branches are CSE, IT"; ST104: "CGPA 6.1 is below the minimum of 7.0"; ST010: "ME is not eligible; eligible branches are CSE, IT"; ST005: "CGPA 6.9 is below the minimum of 7.0"; ST009: "CGPA 6.5 is below the minimum of 7.0" |
| JOB002, Northstar Analytics, Data Analyst | ST008 (90), ST001 (70) | ST004: "EEE is not eligible; eligible branches are CSE, IT, ECE"; ST104: "CGPA 6.1 is below the minimum of 6.5"; ST006: "CE is not eligible; eligible branches are CSE, IT, ECE"; ST010: "ME is not eligible; eligible branches are CSE, IT, ECE"; ST005: "ME is not eligible; eligible branches are CSE, IT, ECE"; ST009: "2 active backlogs exceed the maximum of 1" |
| JOB005 - PixelForge, Frontend Developer | ST007 (84), ST002 (38) | ST005 - "CGPA 6.9 is below the minimum of 7.0"; ST009 - "CGPA 6.5 is below the minimum of 7.0"; ST104 - "CGPA 6.1 is below the minimum of 7.0" |

The official [BPUT academic calendar page](https://www.bput.ac.in/academic-calendar.html) lists the Odd Semester 2026 to 27 calendar. The exact assessment and examination dates above are the dates supplied for this demo's scheduling window.
