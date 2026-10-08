"""Explainable rule-based readiness scoring."""

import json
from pathlib import Path
from typing import Any

from app.schemas import ReadinessLevel, Student


_SKILLS_PATH = Path(__file__).resolve().parents[1] / "data" / "skills.json"
with _SKILLS_PATH.open(encoding="utf-8") as skills_file:
    SKILLS: dict[str, dict[str, Any]] = json.load(skills_file)

_BASE_WEIGHTS = {
    "academics": 0.25,
    "technical_skills": 0.35,
    "projects": 0.15,
    "aptitude": 0.15,
    "communication": 0.10,
}

_COMPONENT_LABELS = {
    "academics": "Academic performance",
    "technical_skills": "Technical skills",
    "projects": "Project experience",
    "aptitude": "Aptitude",
    "communication": "Communication",
    "mock_interview": "Mock interview",
}

_LOW_SCORE_GAPS = {
    "academics": (
        "Academic readiness is below target",
        "Improve your CGPA and clear active backlogs to strengthen academic eligibility.",
    ),
    "technical_skills": (
        "Technical skills need development",
        "Build proficiency in core placement skills and demonstrate them in a project.",
    ),
    "projects": (
        "Project experience needs development",
        "Complete a practical project that demonstrates the skills on your profile.",
    ),
    "aptitude": (
        "Aptitude score is below target",
        "Practice quantitative, logical, and verbal aptitude questions before retaking the assessment.",
    ),
    "communication": (
        "Communication score is below target",
        "Practice a structured mock interview and ask for feedback on your answers.",
    ),
    "mock_interview": (
        "Mock interview score is below target",
        "Complete a mock interview and review the feedback before your next attempt.",
    ),
}

_MISSING_ASSESSMENT_GAPS = {
    "aptitude": ("Aptitude assessment not yet taken", "Complete the aptitude assessment to identify areas to improve."),
    "communication": (
        "Communication assessment not yet taken",
        "Complete the communication assessment to establish a baseline and get targeted practice.",
    ),
    "mock_interview": (
        "Mock interview not yet attempted",
        "Take a mock interview to identify interview strengths and areas to improve.",
    ),
}


def _normalise_skill(skill: str) -> str:
    return skill.strip().casefold()


def _technical_skill_score(student: Student) -> float:
    skills = {_normalise_skill(skill) for skill in student.skills if skill.strip()}
    certification_skills = {_normalise_skill(skill) for skill in student.certifications if skill.strip()}
    demonstrated_skills = {
        _normalise_skill(tech)
        for project in student.projects
        for tech in project.tech
        if tech.strip()
    }

    points = 0.0
    categories: set[str] = set()
    for skill in skills:
        metadata = SKILLS.get(skill)
        # Uncatalogued skills still count as breadth, with a conservative weight.
        core_weight = float(metadata["core_weight"]) if metadata else 0.5
        points += 8 * core_weight
        if metadata:
            categories.add(str(metadata["category"]))
        if skill in demonstrated_skills:
            points += 8 * core_weight
        if skill in certification_skills:
            points += 4 * core_weight
    # A small breadth bonus rewards demonstrated coverage across skill categories.
    points += 1.5 * len(categories)
    return min(100.0, points)


def _project_score(student: Student) -> float:
    student_skills = {_normalise_skill(skill) for skill in student.skills if skill.strip()}
    overlap_count = sum(
        len({_normalise_skill(tech) for tech in project.tech if tech.strip()} & student_skills)
        for project in student.projects
    )
    return min(100.0, len(student.projects) * 25 + overlap_count * 10)


def _level_for(score: int) -> ReadinessLevel:
    if score < 50:
        return ReadinessLevel.NOT_READY
    if score < 70:
        return ReadinessLevel.DEVELOPING
    if score < 85:
        return ReadinessLevel.READY
    return ReadinessLevel.HIGHLY_EMPLOYABLE


def compute_readiness(student: Student) -> dict[str, Any]:
    """Score a student using assessment inputs, profile depth, and project evidence."""
    scores: dict[str, float | None] = {
        "academics": max(0.0, student.cgpa * 10 - student.backlogs * 10),
        "technical_skills": _technical_skill_score(student),
        "projects": _project_score(student),
        "aptitude": student.aptitude_score,
        "communication": student.communication_score,
        "mock_interview": student.mock_interview_score,
    }

    weights = dict(_BASE_WEIGHTS)
    if student.mock_interview_score is not None:
        weights = {name: weight * 0.9 for name, weight in weights.items()}
        weights["mock_interview"] = 0.10
    available = [name for name, score in scores.items() if score is not None]
    total_weight = sum(weights.get(name, 0.10) for name in available)
    breakdown = [
        {
            "name": name,
            "score": scores[name],
            "weight": weights.get(name, 0.10) / total_weight,
        }
        for name in scores
        if name in available
    ]

    weighted_score = sum(item["score"] * item["weight"] for item in breakdown)
    score = max(0, min(100, round(weighted_score)))

    strengths = [
        f"Strong {_COMPONENT_LABELS[item['name']].lower()} ({item['score']:.0f}/100)"
        for item in sorted(breakdown, key=lambda item: item["score"], reverse=True)
        if item["score"] > 75
    ]

    gaps: list[str] = []
    recommendations: list[str] = []
    for name, component_score in scores.items():
        if component_score is None:
            if name in _MISSING_ASSESSMENT_GAPS:
                gap, recommendation = _MISSING_ASSESSMENT_GAPS[name]
                gaps.append(gap)
                recommendations.append(recommendation)
        elif component_score < 60:
            gap, recommendation = _LOW_SCORE_GAPS[name]
            gaps.append(f"{gap} ({component_score:.0f}/100)")
            recommendations.append(recommendation)

    return {
        "student_id": student.student_id,
        "score": score,
        "level": _level_for(score),
        "strengths": strengths,
        "gaps": gaps,
        "recommendations": recommendations,
        "breakdown": breakdown,
        "meta": {"engine_version": "0.2.0", "stub": False},
    }
