"""Generate reproducible synthetic placement data for model development."""
import csv
import json
import random
from pathlib import Path

SEED = 42
OUT = Path(__file__).resolve().parent
ROOT = OUT.parent
BRANCHES = ["CSE", "IT", "ECE", "EEE", "ME", "CE"]
BRANCH_SKILLS = {
    "CSE": ["Python", "Java", "C++", "Data Structures", "Algorithms", "SQL", "Machine Learning", "Docker", "Git", "REST APIs", "JavaScript", "React"],
    "IT": ["Python", "Java", "SQL", "JavaScript", "React", "Node.js", "AWS", "Docker", "Git", "REST APIs", "Linux", "MongoDB"],
    "ECE": ["C", "C++", "Python", "MATLAB", "Embedded Systems", "VLSI", "Verilog", "Arduino", "Linux", "IoT", "Signal Processing"],
    "EEE": ["C", "MATLAB", "Embedded Systems", "PLC", "Power Systems", "Electrical Design", "Python", "Arduino", "IoT"],
    "ME": ["AutoCAD", "SolidWorks", "Manufacturing", "Thermodynamics", "ANSYS", "CATIA", "MATLAB", "Python", "Project Management"],
    "CE": ["AutoCAD", "Revit", "Structural Analysis", "STAAD.Pro", "Civil 3D", "Project Management", "Surveying", "BIM", "Excel"],
}
COMPANIES = ["Aster Systems", "BluePeak", "Cedar Labs", "Dawn Technologies", "Eastwind", "FinchWorks", "Granite Digital", "Harbor Tech", "Ionix", "Juniper Group"]


def write_csv(name, rows, fields):
    with (OUT / name).open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def clamp(value, low, high):
    return max(low, min(high, value))


def main():
    rng = random.Random(SEED)
    catalog = json.loads((ROOT / "app" / "data" / "skills.json").read_text(encoding="utf-8"))
    all_skills = [entry["name"] for entry in catalog]
    students = []
    for i in range(1500):
        branch = rng.choices(BRANCHES, weights=[26, 19, 17, 12, 14, 12])[0]
        cgpa = round(clamp(rng.gauss(7.2, 0.9), 5, 10), 2)
        backlog = rng.choices([0, 1, 2, 3], weights=[0.72, 0.18, 0.075, 0.025])[0]
        aptitude = round(clamp(cgpa * 7.0 + rng.gauss(19, 13), 20, 100), 1)
        communication = round(clamp(cgpa * 6.5 + rng.gauss(23, 14), 20, 100), 1)
        mock = None if rng.random() < 0.32 else round(clamp(aptitude * 0.35 + communication * 0.4 + cgpa * 2 + rng.gauss(5, 15), 20, 100), 1)
        pool = list(dict.fromkeys(BRANCH_SKILLS[branch] + rng.sample(all_skills, 12)))
        skills = rng.sample(pool, k=min(len(pool), rng.randint(4, 10)))
        projects = []
        for p in range(rng.choices([0, 1, 2, 3], [0.12, 0.43, 0.34, 0.11])[0]):
            tech = rng.sample(skills, k=min(len(skills), rng.randint(2, 4)))
            projects.append({"title": f"{branch} Project {i + 1}-{p + 1}", "tech": tech})
        students.append({"student_id": f"ST{i + 1:04d}", "branch": branch, "cgpa": cgpa, "backlogs": backlog,
                         "graduation_year": 2026, "skills": json.dumps(skills), "projects": json.dumps(projects),
                         "aptitude_score": aptitude, "communication_score": communication, "mock_interview_score": mock,
                         "is_synthetic": True})

    jobs = []
    for j in range(60):
        branch = BRANCHES[j % len(BRANCHES)]
        pool = list(dict.fromkeys(BRANCH_SKILLS[branch] + rng.sample(all_skills, 10)))
        required = rng.sample(pool, k=rng.randint(3, 6))
        preferred = [s for s in rng.sample(all_skills, 3) if s not in required]
        jobs.append({"job_id": f"JOB{j + 1:03d}", "company": rng.choice(COMPANIES), "role": f"{required[0]} {['Engineer', 'Developer', 'Analyst'][j % 3]}",
                     "min_cgpa": round(rng.uniform(6.0, 8.0), 1), "max_backlogs": rng.choice([0, 0, 1, 2]),
                     "eligible_branches": json.dumps([branch] if rng.random() < 0.75 else [branch, BRANCHES[(j + 1) % 6]]),
                     "required_skills": json.dumps(required), "preferred_skills": json.dumps(preferred), "ctc_lpa": round(rng.uniform(3.5, 18), 1)})

    application_rows, interview_rows, offer_rows = [], [], []
    for student in students:
        skills = set(json.loads(student["skills"]))
        eligible = [job for job in jobs if student["branch"] in json.loads(job["eligible_branches"])
                    and student["cgpa"] >= job["min_cgpa"] and student["backlogs"] <= job["max_backlogs"]]
        chosen = rng.sample(eligible, k=min(len(eligible), rng.randint(2, 8))) if eligible else []
        for job in chosen:
            required = json.loads(job["required_skills"])
            overlap = sum(skill in skills for skill in required) / len(required)
            signal = 0.35 * overlap + 0.025 * (student["cgpa"] - 7) + rng.gauss(0, 0.32)
            shortlist = signal > 0.30
            if rng.random() < 0.17:
                shortlist = not shortlist
            app_id = f"APP{len(application_rows) + 1:06d}"
            application_rows.append({"application_id": app_id, "student_id": student["student_id"], "job_id": job["job_id"],
                                     "skill_match": round(overlap, 3), "shortlisted": shortlist, "is_synthetic": True})
            if shortlist:
                attended = rng.random() < (0.77 + min(0.15, overlap * 0.15))
                interview_id = f"INT{len(interview_rows) + 1:06d}"
                interview_rows.append({"interview_id": interview_id, "application_id": app_id, "student_id": student["student_id"],
                                       "job_id": job["job_id"], "attended": attended, "score": round(clamp((student["communication_score"] + (student["mock_interview_score"] or 55)) / 2 + rng.gauss(0, 18), 0, 100), 1) if attended else None,
                                       "is_synthetic": True})
                if attended:
                    outcome_signal = 0.24 * overlap + 0.012 * (student["cgpa"] - 7) + 0.001 * ((student["mock_interview_score"] or 55) - 55) + rng.gauss(0, 0.55)
                    offer = outcome_signal > 0.25
                    if rng.random() < 0.17:
                        offer = not offer
                    if offer:
                        accepted = rng.random() < 0.90
                        offer_rows.append({"offer_id": f"OFF{len(offer_rows) + 1:06d}", "student_id": student["student_id"], "job_id": job["job_id"],
                                           "application_id": app_id, "accepted": accepted, "is_synthetic": True})

    write_csv("students.csv", students, list(students[0]))
    write_csv("jobs.csv", jobs, list(jobs[0]))
    write_csv("applications.csv", application_rows, list(application_rows[0]))
    write_csv("interviews.csv", interview_rows, list(interview_rows[0]))
    write_csv("offers.csv", offer_rows, list(offer_rows[0]))
    print(f"Generated students={len(students)} jobs={len(jobs)} applications={len(application_rows)} interviews={len(interview_rows)} offers={len(offer_rows)} seed={SEED}")


if __name__ == "__main__":
    main()
