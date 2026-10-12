import time

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas import AnalyticsSummary
from app.services import analytics_service

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_summary_cache_between_tests():
    analytics_service.clear_summary_cache()
    yield
    analytics_service.clear_summary_cache()


def test_analytics_summary_is_consistent_and_validates_against_schema():
    response = client.get("/ai/analytics/summary")
    assert response.status_code == 200, response.text
    summary = AnalyticsSummary.model_validate(response.json())

    totals = summary.totals
    assert totals.offers_accepted <= totals.offers_made
    assert totals.offers_not_accepted == totals.offers_made - totals.offers_accepted
    assert totals.offers_made <= totals.interviewed
    assert totals.interviewed <= totals.shortlisted
    assert totals.shortlisted <= totals.applications
    assert sum(branch.placed for branch in summary.branch_conversion) == totals.placed
    assert totals.placed + totals.unplaced == totals.students
    assert "jobs_with_applications" in summary.data_source
    assert "no pending offer state" in summary.data_source
    assert "a student can accept more than one offer" in summary.data_source

    percentages = [branch.conversion_pct for branch in summary.branch_conversion]
    percentages += [skill.conversion_pct for skill in summary.skill_conversion]
    percentages += [recruiter.conversion_pct for recruiter in summary.recruiter_pipeline]
    assert all(0 <= percentage <= 100 for percentage in percentages)


def test_cached_summary_is_equal_and_second_call_is_fast():
    first = analytics_service.compute_analytics_summary().model_dump(mode="json")
    started = time.perf_counter()
    second = analytics_service.compute_analytics_summary().model_dump(mode="json")
    elapsed = time.perf_counter() - started
    assert second == first
    assert elapsed < 0.5, f"cached analytics call took {elapsed:.3f}s"


def test_missing_csv_returns_standard_503_error(monkeypatch):
    analytics_service.load_csvs.cache_clear()
    missing_dir = analytics_service.DATA_DIR / "missing-analytics-fixture"
    monkeypatch.setattr(analytics_service, "DATA_DIR", missing_dir)
    response = client.get("/ai/analytics/summary")
    assert response.status_code == 503
    assert response.json() == {
        "error": {
            "code": "ANALYTICS_DATA_UNAVAILABLE",
            "message": "Required analytics data file is unavailable: students.csv",
            "field": None,
        }
    }
    analytics_service.load_csvs.cache_clear()
    analytics_service.clear_summary_cache()


def test_at_risk_field_is_omitted_without_trained_model(monkeypatch):
    analytics_service.clear_summary_cache()
    monkeypatch.setattr(analytics_service.risk_service, "_load_model", lambda: None)
    response = client.get("/ai/analytics/summary")
    assert response.status_code == 200
    assert "at_risk" not in response.json()
