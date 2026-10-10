import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.schemas import PredictPlacementResponse
from app.services import risk_service, skill_service

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


def test_reasons_are_specific_and_numeric():
    from app import examples as ex

    response = client.post("/ai/predict-placement", json=ex.EXAMPLES["predict-placement.request"])
    assert response.status_code == 200
    reasons = response.json()["reasons"]
    assert reasons
    assert all("may" not in reason.casefold() for reason in reasons)
    assert all(any(character.isdigit() for character in reason) for reason in reasons)


def _reset_risk_model_state():
    with risk_service._MODEL_LOCK:
        risk_service._MODEL = None
        risk_service._MODEL_CHECKED = False
        risk_service._MODEL_ERROR = None


def test_first_predict_call_after_startup_uses_loaded_risk_model(monkeypatch):
    _reset_risk_model_state()
    startup_calls = {"risk": 0, "embedding": 0}
    original_risk_loader = risk_service.load_model

    def load_risk_model():
        startup_calls["risk"] += 1
        return original_risk_loader()

    def load_embedding_model():
        startup_calls["embedding"] += 1
        return None  # Keep this test offline; an unavailable encoder uses alias-only matching.

    monkeypatch.setattr(risk_service, "load_model", load_risk_model)
    monkeypatch.setattr(skill_service, "load_model", load_embedding_model)
    from app import examples as ex

    with TestClient(app) as startup_client:
        assert startup_calls == {"risk": 1, "embedding": 1}
        assert risk_service.model_loaded()
        response = startup_client.post("/ai/predict-placement", json=ex.EXAMPLES["predict-placement.request"])
        assert response.status_code == 200, response.text
        assert response.json()["meta"]["stub"] is False


def test_concurrent_first_predict_calls_both_use_loaded_model(monkeypatch):
    _reset_risk_model_state()
    monkeypatch.setattr(skill_service, "load_model", lambda: None)
    from app import examples as ex

    with TestClient(app) as startup_client:
        payload = ex.EXAMPLES["predict-placement.request"]
        with ThreadPoolExecutor(max_workers=2) as pool:
            responses = list(pool.map(lambda _index: startup_client.post("/ai/predict-placement", json=payload), range(2)))
    assert all(response.status_code == 200 for response in responses)
    assert all(response.json()["meta"]["stub"] is False for response in responses)
