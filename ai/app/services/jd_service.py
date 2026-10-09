"""Rule-based parser for recruiter-provided job descriptions."""

import json
import re
from pathlib import Path
from typing import Any


_SKILLS_PATH = Path(__file__).resolve().parents[1] / "data" / "skills.json"
with _SKILLS_PATH.open(encoding="utf-8") as skills_file:
    SKILL_ENTRIES: list[dict[str, Any]] = json.load(skills_file)


def _normalise(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).casefold()


_SKILL_ALIASES: dict[str, str] = {}
for _skill in SKILL_ENTRIES:
    for _alias in [_skill["name"], *_skill.get("aliases", [])]:
        _SKILL_ALIASES[_normalise(_alias)] = _skill["name"]

_SKILL_PATTERN = re.compile(
    r"(?<![A-Za-z0-9])(?:"
    + "|".join(
        re.escape(alias).replace(r"\ ", r"\s+")
        for alias in sorted(_SKILL_ALIASES, key=len, reverse=True)
    )
    + r")(?![A-Za-z0-9])",
    re.IGNORECASE,
)

_PREFERRED_PATTERN = re.compile(
    r"\b(?:preferred|good\s+to\s+have|nice\s+to\s+have|plus)\b", re.IGNORECASE
)
_REQUIRED_PATTERN = re.compile(r"\b(?:required|must\s+have|mandatory)\b", re.IGNORECASE)
_BRANCH_PATTERNS = (
    ("CSE", r"\bCSE\b|computer\s+science(?:\s+and\s+engineering)?"),
    ("IT", r"\bIT\b|information\s+technology"),
    ("ECE", r"\bECE\b|electronics\s+and\s+communication(?:\s+engineering)?"),
    ("EEE", r"\bEEE\b|electrical\s+and\s+electronics(?:\s+engineering)?"),
    ("ME", r"\bME\b|mechanical(?:\s+engineering)?"),
    ("CE", r"\bCE\b|civil(?:\s+engineering)?"),
)

_FIELD_WARNINGS = {
    "role": "Role not specified",
    "company": "Company not specified",
    "min_cgpa": "Minimum CGPA not specified",
    "max_backlogs": "Maximum backlogs not specified",
    "eligible_branches": "Eligible branches not specified",
    "required_skills": "Required skills not specified",
    "preferred_skills": "Preferred skills not specified",
    "experience_years": "Experience requirement not specified",
    "ctc_lpa": "CTC not specified",
}


def _extract_role(text: str) -> str:
    explicit = re.search(r"\b(?:role|position)\s*:\s*([^\r\n.;]+)", text, re.IGNORECASE)
    if explicit:
        return explicit.group(1).strip(" \t:-")

    first_line = next((line.strip() for line in text.splitlines() if line.strip()), "")
    first_sentence = re.split(r"(?<=[.!?])\s+", text.strip(), maxsplit=1)[0].strip()
    candidate = first_sentence or first_line
    return candidate.rstrip(".!? ")


def _extract_min_cgpa(text: str) -> tuple[float | None, bool]:
    patterns = (
        r"\b(?:minimum|min)\s+(?:CGPA|GPA)\s*(?:of\s*)?[:=]?\s*(\d{1,2}(?:\.\d+)?)\s*\+?",
        r"\b(?:CGPA|GPA)\s*(?:of\s*)?[:=]?\s*(\d{1,2}(?:\.\d+)?)\s*\+?",
        r"\b(\d{1,2}(?:\.\d+)?)\s*\+?\s*(?:CGPA|GPA)\b",
        r"\bminimum\s+(\d{1,2}(?:\.\d+)?)\s*\+?\s*(?:CGPA|GPA)\b",
    )
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = float(match.group(1))
            if 0 <= value <= 10:
                return value, False

    percentage = re.search(r"\b(\d{1,2}(?:\.\d+)?)\s*%", text)
    if percentage:
        value = float(percentage.group(1))
        if 0 <= value <= 100:
            return value / 10, True
    return None, False


def _extract_backlogs(text: str) -> int | None:
    if re.search(r"\bno\s+(?:active\s+)?backlogs?\b", text, re.IGNORECASE):
        return 0
    match = re.search(
        r"\b(?:up\s+to|maximum(?:\s+of)?|max(?:imum)?\.?|at\s+most)\s+(\d+)\s+backlogs?\b",
        text,
        re.IGNORECASE,
    )
    if match:
        return int(match.group(1))
    match = re.search(r"\bbacklogs?\s*[:=]\s*(\d+)\b", text, re.IGNORECASE)
    return int(match.group(1)) if match else None


def _extract_branches(text: str) -> tuple[list[str], bool]:
    if re.search(r"\b(?:all|any|open\s+to\s+all)\s+branches\b", text, re.IGNORECASE):
        return [], True
    branches = [
        branch
        for branch, pattern in _BRANCH_PATTERNS
        if re.search(pattern, text, re.IGNORECASE)
    ]
    return branches, bool(branches)


