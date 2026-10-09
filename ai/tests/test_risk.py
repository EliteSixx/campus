import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.schemas import PredictPlacementResponse

client = TestClient(app)
def profile(student_id, cgpa, skills, mock, branch="CSE", backlogs=0, aptitude=80, communication=80):
    return {"student_id": student_id, "branch": branch, "cgpa": cgpa, "backlogs": backlogs,
            "graduation_year": 2026, "skills": skills, "certifications": [], "projects": [],
            "aptitude_score": aptitude, "communication_score": communication,
            "mock_interview_score": mock, "is_synthetic": True}


def test_st104_like_has_higher_risk_than_st001_like():
    payload_good = {"student": profile("ST001", 8.8, ["Python", "SQL", "Java", "Docker", "Git", "REST APIs", "Data Structures", "AWS"], 88),
                    "activity": {"drives_applied": 7, "shortlisted": 5, "interviews_attended": 4, "rejections": 1}}
    payload_risk = {"student": profile("ST104", 5.8, ["C"], None, backlogs=2, aptitude=35, communication=38),
                    "activity": {"drives_applied": 7, "shortlisted": 1, "interviews_attended": 1, "rejections": 6}}
    good = client.post("/ai/predict-placement", json=payload_good)
    risky = client.post("/ai/predict-placement", json=payload_risk)
    assert good.status_code == risky.status_code == 200
    good_body = PredictPlacementResponse.model_validate(good.json())
    risky_body = PredictPlacementResponse.model_validate(risky.json())
    assert risky_body.probability_unplaced > good_body.probability_unplaced


def test_response_matches_schema():
    payload = {"student": profile("ST104", 5.8, ["C"], None, backlogs=2), "activity": {}}
    response = client.post("/ai/predict-placement", json=payload)
    assert response.status_code == 200
    parsed = PredictPlacementResponse.model_validate(response.json())
    assert parsed.student_id == "ST104"
    assert parsed.risk in {"LOW", "MEDIUM", "HIGH"}
