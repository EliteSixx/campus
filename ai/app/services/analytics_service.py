"""Cached, data-derived placement analytics over the synthetic CSV bundle."""
import csv
import json
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path
from statistics import mean, median

import numpy as np

from app.schemas import (
    AnalyticsSummary,
    AtRiskCounts,
    PlacementActivity,
    Student,
)
from app.services.readiness_service import compute_readiness
from app.services import risk_service

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
SKILLS_PATH = Path(__file__).resolve().parents[1] / "data" / "skills.json"
CSV_FILES = ("students.csv", "jobs.csv", "applications.csv", "interviews.csv", "offers.csv")


class AnalyticsDataUnavailable(Exception):
    """Raised when a required synthetic analytics CSV is unavailable."""


@lru_cache(maxsize=1)
def load_csvs() -> dict[str, list[dict[str, str]]]:
    """Read the complete analytics dataset once per process after a successful load."""
    loaded: dict[str, list[dict[str, str]]] = {}
    for filename in CSV_FILES:
        path = DATA_DIR / filename
        try:
            with path.open(encoding="utf-8", newline="") as stream:
                loaded[filename.removesuffix(".csv")] = list(csv.DictReader(stream))
        except OSError as exc:
            raise AnalyticsDataUnavailable(f"Required analytics data file is unavailable: {filename}") from exc
    return loaded


@lru_cache(maxsize=1)
def _skill_aliases() -> dict[str, str]:
    with SKILLS_PATH.open(encoding="utf-8") as stream:
        entries = json.load(stream)
    aliases: dict[str, str] = {}
    for entry in entries:
        for name in [entry["name"], *entry.get("aliases", [])]:
            aliases[name.strip().casefold()] = entry["name"]
    return aliases


def _canonical_skill(name: str) -> str:
    cleaned = name.strip()
    return _skill_aliases().get(cleaned.casefold(), cleaned)


def _as_bool(value: str | None) -> bool:
    return (value or "").strip().casefold() in {"true", "1", "yes"}


def _as_optional_float(value: str | None) -> float | None:
    return float(value) if value not in (None, "") else None


def _student_from_row(row: dict[str, str]) -> Student:
    return Student.model_validate(
        {
            "student_id": row["student_id"],
            "branch": row["branch"],
            "cgpa": float(row["cgpa"]),
            "backlogs": int(row["backlogs"]),
            "graduation_year": int(row["graduation_year"]),
            "skills": json.loads(row["skills"]),
            "certifications": json.loads(row["certifications"]) if row.get("certifications") else [],
            "projects": json.loads(row["projects"]),
            "aptitude_score": _as_optional_float(row.get("aptitude_score")),
            "communication_score": _as_optional_float(row.get("communication_score")),
            "mock_interview_score": _as_optional_float(row.get("mock_interview_score")),
            "is_synthetic": _as_bool(row.get("is_synthetic")),
        }
    )


def _pct(numerator: int, denominator: int) -> float:
    return round(numerator * 100.0 / denominator, 2) if denominator else 0.0


