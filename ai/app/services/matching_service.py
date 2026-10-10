"""Explainable job matching and ranking."""

from statistics import mean

from app.schemas import Job, MatchResult, RankedMatch, ReadinessLevel, Reason, ReasonType, Student
from app.services.readiness_service import compute_readiness
from app.services.skill_service import compare_skills


FIT_NOT_READY_MAX = 49
FIT_DEVELOPING_MIN = 50
FIT_DEVELOPING_MAX = 69
FIT_READY_MIN = 70
FIT_READY_MAX = 84
FIT_HIGHLY_EMPLOYABLE_MIN = 85

_FIT_LABELS = {
    ReadinessLevel.NOT_READY: "Not ready",
    ReadinessLevel.DEVELOPING: "Developing",
    ReadinessLevel.READY: "Ready",
    ReadinessLevel.HIGHLY_EMPLOYABLE: "Highly employable",
}


def _branch_name(branch) -> str:
    return branch.value if hasattr(branch, "value") else str(branch)


def _project_score(student: Student, job: Job) -> float:
    if not student.projects or not job.required_skills:
        return 0.0
    project_tech = [tech for project in student.projects for tech in project.tech]
    comparison = compare_skills(project_tech, job.required_skills)
    overlap = len(comparison["matched_required"])
    if overlap == 0:
        return 0.0
    coverage = overlap / len(job.required_skills)
    # A relevant project establishes a baseline; deeper job-skill overlap adds up to 50 points.
    return min(100.0, 50.0 + 50.0 * coverage)


def _fit_level(match_score: int, eligible: bool) -> ReadinessLevel:
    if not eligible or match_score <= FIT_NOT_READY_MAX:
        return ReadinessLevel.NOT_READY
    if FIT_DEVELOPING_MIN <= match_score <= FIT_DEVELOPING_MAX:
        return ReadinessLevel.DEVELOPING
    if FIT_READY_MIN <= match_score <= FIT_READY_MAX:
        return ReadinessLevel.READY
    return ReadinessLevel.HIGHLY_EMPLOYABLE


def _fit_summary(
    student: Student,
    job: Job,
    eligible: bool,
    comparison: dict,
    branch_pass: bool,
    cgpa_pass: bool,
    backlog_pass: bool,
    fit_level: ReadinessLevel,
    breakdown: list[dict],
) -> str:
    required_count = len(job.required_skills)
    matched_count = len(comparison["matched_required"])
    skill_count = f"{matched_count} of {required_count} required skills matched"

    def compact_skills(skills: list[str]) -> str:
        names = ", ".join(skills[:3])
        if len(skills) > 3:
            names += f" and {len(skills) - 3} more"
        return names

    if not eligible:
        failures = []
        if not cgpa_pass:
            failures.append(
                f"CGPA {student.cgpa:.1f} is below the {job.min_cgpa:.1f} minimum"
            )
        if not backlog_pass:
            failures.append(
                f"{student.backlogs} active backlogs exceed the maximum of {job.max_backlogs}"
            )
        if not branch_pass:
            branches = ", ".join(_branch_name(branch) for branch in job.eligible_branches)
            failures.append(
                f"branch {_branch_name(student.branch)} is outside the eligible branches ({branches})"
            )
        gap = "; ".join(failures)
        return f"{_FIT_LABELS[fit_level]}: {gap}; {skill_count}."[:299]

    passed = f"CGPA {student.cgpa:.1f} meets the {job.min_cgpa:.1f} minimum and {matched_count} of {required_count} required skills match"
    if job.max_backlogs is not None:
        passed += f", and {student.backlogs} active backlogs meet the maximum of {job.max_backlogs}"
    if job.eligible_branches:
        passed += f", and {_branch_name(student.branch)} is an eligible branch"

    missing_required = comparison["missing_required"]
    missing_preferred = comparison["missing_preferred"]
    if missing_required:
        largest_gap = "required skills missing: " + compact_skills(missing_required)
    elif missing_preferred:
        largest_gap = "the preferred skill " + compact_skills(missing_preferred)
    else:
        project_score = next(item["score"] for item in breakdown if item["name"] == "projects")
        readiness_score = next(item["score"] for item in breakdown if item["name"] == "readiness")
        if project_score < 100:
            largest_gap = f"project overlap scored {project_score:.0f} of 100"
        elif readiness_score < 100:
            largest_gap = f"readiness score is {readiness_score:.0f} of 100"
        else:
            largest_gap = "no material fit gap was found"
    return f"{_FIT_LABELS[fit_level]}: {passed}, but the largest gap is {largest_gap}."[:299]


