import time

from fastapi.testclient import TestClient

from app import examples as ex
from app.main import app
from app.schemas import Job, Student, TargetRole
from app.services import skill_service
from app.services.matching_service import match, rank
from app.services.skill_service import compare_skills, skill_gap


client = TestClient(app)


def _student(data):
    return Student.model_validate(data)


def _job(data):
    return Job.model_validate(data)


def test_st001_matches_job001_as_eligible_with_high_score():
    request = ex.EXAMPLES["match.request"]
    result = match(_student(request["student"]), _job(request["job"]))

    assert result.eligible is True
    assert result.match_score >= 85
    assert result.model_dump()["breakdown"] == [
        {"name": "skills", "score": 98.0, "weight": 0.5},
        {"name": "projects", "score": 75.0, "weight": 0.2},
        {"name": "readiness", "score": 74.0, "weight": 0.2},
        {"name": "assessments", "score": 68.5, "weight": 0.1},
    ]


def test_st104_fails_cgpa_and_backlog_eligibility_gates():
    request = ex.EXAMPLES["match.request"]
    result = match(_student(ex.STUDENT_ST104), _job(request["job"]))

    assert result.eligible is False
    assert result.match_score <= 40
    failures = [reason.text.lower() for reason in result.reasons if reason.type.value == "FAIL"]
    assert any("cgpa" in reason for reason in failures)
    assert any("backlog" in reason for reason in failures)


def test_skill_gap_contract_example_has_67_percent_required_coverage():
    request = ex.EXAMPLES["skill-gap.request"]
    response = skill_gap(
        _student(request["student"]),
        TargetRole.model_validate(request["target"]),
    )
    assert response.coverage_pct == 67
    assert response.meta.stub is False
    assert [item.skill for item in response.missing_skills] == ["AWS", "Redis", "Kubernetes"]
    assert [item.priority.value for item in response.missing_skills] == ["HIGH", "MEDIUM", "LOW"]


def test_rank_places_st001_above_st104():
    request = ex.EXAMPLES["rank.request"]
    ranked = rank(_job(request["job"]), [_student(item) for item in request["students"]])
    assert [item.student_id for item in ranked] == ["ST001", "ST104"]
    assert [item.rank for item in ranked] == [1, 2]


def test_adding_a_matching_required_skill_never_lowers_match_score():
    request = ex.EXAMPLES["match.request"]
    student = _student(request["student"])
    job = _job(request["job"]).model_copy(
        update={"required_skills": [*request["job"]["required_skills"], "AWS"]}
    )
    with_gap = match(student, job).match_score
    with_added_skill = match(
        student.model_copy(update={"skills": [*student.skills, "Amazon Web Services"]}),
        job,
    ).match_score
    assert with_added_skill >= with_gap


def test_semantic_matches_at_or_above_threshold(monkeypatch):
    monkeypatch.setattr(skill_service, "_semantic_similarity", lambda _left, _right: 0.75)
    comparison = compare_skills(["PostgreSQL"], ["SQL"])
    assert comparison["matched_required"] == ["SQL"]
    assert comparison["coverage_pct"] == 100


def test_match_and_rank_endpoints_return_real_service_metadata():
    match_response = client.post("/ai/match", json=ex.EXAMPLES["match.request"]).json()
    rank_response = client.post("/ai/rank", json=ex.EXAMPLES["rank.request"]).json()
    gap_response = client.post("/ai/skill-gap", json=ex.EXAMPLES["skill-gap.request"]).json()

    assert match_response["meta"] == {"engine_version": "0.2.0", "stub": False}
    assert rank_response["meta"] == {"engine_version": "0.2.0", "stub": False}
    assert gap_response["meta"] == {"engine_version": "0.2.0", "stub": False}
    assert match_response == ex.MATCH_RESPONSE
    assert rank_response == ex.RANK_RESPONSE
    assert gap_response == ex.SKILL_GAP_RESPONSE


def test_rank_of_500_students_completes_under_five_seconds():
    request = ex.EXAMPLES["rank.request"]
    students = [_student(ex.STUDENT_ST001) for _ in range(500)]
    start = time.perf_counter()
    ranked = rank(_job(request["job"]), students)
    elapsed = time.perf_counter() - start

    assert len(ranked) == 500
    assert elapsed < 5