def _extract_skills(text: str) -> tuple[list[str], list[str]]:
    required: list[str] = []
    preferred: list[str] = []
    seen_required: set[str] = set()
    seen_preferred: set[str] = set()

    # New sentences and semicolon-delimited clauses can state separate preferences.
    clauses = re.split(r"(?<=[.!?])\s+|[;\n]+", text)
    for clause in clauses:
        fragments = clause.split(",")
        labels: list[bool | None] = [
            True if _PREFERRED_PATTERN.search(fragment) else
            False if _REQUIRED_PATTERN.search(fragment) else None
            for fragment in fragments
        ]
        for index, label in enumerate(labels):
            if label is None:
                previous = next((labels[pos] for pos in range(index - 1, -1, -1) if labels[pos] is not None), None)
                following = next((labels[pos] for pos in range(index + 1, len(labels)) if labels[pos] is not None), None)
                labels[index] = previous if previous is not None else following

        for fragment, is_preferred in zip(fragments, labels):
            destination = preferred if is_preferred else required
            seen = seen_preferred if is_preferred else seen_required
            for match in _SKILL_PATTERN.finditer(fragment):
                canonical = _SKILL_ALIASES[_normalise(match.group(0))]
                if canonical.casefold() not in seen:
                    destination.append(canonical)
                    seen.add(canonical.casefold())

    return required, preferred


def _extract_experience(text: str) -> float | None:
    if re.search(r"\b(?:freshers?|entry[- ]level|no\s+experience\s+required)\b", text, re.IGNORECASE):
        return 0.0
    match = re.search(
        r"\b(?:minimum|min(?:imum)?\.?\s*)?(\d+(?:\.\d+)?)\s*(?:\+|to\s+\d+(?:\.\d+)?|[-–]\s*\d+(?:\.\d+)?)?\s*(?:years?|yrs?)(?:\s+of)?\s+experience\b",
        text,
        re.IGNORECASE,
    )
    return float(match.group(1)) if match else None


def _extract_ctc(text: str) -> float | None:
    range_match = re.search(
        r"\b(?:CTC\s*[:=]?\s*)?(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:LPA|lakhs?\s*(?:per\s+annum|/\s*year)?)\b",
        text,
        re.IGNORECASE,
    )
    if range_match:
        return float(range_match.group(2))

    match = re.search(
        r"\b(?:CTC\s*[:=]?\s*)?(?:₹|INR\s*)?(\d+(?:\.\d+)?)\s*(?:LPA|lakhs?\s*(?:per\s+annum|/\s*year)?)\b",
        text,
        re.IGNORECASE,
    )
    if match:
        return float(match.group(1))

    rupees = re.search(r"\b(?:CTC\s*[:=]?\s*)?₹\s*(\d{6,})\s*(?:per\s+annum|/\s*year)?\b", text, re.IGNORECASE)
    return round(float(rupees.group(1)) / 100000, 2) if rupees else None


def _extract_company(text: str) -> str | None:
    match = re.search(r"\b(?:company|employer)\s*[:=]\s*([^\r\n.;]+)", text, re.IGNORECASE)
    return match.group(1).strip() if match else None


def parse_job(text: str) -> dict[str, Any]:
    """Extract supported job fields and explain which details were absent."""
    text = text or ""
    role = _extract_role(text)
    company = _extract_company(text)
    min_cgpa, used_percentage = _extract_min_cgpa(text)
    max_backlogs = _extract_backlogs(text)
    eligible_branches, branches_found = _extract_branches(text)
    required_skills, preferred_skills = _extract_skills(text)
    experience_years = _extract_experience(text)
    ctc_lpa = _extract_ctc(text)

    found = {
        "role": bool(role),
        "company": company is not None,
        "min_cgpa": min_cgpa is not None,
        "max_backlogs": max_backlogs is not None,
        "eligible_branches": branches_found,
        "required_skills": bool(required_skills),
        "preferred_skills": bool(preferred_skills),
        "experience_years": experience_years is not None,
        "ctc_lpa": ctc_lpa is not None,
    }
    warnings = [message for field, message in _FIELD_WARNINGS.items() if not found[field]]
    if used_percentage and min_cgpa is not None:
        warnings.append(
            f"CGPA percentage converted to a 10-point scale ({min_cgpa:g})."
        )

    found_count = sum(found.values())
    return {
        "job": {
            "job_id": None,
            "company": company,
            "role": role,
            "min_cgpa": min_cgpa if min_cgpa is not None else 0.0,
            "max_backlogs": max_backlogs,
            "eligible_branches": eligible_branches,
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "experience_years": experience_years,
            "ctc_lpa": ctc_lpa,
        },
        "confidence": round(found_count / len(found), 2),
        "warnings": warnings,
        "meta": {"engine_version": "0.2.0", "stub": False},
    }
