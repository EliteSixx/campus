"""Run the CampusLink demo checks against a live AI service."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_BASE_URL = os.environ.get("CAMPUSLINK_AI_BASE_URL", "http://localhost:8000")
SAMPLE_JD = "Backend Developer. CSE/IT. CGPA 7+. Python, SQL, REST APIs and Docker required. AWS preferred."


def _skip_string_and_comments(text: str, index: int) -> int:
    """Return the next index after a quoted string or comment, if one starts here."""
    if text.startswith("//", index):
        newline = text.find("\n", index)
        return len(text) if newline < 0 else newline + 1
    if text.startswith("/*", index):
        end = text.find("*/", index + 2)
        return len(text) if end < 0 else end + 2
    if text[index] in ('"', "'", "`"):
        quote = text[index]
        index += 1
        while index < len(text):
            if text[index] == "\\":
                index += 2
            elif text[index] == quote:
                return index + 1
            else:
                index += 1
        return len(text)
    return index


def _matching_delimiter(text: str, opening_index: int, opening: str, closing: str) -> int:
    depth = 0
    index = opening_index
    while index < len(text):
        skipped = _skip_string_and_comments(text, index)
        if skipped != index:
            index = skipped
            continue
        if text[index] == opening:
            depth += 1
        elif text[index] == closing:
            depth -= 1
            if depth == 0:
                return index
        index += 1
    raise ValueError(f"Unclosed {opening!r} in demo TypeScript source")


def _export_array(source: str, export_name: str) -> str:
    declaration = re.search(rf"export\s+const\s+{re.escape(export_name)}\b[^=]*=", source)
    if not declaration:
        raise ValueError(f"Could not find export {export_name!r}")
    opening = source.find("[", declaration.end())
    if opening < 0:
        raise ValueError(f"Export {export_name!r} is not an array")
    closing = _matching_delimiter(source, opening, "[", "]")
    return source[opening + 1 : closing]


def _object_blocks(array_body: str) -> list[str]:
    blocks: list[str] = []
    index = 0
    while index < len(array_body):
        skipped = _skip_string_and_comments(array_body, index)
        if skipped != index:
            index = skipped
            continue
        if array_body[index] == "{":
            closing = _matching_delimiter(array_body, index, "{", "}")
            blocks.append(array_body[index + 1 : closing])
            index = closing + 1
        else:
            index += 1
    return blocks


def _property(block: str, name: str) -> str:
    matches = list(re.finditer(rf"(?m)(^|,)(\s*){re.escape(name)}\s*:\s*", block))
    if not matches:
        raise ValueError(f"Missing {name!r} in demo data object")
    match = min(matches, key=lambda item: len(item.group(2)))
    start = match.end()
    if start >= len(block):
        return ""
    if block[start] in "[{":
        close = "]" if block[start] == "[" else "}"
        return block[start + 1 : _matching_delimiter(block, start, block[start], close)]
    if block[start] in ('"', "'"):
        quote = block[start]
        end = start + 1
        while end < len(block):
            if block[end] == "\\":
                end += 2
            elif block[end] == quote:
                return block[start + 1 : end]
            else:
                end += 1
        raise ValueError(f"Unclosed string value for {name!r}")
    end = re.search(r"[,\n]", block[start:])
    return block[start : start + end.start() if end else len(block)].strip()


def _string_array(block: str, name: str) -> list[str]:
    return re.findall(r'"((?:[^"\\]|\\.)*)"', _property(block, name))


def _number_or_none(block: str, name: str) -> float | int | None:
    value = _property(block, name).strip()
    if value == "null":
        return None
    number = float(value)
    return int(number) if number.is_integer() else number


def _projects(block: str) -> list[dict[str, Any]]:
    return [
        {
            "title": _property(project, "title"),
            "tech": _string_array(project, "tech"),
            **({"description": _property(project, "description")} if re.search(r"(?m)^\s*description\s*:", project) else {}),
        }
        for project in _object_blocks(_property(block, "projects"))
    ]


def _parse_student(block: str) -> dict[str, Any]:
    student: dict[str, Any] = {
        "student_id": _property(block, "student_id"),
        "branch": _property(block, "branch"),
        "cgpa": _number_or_none(block, "cgpa"),
        "backlogs": _number_or_none(block, "backlogs"),
        "graduation_year": _number_or_none(block, "graduation_year"),
        "skills": _string_array(block, "skills"),
        "certifications": _string_array(block, "certifications"),
        "projects": _projects(block),
        "aptitude_score": _number_or_none(block, "aptitude_score"),
        "communication_score": _number_or_none(block, "communication_score"),
        "mock_interview_score": _number_or_none(block, "mock_interview_score"),
    }
    synthetic = _property(block, "is_synthetic").strip().lower()
    if synthetic in ("true", "false"):
        student["is_synthetic"] = synthetic == "true"
    return student


def _parse_job(block: str) -> dict[str, Any]:
    return {
        "job_id": _property(block, "job_id"),
        "company": _property(block, "company"),
        "role": _property(block, "role"),
        "min_cgpa": _number_or_none(block, "min_cgpa"),
        "max_backlogs": _number_or_none(block, "max_backlogs"),
        "eligible_branches": _string_array(block, "eligible_branches"),
        "required_skills": _string_array(block, "required_skills"),
        "preferred_skills": _string_array(block, "preferred_skills"),
        "experience_years": _number_or_none(block, "experience_years"),
        "ctc_lpa": _number_or_none(block, "ctc_lpa"),
    }


def load_demo_data(repo_root: Path = REPO_ROOT) -> dict[str, Any]:
    demo_dir = repo_root / "web" / "data" / "demo"
    students = [_parse_student(block) for block in _object_blocks(_export_array((demo_dir / "students.ts").read_text(encoding="utf-8"), "demoStudents"))]
    jobs = [_parse_job(block) for block in _object_blocks(_export_array((demo_dir / "jobs.ts").read_text(encoding="utf-8"), "demoJobs"))]
    drives = _object_blocks(_export_array((demo_dir / "drives.ts").read_text(encoding="utf-8"), "demoPlacementDrives"))
    activities = _object_blocks(_export_array((demo_dir / "placement-activity.ts").read_text(encoding="utf-8"), "demoPlacementActivities"))
    activity_by_id = {
        _property(block, "student_id"): {
            key: _number_or_none(block, key)
            for key in ("drives_applied", "shortlisted", "interviews_attended", "rejections")
        }
        for block in activities
    }
    return {
        "students": students,
        "jobs": jobs,
        "drives": drives,
        "rank_jobs": [
            _property(drive, "job_id")
            for drive in drives
            if _property(drive, "job_id") in {job["job_id"] for job in jobs}
        ],
        "activities": activity_by_id,
    }


def _request(base_url: str, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        f"{base_url.rstrip('/')}{path}",
        data=data,
        method=method,
        headers={"Accept": "application/json", **({"Content-Type": "application/json"} if data else {})},
    )
    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Could not reach {base_url}: {exc.reason}") from exc
    if not isinstance(result, dict):
        raise RuntimeError(f"Expected a JSON object from {path}")
    return result


def _assert_real_endpoint(response: dict[str, Any], path: str) -> None:
    meta = response.get("meta")
    if not isinstance(meta, dict) or meta.get("stub") is not False:
        raise AssertionError(f"{path} did not return meta.stub=false: {meta}")


def run_checks(base_url: str = DEFAULT_BASE_URL, repo_root: Path = REPO_ROOT, emit: Callable[[str], None] = print) -> int:
    try:
        demo = load_demo_data(repo_root)
        students = demo["students"]
        students_by_id = {student["student_id"]: student for student in students}
        jobs_by_id = {job["job_id"]: job for job in demo["jobs"]}
        st001 = students_by_id["ST001"]
        st104 = students_by_id["ST104"]
        job001 = jobs_by_id["JOB001"]
        activity_by_id = demo["activities"]
        if len(demo["rank_jobs"]) < 3:
            raise ValueError("The demo drives must identify three rank jobs")
        activity_by_id["ST001"]
        activity_by_id["ST104"]
    except Exception as exc:
        for label in (
            "health", "readiness and skill gap", "JD parsing", "match explanations",
            "three-job ranking", "placement risk", "analytics summary",
        ):
            emit(f"FAIL {label}: demo seed data could not be loaded: {exc}")
        return 1

    failures = 0

    def step(label: str, action: Callable[[], str]) -> None:
        nonlocal failures
        try:
            emit(f"PASS {label}: {action()}")
        except Exception as exc:
            failures += 1
            emit(f"FAIL {label}: {exc}")

    def check_health() -> str:
        response = _request(base_url, "GET", "/health")
        if response.get("status") != "ok" or response.get("stub") is not False:
            raise AssertionError(f"expected status=ok and stub=false; got {response}")
        return f"status=ok, stub=false, engine={response.get('engine_version')}"

    def check_readiness_and_gap() -> str:
        ready = _request(base_url, "POST", "/ai/readiness", {"student": st001})
        at_risk = _request(base_url, "POST", "/ai/readiness", {"student": st104})
        _assert_real_endpoint(ready, "/ai/readiness")
        _assert_real_endpoint(at_risk, "/ai/readiness")
        if ready.get("level") not in {"READY", "HIGHLY_EMPLOYABLE"}:
            raise AssertionError(f"ST001 readiness was {ready.get('level')}")
        if at_risk.get("level") not in {"NOT_READY", "DEVELOPING"}:
            raise AssertionError(f"ST104 readiness was {at_risk.get('level')}")
        gap = _request(base_url, "POST", "/ai/skill-gap", {
            "student": st001,
            "target": {
                "role": "Backend Developer",
                "required_skills": job001["required_skills"] + ["AWS", "Redis"],
                "preferred_skills": job001["preferred_skills"] + ["Kubernetes"],
            },
        })
        _assert_real_endpoint(gap, "/ai/skill-gap")
        if not isinstance(gap.get("matched_skills"), list) or not isinstance(gap.get("missing_skills"), list):
            raise AssertionError("skill-gap response is missing matched_skills or missing_skills")
        coverage = gap.get("coverage_pct")
        if not isinstance(coverage, (int, float)) or not 0 <= coverage <= 100:
            raise AssertionError(f"skill-gap coverage_pct is outside 0..100: {coverage}")
        return f"ST001={ready['level']}, ST104={at_risk['level']}, Backend Developer gap coverage={coverage}%"

    def check_jd_parse() -> str:
        response = _request(base_url, "POST", "/ai/parse-job", {"text": SAMPLE_JD})
        _assert_real_endpoint(response, "/ai/parse-job")
        job = response.get("job", {})
        if job.get("role") != "Backend Developer":
            raise AssertionError(f"role was {job.get('role')!r}")
        if job.get("min_cgpa") != 7.0:
            raise AssertionError(f"min_cgpa was {job.get('min_cgpa')!r}")
        if set(job.get("eligible_branches", [])) != {"CSE", "IT"}:
            raise AssertionError(f"branches were {job.get('eligible_branches')!r}")
        parsed_required = {skill.casefold() for skill in job.get("required_skills", [])}
        expected = {"python", "sql", "docker"}
        if not expected <= parsed_required or not ("rest api" in parsed_required or "rest apis" in parsed_required):
            raise AssertionError(f"required skills were {job.get('required_skills')!r}")
        return "Backend Developer, CGPA 7.0, CSE/IT and Python/SQL/REST APIs/Docker parsed"

    def check_match() -> str:
        good = _request(base_url, "POST", "/ai/match", {"student": st001, "job": job001})
        poor = _request(base_url, "POST", "/ai/match", {"student": st104, "job": job001})
        _assert_real_endpoint(good, "/ai/match")
        _assert_real_endpoint(poor, "/ai/match")
        if good.get("eligible") is not True:
            raise AssertionError("ST001 vs JOB001 should be eligible")
        if poor.get("eligible") is not False:
            raise AssertionError("ST104 vs JOB001 should be ineligible")
        fail_text = " ".join(
            str(reason.get("text", ""))
            for reason in poor.get("reasons", [])
            if reason.get("type") == "FAIL"
        ).casefold()
        if "cgpa" not in fail_text or "backlog" not in fail_text:
            raise AssertionError(f"ST104 FAIL reasons did not mention both CGPA and backlog: {poor.get('reasons')}")
        for student_id, result in (("ST001", good), ("ST104", poor)):
            if not result.get("fit_level") or not isinstance(result.get("summary"), str) or not result["summary"].strip():
                raise AssertionError(f"{student_id} match is missing fit_level or summary")
        return f"ST001 eligible ({good.get('fit_level')}), ST104 ineligible ({poor.get('fit_level')}); both summaries present"

    def check_ranking() -> str:
        top_twos: dict[str, tuple[str, ...]] = {}
        for job_id in demo["rank_jobs"][:3]:
            job = jobs_by_id[job_id]
            response = _request(base_url, "POST", "/ai/rank", {"job": job, "students": students})
            _assert_real_endpoint(response, "/ai/rank")
            ranked = response.get("ranked")
            if not isinstance(ranked, list) or not ranked:
                raise AssertionError(f"{job_id} returned no ranked candidates")
            if ranked[0].get("eligible") is not True:
                raise AssertionError(f"{job_id} top-ranked candidate {ranked[0].get('student_id')} is ineligible")
            top_twos[job_id] = tuple(item.get("student_id", "") for item in ranked[:2])
        if len(set(top_twos.values())) < 2:
            raise AssertionError(f"top-two student order was identical for all three jobs: {top_twos}")
        order_text = "; ".join(f"{job_id}: {', '.join(ids)}" for job_id, ids in top_twos.items())
        return f"eligible candidate leads each list; distinct top-two orders: {order_text}"

    def check_risk() -> str:
        responses: dict[str, dict[str, Any]] = {}
        for student_id in ("ST104", "ST001"):
            responses[student_id] = _request(base_url, "POST", "/ai/predict-placement", {
                "student": students_by_id[student_id],
                "activity": activity_by_id[student_id],
            })
            _assert_real_endpoint(responses[student_id], "/ai/predict-placement")
        if responses["ST104"].get("risk") != "HIGH":
            raise AssertionError(f"ST104 risk was {responses['ST104'].get('risk')!r}")
        if responses["ST001"].get("risk") not in {"LOW", "MEDIUM"}:
            raise AssertionError(f"ST001 risk was {responses['ST001'].get('risk')!r}")
        return f"ST104={responses['ST104']['risk']} ({responses['ST104'].get('probability_unplaced')}), ST001={responses['ST001']['risk']} ({responses['ST001'].get('probability_unplaced')})"

    def check_analytics() -> str:
        response = _request(base_url, "GET", "/ai/analytics/summary")
        totals = response.get("totals")
        branches = response.get("branch_conversion")
        if not isinstance(totals, dict) or not totals:
            raise AssertionError("analytics summary has no totals object")
        if not isinstance(branches, list) or not branches:
            raise AssertionError("analytics summary has no branch_conversion rows")
        return f"totals contain {len(totals)} values; {len(branches)} branch conversion rows"

    for label, action in (
        ("health", check_health),
        ("readiness and skill gap", check_readiness_and_gap),
        ("JD parsing", check_jd_parse),
        ("match explanations", check_match),
        ("three-job ranking", check_ranking),
        ("placement risk", check_risk),
        ("analytics summary", check_analytics),
    ):
        step(label, action)

    emit(f"Demo check: {7 - failures}/7 passed")
    return 1 if failures else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="AI service URL (default: %(default)s)")
    args = parser.parse_args()
    return run_checks(args.base_url)


if __name__ == "__main__":
    sys.exit(main())
