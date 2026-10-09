"""Skill normalization and optional semantic matching for role requirements."""

import json
import re
from pathlib import Path
from threading import Event, Lock, Thread
from typing import Any, Sequence

from app.schemas import MissingSkill, Priority, SkillGapResponse, Student, TargetRole


_SKILLS_PATH = Path(__file__).resolve().parents[1] / "data" / "skills.json"
with _SKILLS_PATH.open(encoding="utf-8") as skills_file:
    SKILL_CATALOG: list[dict[str, Any]] = json.load(skills_file)


def _key(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip()).casefold()


_ALIAS_TO_CANONICAL: dict[str, str] = {}
_CANONICAL_TO_ENTRY: dict[str, dict[str, Any]] = {}
for _entry in SKILL_CATALOG:
    _canonical = _entry["name"]
    _CANONICAL_TO_ENTRY[_key(_canonical)] = _entry
    for _alias in [_canonical, *_entry.get("aliases", [])]:
        _ALIAS_TO_CANONICAL[_key(_alias)] = _canonical

MODEL_NAME = "all-MiniLM-L6-v2"
SIMILARITY_THRESHOLD = 0.75
_MODEL: Any = None
_MODEL_LOAD_STARTED = False
_MODEL_LOAD_FAILED = False
_MODEL_WAIT_USED = False
_MODEL_READY = Event()
_MODEL_LOCK = Lock()
_CACHE_LOCK = Lock()
_EMBEDDINGS: dict[str, tuple[float, ...]] = {}
_SIMILARITIES: dict[tuple[str, str], float] = {}


def normalize_skill(skill: str) -> str:
    """Return the catalog's canonical spelling, or a trimmed unknown skill."""
    clean = re.sub(r"\s+", " ", skill.strip())
    return _ALIAS_TO_CANONICAL.get(_key(clean), clean)


def _get_model():
    """Start one lazy load and bound the initial wait before alias-only fallback."""
    global _MODEL_LOAD_STARTED, _MODEL_WAIT_USED
    wait_for_first_result = False
    with _MODEL_LOCK:
        if _MODEL is not None:
            return _MODEL
        if _MODEL_LOAD_FAILED:
            return None
        if not _MODEL_LOAD_STARTED:
            _MODEL_LOAD_STARTED = True
            Thread(target=_load_model, name="campuslink-skill-model", daemon=True).start()
        if not _MODEL_WAIT_USED:
            _MODEL_WAIT_USED = True
            wait_for_first_result = True

    if wait_for_first_result:
        _MODEL_READY.wait(timeout=0.2)
    return _MODEL


def _load_model() -> None:
    global _MODEL, _MODEL_LOAD_FAILED
    try:
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer(MODEL_NAME)
        with _MODEL_LOCK:
            _MODEL = model
    except Exception:
        with _MODEL_LOCK:
            _MODEL_LOAD_FAILED = True
    finally:
        _MODEL_READY.set()


def _embedding(skill: str) -> tuple[float, ...] | None:
    with _CACHE_LOCK:
        cached = _EMBEDDINGS.get(skill)
    if cached is not None:
        return cached

    model = _get_model()
    if model is None:
        return None
    try:
        vector = model.encode(skill, normalize_embeddings=True, convert_to_numpy=True)
        embedding = tuple(float(value) for value in vector)
    except Exception:
        global _MODEL_LOAD_FAILED, _MODEL
        with _MODEL_LOCK:
            _MODEL_LOAD_FAILED = True
            _MODEL = None
        _MODEL_READY.set()
        return None
    with _CACHE_LOCK:
        _EMBEDDINGS[skill] = embedding
        if len(_EMBEDDINGS) > 4096:
            _EMBEDDINGS.pop(next(iter(_EMBEDDINGS)))
    return embedding


