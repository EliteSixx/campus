import pytest

from app import examples as ex
from app.schemas import Student
from app.services.readiness_service import compute_readiness


def _student(payload: dict) -> Student:
    return Student.model_validate(payload)


def test_higher_cgpa_never_lowers_readiness_score():
    student = _student(ex.STUDENT_ST001)
    higher_cgpa = student.model_copy(update={"cgpa": min(10, student.cgpa + 1)})
    assert compute_readiness(higher_cgpa)["score"] >= compute_readiness(student)["score"]


def test_more_backlogs_never_raise_readiness_score():
    student = _student(ex.STUDENT_ST001)
    more_backlogs = student.model_copy(update={"backlogs": student.backlogs + 1})
    assert compute_readiness(more_backlogs)["score"] <= compute_readiness(student)["score"]


def test_null_mock_interview_renormalises_breakdown_weights():
    student = _student(ex.STUDENT_ST001)
    result = compute_readiness(student)
    assert all(item["name"] != "mock_interview" for item in result["breakdown"])
    assert sum(item["weight"] for item in result["breakdown"]) == pytest.approx(1.0)


@pytest.mark.parametrize(
    ("payload", "expected_levels"),
    [
        (ex.STUDENT_ST001, {"READY"}),
        (ex.STUDENT_ST104, {"NOT_READY", "DEVELOPING"}),
    ],
)
def test_demo_students_have_expected_readiness_levels(payload, expected_levels):
    result = compute_readiness(_student(payload))
    assert result["level"].value in expected_levels


@pytest.mark.parametrize(
    "payload",
    [ex.STUDENT_ST001, ex.STUDENT_ST104],
)
def test_breakdown_weights_sum_to_one_for_demo_students(payload):
    result = compute_readiness(_student(payload))
    assert sum(item["weight"] for item in result["breakdown"]) == pytest.approx(1.0)


def test_readiness_response_has_contract_metadata():
    result = compute_readiness(_student(ex.STUDENT_ST001))
    assert result["meta"] == {"engine_version": "0.2.0", "stub": False}
