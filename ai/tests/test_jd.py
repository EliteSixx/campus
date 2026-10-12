import json
from pathlib import Path

import pytest

from app.services.jd_service import parse_job


ROOT = Path(__file__).resolve().parents[2]


def test_demo_description_matches_parse_job_contract_fields():
    text = (
        "Backend Developer. CSE/IT. CGPA 7+. Python, SQL, REST APIs and Docker required. "
        "AWS preferred."
    )
    expected = json.loads((ROOT / "contracts/examples/parse-job.response.json").read_text(encoding="utf-8"))

    result = parse_job(text)

    assert result["job"] == expected["job"]
    assert result["meta"] == {"engine_version": "0.2.0", "stub": False}


def test_position_company_backlogs_experience_and_ctc_are_extracted():
    result = parse_job(
        "Position: Data Analyst. Company: Acme Analytics. Minimum 7.0 CGPA, no backlogs. "
        "Python, SQL and Excel required; Tableau good to have. 2 years experience. CTC 12 LPA."
    )
    job = result["job"]

    assert job["role"] == "Data Analyst"
    assert job["company"] == "Acme Analytics"
    assert job["min_cgpa"] == 7.0
    assert job["max_backlogs"] == 0
    assert job["experience_years"] == 2
    assert job["ctc_lpa"] == 12
    assert job["required_skills"] == ["Python", "SQL", "Excel"]
    assert job["preferred_skills"] == ["Tableau"]


@pytest.mark.parametrize(
    ("backlog_text", "expected"),
    [
        ("Maximum Backlogs : Less than 2", 1),
        ("Maximum Backlogs Allowed: Less than 2", 1),
        ("Maximum backlogs allowed less than 2", 1),
        ("Fewer than 3 backlogs", 2),
        ("Under 2 backlogs", 1),
        ("At most 2 backlogs", 2),
        ("Up to 3 backlogs", 3),
        ("Max 2 backlogs", 2),
        ("Max 2", 2),
        ("Maximum 4 backlogs", 4),
        ("4 or fewer backlogs", 4),
        ("No backlogs", 0),
        ("Zero backlogs", 0),
        ("Maximum Backlogs Allowed: nil", 0),
        ("Maximum Backlogs Allowed: zero", 0),
    ],
)
def test_backlog_limit_phrasings(backlog_text, expected):
    result = parse_job(f"Backend Developer. {backlog_text}. Python required.")
    assert result["job"]["max_backlogs"] == expected


def test_full_sample_jd_extracts_less_than_backlog_limit():
    result = parse_job(
        "Backend Developer. CSE/IT. CGPA 7+. Maximum Backlogs Allowed: Less than 2. "
        "Python, SQL, REST APIs and Docker required. AWS preferred."
    )
    assert result["job"]["max_backlogs"] == 1


def test_skill_in_required_and_preferred_stays_required_only():
    result = parse_job("Backend Developer. Python required; Python preferred.")
    assert result["job"]["required_skills"] == ["Python"]
    assert result["job"]["preferred_skills"] == []


def test_percentage_cgpa_and_all_branches_are_handled():
    result = parse_job(
        "Role: QA Engineer. Minimum 60% required. Open to all branches. Java and Selenium required."
    )

    assert result["job"]["min_cgpa"] == 6.0
    assert result["job"]["eligible_branches"] == []
    assert any("converted" in warning.lower() for warning in result["warnings"])


def test_full_branch_names_and_branch_acronyms_are_canonicalized():
    result = parse_job(
        "Embedded Engineer. Computer Science and Engineering, Information Technology, "
        "Electronics and Communication, Electrical and Electronics, Mechanical and Civil branches."
    )
    assert result["job"]["eligible_branches"] == ["CSE", "IT", "ECE", "EEE", "ME", "CE"]


def test_skill_aliases_return_canonical_names_once():
    result = parse_job("Backend role. REST API, REST APIs, and RESTful services required.")
    assert result["job"]["required_skills"] == ["REST APIs"]


def test_preference_phrases_classify_skills_as_preferred():
    result = parse_job(
        "Role: Cloud Engineer. AWS required; Docker is a plus; Kubernetes nice to have; "
        "Terraform good to have."
    )
    assert result["job"]["required_skills"] == ["AWS"]
    assert result["job"]["preferred_skills"] == ["Docker", "Kubernetes", "Terraform"]


def test_comma_delimited_skill_clauses_keep_required_and_preferred_separate():
    result = parse_job("Python is required, AWS is preferred.")
    assert result["job"]["required_skills"] == ["Python"]
    assert result["job"]["preferred_skills"] == ["AWS"]


def test_experience_range_and_ctc_range_are_parsed():
    result = parse_job("Position: Engineer. 3-5 years experience. CTC 10-15 LPA.")
    assert result["job"]["experience_years"] == 3
    assert result["job"]["ctc_lpa"] == 15


@pytest.mark.parametrize("text", ["", "just some unrelated words with no job details"])
def test_empty_or_junk_text_returns_low_confidence_and_warnings(text):
    result = parse_job(text)
    assert result["confidence"] <= 0.2
    assert result["warnings"]
    assert result["meta"]["stub"] is False


def test_shared_skill_catalog_has_at_least_120_entries_and_rest_aliases():
    skills = json.loads((ROOT / "ai/app/data/skills.json").read_text(encoding="utf-8"))
    assert len(skills) >= 120
    rest = next(skill for skill in skills if skill["name"] == "REST APIs")
    assert {"REST API", "REST APIs", "RESTful"}.issubset({rest["name"], *rest["aliases"]})
