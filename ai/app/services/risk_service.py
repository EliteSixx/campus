"""Model-backed placement risk prediction with a safe stub fallback."""
from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app import examples as ex
from app.schemas import PlacementActivity, Student
from app.services.readiness_service import compute_readiness

MODEL_PATH = Path(__file__).resolve().parents[1] / "models" / "risk_model.joblib"
FEATURE_NAMES = ["readiness_score", "academics_score", "technical_skills_score", "projects_score", "cgpa",
                 "backlogs", "skill_coverage", "aptitude_score", "communication_score", "drives_applied",
                 "shortlist_rate", "interviews_attended", "rejections", "mock_interview_score"]
_MODEL: dict[str, Any] | None = None
_MODEL_CHECKED = False


def features_for_student(student: Student, activity: PlacementActivity | dict[str, Any]) -> dict[str, float | None]:
    if isinstance(activity, dict):
        activity = PlacementActivity.model_validate(activity)
    readiness = compute_readiness(student)
    component = {item["name"]: item["score"] for item in readiness["breakdown"]}
    skills = len({skill.strip().casefold() for skill in student.skills if skill.strip()})
    drives = activity.drives_applied
    return {
        "readiness_score": float(readiness["score"]),
        "academics_score": float(component.get("academics", 0)),
        "technical_skills_score": float(component.get("technical_skills", 0)),
        "projects_score": float(component.get("projects", 0)),
        "cgpa": float(student.cgpa), "backlogs": float(student.backlogs),
        "skill_coverage": min(100.0, skills / 8 * 100),
        "aptitude_score": student.aptitude_score,
        "communication_score": student.communication_score,
        "drives_applied": float(drives),
        "shortlist_rate": (activity.shortlisted / drives * 100) if drives else 0.0,
        "interviews_attended": float(activity.interviews_attended),
        "rejections": float(activity.rejections),
        "mock_interview_score": student.mock_interview_score,
    }


def _load_model() -> dict[str, Any] | None:
    global _MODEL, _MODEL_CHECKED
    if not _MODEL_CHECKED:
        _MODEL_CHECKED = True
        if MODEL_PATH.exists():
            try:
                _MODEL = joblib.load(MODEL_PATH)
            except Exception:
                _MODEL = None
    return _MODEL


def _fallback(student_id: str) -> dict[str, Any]:
    return {**ex.PREDICT_PLACEMENT_RESPONSE, "student_id": student_id,
            "meta": {"engine_version": "0.2.0", "stub": True}}


_INTERVENTIONS = {
    "cgpa": "Meet a placement mentor to plan academic recovery and backlog clearance.",
    "backlogs": "Prioritize clearing active backlogs and confirm eligibility with the placement cell.",
    "readiness_score": "Create a weekly plan covering core skills, projects, and interview preparation.",
    "technical_skills_score": "Complete a focused course and build a project in a high demand technical skill.",
    "projects_score": "Build and document a practical project that demonstrates your target role skills.",
    "aptitude_score": "Practice timed quantitative, logical, and verbal aptitude questions each week.",
    "communication_score": "Practice structured answers and request feedback from a communication mentor.",
    "mock_interview_score": "Complete a mock interview and review the feedback before your next attempt.",
    "shortlist_rate": "Review role fit and tailor your resume to the required skills before applying.",
    "interviews_attended": "Schedule interview practice and attend every confirmed interview.",
    "rejections": "Ask for feedback after rejections and target the recurring gaps in your next applications.",
    "drives_applied": "Apply to more eligible placement drives that match your branch and skills.",
    "skill_coverage": "Map your skills to target job descriptions and close the most common missing skills.",
}
_LABELS = {"cgpa": "CGPA", "backlogs": "Active backlogs", "readiness_score": "Readiness", "technical_skills_score": "Technical skills",
           "projects_score": "Projects", "aptitude_score": "Aptitude", "communication_score": "Communication",
           "mock_interview_score": "Mock interview", "shortlist_rate": "Shortlist rate", "interviews_attended": "Interviews attended",
           "rejections": "Rejections", "drives_applied": "Applications", "skill_coverage": "Skill coverage"}


def predict_placement(student: Student, activity: PlacementActivity) -> dict[str, Any]:
    bundle = _load_model()
    if not bundle:
        return _fallback(student.student_id)
    values = features_for_student(student, activity)
    row = np.asarray([[values[name] for name in bundle["feature_names"]]], dtype=object)
    model = bundle["pipeline"]
    probability = float(model.predict_proba(row)[0][1])
    risk = "LOW" if probability < 0.35 else "MEDIUM" if probability <= 0.65 else "HIGH"
    # Explain with model-wide importance weighted by this student's distance from the training median.
    importances = bundle.get("feature_importances", {})
    centers = bundle.get("feature_medians", {})
    scales = bundle.get("feature_scales", {})
    candidates = []
    for name, importance in importances.items():
        value = values.get(name)
        if value is None:
            continue
        scale = max(float(scales.get(name, 1.0)), 1.0)
        delta = (float(value) - float(centers.get(name, value))) / scale
        # Direction is learned from the training data class means.
        direction = float(bundle.get("unplaced_directions", {}).get(name, 0.0))
        contribution = float(importance) * max(0.0, delta * direction)
        if contribution > 0:
            candidates.append((contribution, name))
    candidates.sort(reverse=True)
    reasons = [f"{_LABELS.get(name, name)} may increase placement risk." for _, name in candidates[:3]]
    interventions = [_INTERVENTIONS[name] for _, name in candidates[:3]]
    if not reasons:
        reasons = ["Current profile and placement activity indicate elevated placement risk."]
        interventions = ["Meet with the placement cell for a profile review and targeted placement plan."]
    return {"student_id": student.student_id, "risk": risk, "probability_unplaced": round(probability, 4),
            "reasons": reasons, "interventions": interventions,
            "meta": {"engine_version": "0.2.0", "stub": False}}