def compute_analytics_summary() -> AnalyticsSummary:
    data = load_csvs()
    students = [_student_from_row(row) for row in data["students"]]
    jobs = data["jobs"]
    applications = data["applications"]
    interviews = data["interviews"]
    offers = data["offers"]

    students_by_id = {student.student_id: student for student in students}
    jobs_by_id = {job["job_id"]: job for job in jobs}
    apps_by_job: dict[str, list[dict[str, str]]] = defaultdict(list)
    apps_by_student: dict[str, list[dict[str, str]]] = defaultdict(list)
    for application in applications:
        apps_by_job[application["job_id"]].append(application)
        apps_by_student[application["student_id"]].append(application)

    interviews_by_job: dict[str, int] = Counter()
    interviews_by_student: dict[str, int] = Counter()
    for interview in interviews:
        if _as_bool(interview.get("attended")):
            interviews_by_job[interview["job_id"]] += 1
            interviews_by_student[interview["student_id"]] += 1

    accepted_offers = [offer for offer in offers if _as_bool(offer.get("accepted"))]
    accepted_student_ids = {offer["student_id"] for offer in accepted_offers}
    placed = len(accepted_student_ids)
    unplaced = len(students) - placed
    shortlisted_apps = [application for application in applications if _as_bool(application.get("shortlisted"))]
    placement_ready = sum(
        compute_readiness(student)["level"] in {"READY", "HIGHLY_EMPLOYABLE"}
        for student in students
    )

    students_by_branch: dict[str, list[Student]] = defaultdict(list)
    for student in students:
        students_by_branch[student.branch.value].append(student)
    placed_by_branch = Counter(
        students_by_id[student_id].branch.value
        for student_id in accepted_student_ids
        if student_id in students_by_id
    )
    branch_conversion = [
        {
            "branch": branch,
            "students": len(branch_students),
            "placed": placed_by_branch[branch],
            "conversion_pct": _pct(placed_by_branch[branch], len(branch_students)),
        }
        for branch, branch_students in sorted(students_by_branch.items())
    ]

    demand_by_skill: Counter[str] = Counter()
    for job in jobs:
        demand_by_skill.update({_canonical_skill(skill) for skill in json.loads(job["required_skills"])})
    students_by_skill: dict[str, set[str]] = defaultdict(set)
    for student in students:
        for skill in {_canonical_skill(item) for item in student.skills}:
            students_by_skill[skill].add(student.student_id)
    top_skills = sorted(demand_by_skill, key=lambda skill: (-demand_by_skill[skill], skill))[:15]
    skill_conversion = []
    for skill in top_skills:
        skill_student_ids = students_by_skill.get(skill, set())
        skill_placed = len(skill_student_ids & accepted_student_ids)
        skill_conversion.append(
            {
                "skill": skill,
                "students_with_skill": len(skill_student_ids),
                "placed_with_skill": skill_placed,
                "conversion_pct": _pct(skill_placed, len(skill_student_ids)),
                "demand_in_jobs": demand_by_skill[skill],
            }
        )

    job_ctcs: dict[str, float] = {}
    company_jobs: dict[str, list[dict[str, str]]] = defaultdict(list)
    branch_ctcs: dict[str, list[float]] = defaultdict(list)
    for job in jobs:
        company = job.get("company") or "Unknown"
        company_jobs[company].append(job)
        ctc = _as_optional_float(job.get("ctc_lpa"))
        if ctc is None:
            continue
        job_ctcs[job["job_id"]] = ctc
        branches = json.loads(job.get("eligible_branches") or "[]")
        if not branches:
            branches = list(students_by_branch)
        for branch in set(branches):
            branch_ctcs[branch].append(ctc)

    all_ctcs = list(job_ctcs.values())
    package_overall = {
        "average_ctc_lpa": round(mean(all_ctcs), 2) if all_ctcs else 0.0,
        "median_ctc_lpa": round(median(all_ctcs), 2) if all_ctcs else 0.0,
        "highest_ctc_lpa": max(all_ctcs, default=0.0),
    }
    package_per_branch = [
        {
            "branch": branch,
            "average_ctc_lpa": round(mean(branch_ctcs[branch]), 2) if branch_ctcs[branch] else 0.0,
            "highest_ctc_lpa": max(branch_ctcs[branch], default=0.0),
        }
        for branch in sorted(students_by_branch)
    ]
    offers_by_job: dict[str, list[dict[str, str]]] = defaultdict(list)
    accepted_by_company_job: dict[str, set[str]] = defaultdict(set)
    for offer in offers:
        offers_by_job[offer["job_id"]].append(offer)
        if _as_bool(offer.get("accepted")):
            job = jobs_by_id.get(offer["job_id"])
            if job:
                accepted_by_company_job[job.get("company") or "Unknown"].add(offer["job_id"])
    offers_by_company: Counter[str] = Counter()
    for job_id, job_offers in offers_by_job.items():
        company = (jobs_by_id.get(job_id) or {}).get("company") or "Unknown"
        offers_by_company[company] += len(job_offers)
    package_per_company = []
    for company, company_job_rows in sorted(company_jobs.items()):
        ctc_values = [
            float(job["ctc_lpa"])
            for job in company_job_rows
            if _as_optional_float(job.get("ctc_lpa")) is not None
        ]
        package_per_company.append(
            {
                "company": company,
                "average_ctc_lpa": round(mean(ctc_values), 2) if ctc_values else 0.0,
                "offers": offers_by_company[company],
            }
        )

    company_names = sorted(company_jobs)
    recruiter_pipeline = []
    for company in company_names:
        company_job_ids = {job["job_id"] for job in company_jobs[company]}
        company_apps = [app for job_id in company_job_ids for app in apps_by_job[job_id]]
        company_shortlisted = [app for app in company_apps if _as_bool(app.get("shortlisted"))]
        company_interviewed = sum(interviews_by_job[job_id] for job_id in company_job_ids)
        company_offers = [offer for offer in offers if offer["job_id"] in company_job_ids]
        company_accepted = [offer for offer in company_offers if _as_bool(offer.get("accepted"))]
        recruiter_pipeline.append(
            {
                "company": company,
                "jobs": len(company_job_ids),
                "applications": len(company_apps),
                "shortlisted": len(company_shortlisted),
                "interviewed": company_interviewed,
                "offers": len(company_offers),
                "accepted": len(company_accepted),
                "repeat_hiring": len(accepted_by_company_job[company]) > 1,
                "conversion_pct": _pct(len(company_accepted), len(company_apps)),
            }
        )

    at_risk: AtRiskCounts | None = None
    risk_bundle = risk_service._load_model()
    if students and risk_bundle:
        counts = {"low": 0, "medium": 0, "high": 0}
        for student in students:
            activity_apps = apps_by_student[student.student_id]
            applied_count = len(activity_apps)
            shortlisted_count = sum(_as_bool(app.get("shortlisted")) for app in activity_apps)
            activity = PlacementActivity(
                drives_applied=applied_count,
                shortlisted=shortlisted_count,
                interviews_attended=interviews_by_student[student.student_id],
                rejections=max(0, applied_count - shortlisted_count),
            )
            features = risk_service.features_for_student(student, activity)
            model_row = np.asarray(
                [[features[name] for name in risk_bundle["feature_names"]]], dtype=object
            )
            probability = float(risk_bundle["pipeline"].predict_proba(model_row)[0][1])
            risk_level = "LOW" if probability < 0.35 else "MEDIUM" if probability <= 0.65 else "HIGH"
            counts[risk_level.casefold()] += 1
        at_risk = AtRiskCounts(**counts)

    return AnalyticsSummary(
        totals={
            "students": len(students),
            "placement_ready": placement_ready,
            "jobs_with_applications": len({application["job_id"] for application in applications}),
            "applications": len(applications),
            "shortlisted": len(shortlisted_apps),
            "interviewed": sum(_as_bool(interview.get("attended")) for interview in interviews),
            "offers_made": len(offers),
            "offers_accepted": len(accepted_offers),
            "offers_not_accepted": len(offers) - len(accepted_offers),
            "placed": placed,
            "unplaced": unplaced,
        },
        branch_conversion=branch_conversion,
        skill_conversion=skill_conversion,
        package_trends={
            "overall": package_overall,
            "per_branch": package_per_branch,
            "per_company": package_per_company,
        },
        recruiter_pipeline=recruiter_pipeline,
        funnel={
            "applied": len(applications),
            "shortlisted": len(shortlisted_apps),
            "interviewed": sum(_as_bool(interview.get("attended")) for interview in interviews),
            "offered": len(offers),
            "accepted": len(accepted_offers),
        },
        at_risk=at_risk,
        data_source=(
            "Computed from the synthetic placement CSVs generated with seed 42. "
            "jobs_with_applications counts distinct jobs with applications. The synthetic data has no pending offer state; "
            "pending offers are tracked by the offer lifecycle screens. offers_not_accepted counts unaccepted offer records. "
            "offers_accepted counts offers while placed counts unique students, and a student can accept more than one offer."
        ),
    )
