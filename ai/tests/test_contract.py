import copy
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import examples as ex
from app.main import app

client = TestClient(app)

ENDPOINTS = {
    "/ai/readiness": "readiness",
    "/ai/skill-gap": "skill-gap",
    "/ai/parse-job": "parse-job",
    "/ai/match": "match",
    "/ai/rank": "rank",
    "/ai/predict-placement": "predict-placement",
}


def test_health():
    assert client.get("/health").json()["status"] == "ok"


@pytest.mark.parametrize("path,name", ENDPOINTS.items())
def test_example_request_returns_valid_stub_response(path, name):
    r = client.post(path, json=ex.EXAMPLES[f"{name}.request"])
    assert r.status_code == 200, r.text
    if path == "/ai/predict-placement":
        expected_stub = not (Path(__file__).resolve().parents[1] / "app" / "models" / "risk_model.joblib").exists()
    else:
        expected_stub = False
    assert r.json()["meta"]["stub"] is expected_stub


def test_ids_are_echoed():
    body = copy.deepcopy(ex.EXAMPLES["readiness.request"])
    body["student"]["student_id"] = "ST999"
    assert client.post("/ai/readiness", json=body).json()["student_id"] == "ST999"


def test_null_scores_are_accepted():
    body = copy.deepcopy(ex.EXAMPLES["readiness.request"])
    body["student"]["aptitude_score"] = None
    body["student"]["mock_interview_score"] = None
    assert client.post("/ai/readiness", json=body).status_code == 200


def test_out_of_range_value_uses_standard_error_shape():
    body = copy.deepcopy(ex.EXAMPLES["readiness.request"])
    body["student"]["cgpa"] = 11
    r = client.post("/ai/readiness", json=body)
    assert r.status_code == 422
    err = r.json()["error"]
    assert err["code"] == "INVALID_INPUT"
    assert err["field"] == "student.cgpa"


def test_missing_required_field_uses_standard_error_shape():
    body = copy.deepcopy(ex.EXAMPLES["match.request"])
    del body["student"]["branch"]
    r = client.post("/ai/match", json=body)
    assert r.status_code == 422
    assert r.json()["error"]["field"] == "student.branch"


def test_unknown_branch_is_rejected():
    body = copy.deepcopy(ex.EXAMPLES["readiness.request"])
    body["student"]["branch"] = "Chemistry"
    assert client.post("/ai/readiness", json=body).status_code == 422