def match(student: Student, job: Job) -> MatchResult:
    """Score one student's fit for a job and report every eligibility gate."""
    reasons: list[Reason] = []

    cgpa_pass = student.cgpa >= job.min_cgpa
    reasons.append(
        Reason(
            type=ReasonType.PASS if cgpa_pass else ReasonType.FAIL,
            text=(
                f"CGPA {student.cgpa:.1f} meets the minimum of {job.min_cgpa:.1f}"
                if cgpa_pass
                else f"CGPA {student.cgpa:.1f} is below the minimum of {job.min_cgpa:.1f}"
            ),
        )
    )

    backlog_pass = job.max_backlogs is None or student.backlogs <= job.max_backlogs
    if job.max_backlogs is None:
        backlog_text = "No maximum backlog limit specified"
    elif backlog_pass:
        backlog_text = f"{student.backlogs} active backlogs meet the maximum of {job.max_backlogs}"
    else:
        backlog_text = (
            f"{student.backlogs} active backlogs exceed the maximum of {job.max_backlogs}"
        )
    reasons.append(
        Reason(type=ReasonType.PASS if backlog_pass else ReasonType.FAIL, text=backlog_text)
    )

    student_branch = _branch_name(student.branch)
    eligible_branches = [_branch_name(branch) for branch in job.eligible_branches]
    branch_pass = not eligible_branches or student_branch in eligible_branches
    if not eligible_branches:
        branch_text = "All branches are eligible"
    elif branch_pass:
        branch_text = f"{student_branch} is an eligible branch"
    else:
        branch_text = (
            f"{student_branch} is not eligible; eligible branches are "
            f"{', '.join(eligible_branches)}"
        )
    reasons.append(
        Reason(type=ReasonType.PASS if branch_pass else ReasonType.FAIL, text=branch_text)
    )
    eligible = cgpa_pass and backlog_pass and branch_pass

    comparison = compare_skills(
        student.skills,
        job.required_skills,
        job.preferred_skills,
    )
    required_count = len(job.required_skills)
    skills_score = (
        comparison["coverage_pct"]
        if required_count
        else 100.0
    )
    skills_score = max(0.0, skills_score - 2.0 * len(comparison["missing_preferred"]))
    if required_count:
        skill_type = ReasonType.PASS if not comparison["missing_required"] else ReasonType.WARN
        reasons.append(
            Reason(
                type=skill_type,
                text=(
                    f"Matches {len(comparison['matched_required'])} of "
                    f"{required_count} required skills"
                ),
            )
        )
    else:
        reasons.append(Reason(type=ReasonType.PASS, text="No required skills listed for this role"))
    for skill in comparison["missing_required"]:
        reasons.append(Reason(type=ReasonType.WARN, text=f"Missing required skill: {skill}"))
    for skill in comparison["missing_preferred"]:
        reasons.append(Reason(type=ReasonType.WARN, text=f"Missing preferred skill: {skill}"))

    projects_score = _project_score(student, job)
    reasons.append(
        Reason(
            type=ReasonType.PASS if projects_score > 0 else ReasonType.WARN,
            text=(
                f"Project technology overlaps {projects_score:.0f}% with required skills"
                if projects_score > 0
                else "No project technology overlaps the required skills"
            ),
        )
    )

    readiness_score = float(compute_readiness(student)["score"])
    reasons.append(
        Reason(
            type=ReasonType.PASS if readiness_score >= 70 else ReasonType.WARN,
            text=f"Placement readiness score is {readiness_score:.0f}",
        )
    )

    assessment_scores = [
        score
        for score in (
            student.aptitude_score,
            student.communication_score,
            student.mock_interview_score,
        )
        if score is not None
    ]
    if assessment_scores:
        assessments_score = mean(assessment_scores)
        reasons.append(
            Reason(
                type=ReasonType.PASS if assessments_score >= 60 else ReasonType.WARN,
                text=(
                    f"Assessment average from {len(assessment_scores)} completed assessments "
                    f"is {assessments_score:.1f}"
                ),
            )
        )
    else:
        # ScoreComponent cannot express null; use a neutral midpoint and make it explicit.
        assessments_score = 50.0
        reasons.append(
            Reason(
                type=ReasonType.WARN,
                text="No assessment scores are available; a neutral score of 50 was used",
            )
        )

    breakdown = [
        {"name": "skills", "score": skills_score, "weight": 0.5},
        {"name": "projects", "score": projects_score, "weight": 0.2},
        {"name": "readiness", "score": readiness_score, "weight": 0.2},
        {"name": "assessments", "score": assessments_score, "weight": 0.1},
    ]
    match_score = round(
        sum(component["score"] * component["weight"] for component in breakdown)
    )
    if not eligible:
        match_score = min(match_score, 40)

    fit_level = _fit_level(match_score, eligible)
    summary = _fit_summary(
        student,
        job,
        eligible,
        comparison,
        branch_pass,
        cgpa_pass,
        backlog_pass,
        fit_level,
        breakdown,
    )

    return MatchResult(
        student_id=student.student_id,
        job_id=job.job_id,
        match_score=match_score,
        eligible=eligible,
        matched_skills=comparison["matched_required"] + comparison["matched_preferred"],
        skill_gaps=comparison["missing_required"] + comparison["missing_preferred"],
        reasons=reasons,
        breakdown=breakdown,
        fit_level=fit_level,
        summary=summary,
    )


def rank(job: Job, students: list[Student]) -> list[RankedMatch]:
    """Match and deterministically order up to 500 students for a job."""
    results = [match(student, job) for student in students]
    results.sort(key=lambda result: (not result.eligible, -result.match_score))
    return [
        RankedMatch(**result.model_dump(), rank=position)
        for position, result in enumerate(results, start=1)
    ]