def _semantic_similarity(left: str, right: str) -> float | None:
    cache_key = (left, right)
    with _CACHE_LOCK:
        cached = _SIMILARITIES.get(cache_key)
    if cached is not None:
        return cached
    left_vector = _embedding(left)
    right_vector = _embedding(right)
    if left_vector is None or right_vector is None or len(left_vector) != len(right_vector):
        return None
    similarity = sum(a * b for a, b in zip(left_vector, right_vector))
    with _CACHE_LOCK:
        _SIMILARITIES[cache_key] = similarity
        if len(_SIMILARITIES) > 16384:
            _SIMILARITIES.pop(next(iter(_SIMILARITIES)))
    return similarity


def _match_names(candidate_names: Sequence[str], requested_names: Sequence[str]) -> list[bool]:
    candidates = [normalize_skill(name) for name in candidate_names if name.strip()]
    requests = [normalize_skill(name) for name in requested_names]
    matched = [False] * len(requests)
    used_candidates: set[int] = set()

    # Exact canonical or alias matches take precedence over semantic similarity.
    for request_index, requested in enumerate(requests):
        for candidate_index, candidate in enumerate(candidates):
            if candidate_index not in used_candidates and _key(candidate) == _key(requested):
                matched[request_index] = True
                used_candidates.add(candidate_index)
                break

    possible_related: list[tuple[float, int, int]] = []
    for request_index, requested in enumerate(requests):
        if matched[request_index]:
            continue
        for candidate_index, candidate in enumerate(candidates):
            if candidate_index in used_candidates or _key(candidate) == _key(requested):
                continue
            similarity = _semantic_similarity(candidate, requested)
            if similarity is not None and similarity >= SIMILARITY_THRESHOLD:
                possible_related.append((similarity, request_index, candidate_index))

    # A single student skill cannot satisfy several distinct job requirements.
    for _, request_index, candidate_index in sorted(possible_related, reverse=True):
        if not matched[request_index] and candidate_index not in used_candidates:
            matched[request_index] = True
            used_candidates.add(candidate_index)
    return matched


def compare_skills(
    candidate_names: Sequence[str],
    required_names: Sequence[str],
    preferred_names: Sequence[str] = (),
) -> dict[str, Any]:
    """Compare skill lists and return canonical matched and missing names."""
    required = [normalize_skill(name) for name in required_names]
    preferred = [normalize_skill(name) for name in preferred_names]
    required_flags = _match_names(candidate_names, required)
    preferred_flags = _match_names(candidate_names, preferred)
    return {
        "matched_required": [name for name, is_matched in zip(required, required_flags) if is_matched],
        "missing_required": [name for name, is_matched in zip(required, required_flags) if not is_matched],
        "matched_preferred": [name for name, is_matched in zip(preferred, preferred_flags) if is_matched],
        "missing_preferred": [name for name, is_matched in zip(preferred, preferred_flags) if not is_matched],
        "coverage_pct": round(sum(required_flags) / len(required_flags) * 100) if required_flags else 0,
    }


def _missing_priority(skill: str) -> Priority:
    entry = _CANONICAL_TO_ENTRY.get(_key(skill))
    # A core_weight of 1.2 or above marks catalogued core skills as HIGH priority.
    if entry and float(entry.get("core_weight", 0)) >= 1.2:
        return Priority.HIGH
    return Priority.MEDIUM


def skill_gap(student: Student, target: TargetRole) -> SkillGapResponse:
    comparison = compare_skills(student.skills, target.required_skills, target.preferred_skills)
    missing = [
        MissingSkill(skill=skill, priority=_missing_priority(skill))
        for skill in comparison["missing_required"]
    ]
    missing.extend(
        MissingSkill(skill=skill, priority=Priority.LOW)
        for skill in comparison["missing_preferred"]
    )
    return SkillGapResponse(
        student_id=student.student_id,
        role=target.role,
        matched_skills=comparison["matched_required"] + comparison["matched_preferred"],
        missing_skills=missing,
        coverage_pct=comparison["coverage_pct"],
        meta={"engine_version": "0.2.0", "stub": False},
    )
