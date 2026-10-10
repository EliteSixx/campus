import re

import pytest

from app import examples as ex
from app.schemas import Job, ReadinessLevel, Student
from app.services.matching_service import _fit_level, match


@pytest.mark.parametrize(
    ("score", "expected"),
    [
        (49, ReadinessLevel.NOT_READY),
        (50, ReadinessLevel.DEVELOPING),
        (69, ReadinessLevel.DEVELOPING),
        (70, ReadinessLevel.READY),
        (84, ReadinessLevel.READY),
        (85, ReadinessLevel.HIGHLY_EMPLOYABLE),
    ],
)
def test_fit_level_threshold_boundaries(score, expected):
    assert _fit_level(score, eligible=True) == expected


@pytest.mark.parametrize("score", [0, 49, 50, 69, 70, 84, 85, 100])
def test_ineligible_always_has_not_ready_fit_level(score):
    assert _fit_level(score, eligible=False) == ReadinessLevel.NOT_READY


def test_st001_fit_summary_uses_real_match_count_and_no_placeholders():
    request = ex.EXAMPLES["match.request"]
    result = match(Student.model_validate(request["student"]), Job.model_validate(request["job"]))

    assert result.fit_level in {ReadinessLevel.READY, ReadinessLevel.HIGHLY_EMPLOYABLE}
    assert "4 of 4 required skills" in result.summary
    assert "{" not in result.summary and "}" not in result.summary
    assert "<" not in result.summary and ">" not in result.summary
    assert "may" not in result.summary.casefold()
    assert len(result.summary) < 300


def test_st104_fit_summary_names_cgpa_and_backlog_failures():
    request = ex.EXAMPLES["match.request"]
    result = match(Student.model_validate(ex.STUDENT_ST104), Job.model_validate(request["job"]))

    assert result.fit_level == ReadinessLevel.NOT_READY
    assert "CGPA 6.1 is below the 7.0 minimum" in result.summary
    assert "2 active backlogs exceed the maximum of 0" in result.summary
    assert "may" not in result.summary.casefold()
    assert not re.search(r"\{[^}]+\}|<[^>]+>", result.summary)
    assert len(result.summary) < 300
