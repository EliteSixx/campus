"""Reproducible, local evaluation for CampusLink's synthetic placement pipeline."""

from __future__ import annotations

import argparse
import csv
import importlib.util
import json
import math
import platform
import random
import statistics
import sys
import time
from pathlib import Path
from typing import Any

AI_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = AI_ROOT.parent
if str(AI_ROOT) not in sys.path:
    sys.path.insert(0, str(AI_ROOT))

from sklearn.metrics import roc_auc_score

from app.schemas import Job, Student
from app.services import jd_service, matching_service, readiness_service, skill_service

SEED = 42
DATA_DIR = AI_ROOT / "data"
EVAL_DIR = AI_ROOT / "eval"
RESULTS_PATH = EVAL_DIR / "results.json"
LABELS_PATH = EVAL_DIR / "labelled_jds.json"
SKILL_PAIRS_PATH = EVAL_DIR / "skill_pairs.json"
RISK_METRICS_PATH = AI_ROOT / "app" / "models" / "risk_metrics.json"


def _json_list(value: str | None) -> list[Any]:
    return json.loads(value) if value else []


def load_data(sample: bool = False) -> tuple[list[Student], list[Job], list[dict[str, Any]], list[dict[str, Any]]]:
    with (DATA_DIR / "students.csv").open(newline="", encoding="utf-8") as handle:
        students = []
        for row in csv.DictReader(handle):
            students.append(
                Student(
                    student_id=row["student_id"],
                    branch=row["branch"],
                    cgpa=float(row["cgpa"]),
                    backlogs=int(row["backlogs"]),
                    graduation_year=int(row["graduation_year"]),
                    skills=_json_list(row["skills"]),
                    projects=_json_list(row["projects"]),
                    aptitude_score=float(row["aptitude_score"]) if row["aptitude_score"] else None,
                    communication_score=float(row["communication_score"]) if row["communication_score"] else None,
                    mock_interview_score=float(row["mock_interview_score"]) if row["mock_interview_score"] else None,
                    is_synthetic=row["is_synthetic"].casefold() == "true",
                )
            )

    with (DATA_DIR / "jobs.csv").open(newline="", encoding="utf-8") as handle:
        jobs = []
        for row in csv.DictReader(handle):
            jobs.append(
                Job(
                    job_id=row["job_id"],
                    company=row["company"],
                    role=row["role"],
                    min_cgpa=float(row["min_cgpa"]),
                    max_backlogs=int(row["max_backlogs"]) if row["max_backlogs"] else None,
                    eligible_branches=_json_list(row["eligible_branches"]),
                    required_skills=_json_list(row["required_skills"]),
                    preferred_skills=_json_list(row["preferred_skills"]),
                    ctc_lpa=float(row["ctc_lpa"]) if row["ctc_lpa"] else None,
                )
            )

    with (DATA_DIR / "applications.csv").open(newline="", encoding="utf-8") as handle:
        applications = list(csv.DictReader(handle))
    with (DATA_DIR / "offers.csv").open(newline="", encoding="utf-8") as handle:
        offers = list(csv.DictReader(handle))

    if sample:
        students = students[:60]
        jobs = jobs[:12]
        student_ids = {item.student_id for item in students}
        job_ids = {item.job_id for item in jobs}
        applications = [
            row for row in applications
            if row["student_id"] in student_ids and row["job_id"] in job_ids
        ][:250]
        offers = [row for row in offers if row["student_id"] in student_ids]
    return students, jobs, applications, offers


def _safe_auc(labels: list[int], scores: list[float]) -> float | None:
    if len(set(labels)) < 2:
        return None
    return round(float(roc_auc_score(labels, scores)), 6)


def _ranking_metrics(rows: list[dict[str, Any]], score_key: str) -> dict[str, float | None]:
    labels = [int(row["shortlisted"]) for row in rows]
    scores = [float(row[score_key]) for row in rows]
    result: dict[str, float | None] = {"roc_auc": _safe_auc(labels, scores)}
    for k in (5, 10):
        top = sorted(rows, key=lambda row: (-float(row[score_key]), row["application_id"]))[:k]
        result[f"precision_at_{k}"] = round(
            sum(int(row["shortlisted"]) for row in top) / len(top), 6
        ) if top else None
    return result


def _percentile(values: list[float], percentile: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    position = (len(ordered) - 1) * percentile
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return round(ordered[lower], 6)
    fraction = position - lower
    return round(ordered[lower] * (1 - fraction) + ordered[upper] * fraction, 6)


def _bootstrap_auc_intervals(rows: list[dict[str, Any]], seed: int, resamples: int = 1000) -> dict[str, Any]:
    """Paired application-row bootstrap percentile intervals for pooled ROC-AUC."""
    labels = [int(row["shortlisted"]) for row in rows]
    keys = {"matcher": "match_score", "cgpa_only": "cgpa_score", "seeded_random": "random_score"}
    samples: dict[str, list[float]] = {name: [] for name in keys}
    differences: list[float] = []
    rng = random.Random(seed)
    count = len(rows)
    for _ in range(resamples):
        indices = [rng.randrange(count) for _ in range(count)]
        sample_labels = [labels[index] for index in indices]
        if len(set(sample_labels)) < 2:
            continue
        aucs = {
            name: float(roc_auc_score(sample_labels, [float(rows[index][key]) for index in indices]))
            for name, key in keys.items()
        }
        for name, auc in aucs.items():
            samples[name].append(auc)
        differences.append(aucs["matcher"] - aucs["cgpa_only"])
    intervals = {
        name: {"lower_95": _percentile(values, 0.025), "upper_95": _percentile(values, 0.975)}
        for name, values in samples.items()
    }
    difference_interval = {"lower_95": _percentile(differences, 0.025), "upper_95": _percentile(differences, 0.975)}
    return {
        "method": "paired percentile bootstrap over application rows; same sampled indices for all methods",
        "seed": seed,
        "requested_resamples": resamples,
        "valid_resamples": len(differences),
        "confidence_level": 0.95,
        "roc_auc": intervals,
        "paired_difference_matcher_minus_cgpa_only": difference_interval,
        "difference_interval_contains_zero": (
            difference_interval["lower_95"] is not None
            and difference_interval["upper_95"] is not None
            and difference_interval["lower_95"] <= 0 <= difference_interval["upper_95"]
        ),
    }


def evaluate_matching(
    students: list[Student], jobs: list[Job], applications: list[dict[str, Any]], seed: int
) -> dict[str, Any]:
    students_by_id = {student.student_id: student for student in students}
    jobs_by_id = {job.job_id: job for job in jobs}
    rng = random.Random(seed)
    scored: list[dict[str, Any]] = []
    for row in applications:
        student = students_by_id[row["student_id"]]
        job = jobs_by_id[row["job_id"]]
        match_score = matching_service.match(student, job).match_score
        scored.append(
            {
                **row,
                "shortlisted": row["shortlisted"].casefold() == "true",
                "match_score": match_score,
                "cgpa_score": student.cgpa,
                "random_score": rng.random(),
            }
        )

    methods = ("matcher", "cgpa_only", "seeded_random")
    key_by_method = {"matcher": "match_score", "cgpa_only": "cgpa_score", "seeded_random": "random_score"}
    per_job: dict[str, Any] = {}
    by_job: dict[str, list[dict[str, Any]]] = {}
    for row in scored:
        by_job.setdefault(row["job_id"], []).append(row)
    for job_id in sorted(by_job):
        job_result = {method: _ranking_metrics(by_job[job_id], key_by_method[method]) for method in methods}
        job_result["application_count"] = len(by_job[job_id])
        per_job[job_id] = job_result

    overall: dict[str, Any] = {}
    for method in methods:
        method_metrics = _ranking_metrics(scored, key_by_method[method])
        # Overall precision@k is macro-averaged across jobs so large jobs do not dominate.
        for k in (5, 10):
            values = [per_job[job_id][method][f"precision_at_{k}"] for job_id in per_job]
            values = [value for value in values if value is not None]
            method_metrics[f"precision_at_{k}"] = round(statistics.mean(values), 6) if values else None
        overall[method] = method_metrics
    below_chance_jobs = sum(
        1 for item in per_job.values()
        if item["matcher"]["roc_auc"] is not None and item["matcher"]["roc_auc"] < 0.5
    )
    return {
        "pair_count": len(scored),
        "job_count": len(by_job),
        "precision_at_k_aggregation": "macro average of per-job precision values; each per-job value uses min(k, applications for that job)",
        "overall": overall,
        "bootstrap_confidence_intervals": _bootstrap_auc_intervals(scored, seed),
        "per_job_diagnostic": {
            "minimum_application_count": min((item["application_count"] for item in per_job.values()), default=0),
            "maximum_application_count": max((item["application_count"] for item in per_job.values()), default=0),
            "matcher_auc_below_0_5_job_count": below_chance_jobs,
            "job_count": len(per_job),
        },
        "per_job": per_job,
    }


def _replay_generator_shortlist_signals() -> dict[str, dict[str, Any]]:
    """Replay the fixed-seed generator draws to expose pre-flip shortlist signals.

    The generator does not persist its Gaussian signal or pre-flip label. Replaying
    its RNG call sequence lets this evaluator recover those values without writing
    or regenerating any CSV files.
    """
    generator_path = DATA_DIR / "generate_data.py"
    spec = importlib.util.spec_from_file_location("campuslink_data_generator", generator_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not import data generator at {generator_path}")
    generator = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(generator)

    rng = random.Random(generator.SEED)
    skill_catalog = json.loads((AI_ROOT / "app" / "data" / "skills.json").read_text(encoding="utf-8"))
    all_skills = [entry["name"] for entry in skill_catalog]
    students: list[dict[str, Any]] = []
    for _ in range(1500):
        branch = rng.choices(generator.BRANCHES, weights=[26, 19, 17, 12, 14, 12])[0]
        cgpa = round(generator.clamp(rng.gauss(7.2, 0.9), 5, 10), 2)
        backlogs = rng.choices([0, 1, 2, 3], weights=[0.72, 0.18, 0.075, 0.025])[0]
        aptitude = round(generator.clamp(cgpa * 7.0 + rng.gauss(19, 13), 20, 100), 1)
        communication = round(generator.clamp(cgpa * 6.5 + rng.gauss(23, 14), 20, 100), 1)
        has_mock = rng.random() >= 0.32
        mock_score = round(
            generator.clamp(aptitude * 0.35 + communication * 0.4 + cgpa * 2 + rng.gauss(5, 15), 20, 100), 1
        ) if has_mock else None
        pool = list(dict.fromkeys(generator.BRANCH_SKILLS[branch] + rng.sample(all_skills, 12)))
        skills = rng.sample(pool, k=min(len(pool), rng.randint(4, 10)))
        for _project_index in range(rng.choices([0, 1, 2, 3], [0.12, 0.43, 0.34, 0.11])[0]):
            rng.sample(skills, k=min(len(skills), rng.randint(2, 4)))
        students.append(
            {
                "branch": branch,
                "cgpa": cgpa,
                "backlogs": backlogs,
                "skills": skills,
                "communication_score": communication,
                "mock_interview_score": mock_score,
            }
        )

    jobs: list[dict[str, Any]] = []
    for job_index in range(60):
        branch = generator.BRANCHES[job_index % len(generator.BRANCHES)]
        pool = list(dict.fromkeys(generator.BRANCH_SKILLS[branch] + rng.sample(all_skills, 10)))
        required = rng.sample(pool, k=rng.randint(3, 6))
        preferred = [skill for skill in rng.sample(all_skills, 3) if skill not in required]
        rng.choice(generator.COMPANIES)
        min_cgpa = round(rng.uniform(6.0, 8.0), 1)
        max_backlogs = rng.choice([0, 0, 1, 2])
        eligible_branches = [branch] if rng.random() < 0.75 else [branch, generator.BRANCHES[(job_index + 1) % 6]]
        rng.uniform(3.5, 18)
        jobs.append(
            {
                "job_id": f"JOB{job_index + 1:03d}",
                "required_skills": required,
                "min_cgpa": min_cgpa,
                "max_backlogs": max_backlogs,
                "eligible_branches": eligible_branches,
            }
        )

    with (DATA_DIR / "applications.csv").open(newline="", encoding="utf-8") as handle:
        csv_applications = list(csv.DictReader(handle))
    signals: dict[str, dict[str, Any]] = {}
    csv_index = 0
    for student_index, student in enumerate(students):
        student_id = f"ST{student_index + 1:04d}"
        eligible_jobs = [
            job for job in jobs
            if student["branch"] in job["eligible_branches"]
            and student["cgpa"] >= job["min_cgpa"]
            and student["backlogs"] <= job["max_backlogs"]
        ]
        chosen = rng.sample(eligible_jobs, k=min(len(eligible_jobs), rng.randint(2, 8))) if eligible_jobs else []
        for job in chosen:
            base_signal = (
                0.35 * (sum(skill in student["skills"] for skill in job["required_skills"]) / len(job["required_skills"]))
                + 0.025 * (student["cgpa"] - 7)
            )
            noisy_signal = base_signal + rng.gauss(0, 0.32)
            preflip_shortlisted = noisy_signal > 0.30
            final_shortlisted = preflip_shortlisted
            if rng.random() < 0.17:
                final_shortlisted = not final_shortlisted

            app = csv_applications[csv_index]
            csv_index += 1
            if app["student_id"] != student_id or app["job_id"] != job["job_id"]:
                raise RuntimeError(
                    f"Seed-42 generator replay diverged at {app['application_id']}: "
                    f"expected {student_id}/{job['job_id']}, got {app['student_id']}/{app['job_id']}"
                )
            csv_label = app["shortlisted"].casefold() == "true"
            if csv_label != final_shortlisted:
                raise RuntimeError(f"Generator replay did not reproduce shortlist label for {app['application_id']}")
            signals[app["application_id"]] = {
                "base_signal": base_signal,
                "noisy_signal": noisy_signal,
                "preflip_shortlisted": preflip_shortlisted,
                "final_shortlisted": final_shortlisted,
            }

            if final_shortlisted:
                overlap = sum(skill in student["skills"] for skill in job["required_skills"]) / len(job["required_skills"])
                attended = rng.random() < (0.77 + min(0.15, overlap * 0.15))
                if attended:
                    rng.gauss(0, 18)
                    outcome_signal = (
                        0.24 * overlap
                        + 0.012 * (student["cgpa"] - 7)
                        + 0.001 * ((student["mock_interview_score"] or 55) - 55)
                        + rng.gauss(0, 0.55)
                    )
                    offer = outcome_signal > 0.25
                    if rng.random() < 0.17:
                        offer = not offer
                    if offer:
                        rng.random()
    if csv_index != len(csv_applications):
        raise RuntimeError(f"Generator replay covered {csv_index} of {len(csv_applications)} application rows")
    return signals


def evaluate_shortlist_signal_ceiling(
    applications: list[dict[str, Any]], matcher_auc: float | None
) -> dict[str, Any]:
    signals = _replay_generator_shortlist_signals()
    labels = [int(row["shortlisted"].casefold() == "true") for row in applications]
    base_scores = [signals[row["application_id"]]["base_signal"] for row in applications]
    noisy_scores = [signals[row["application_id"]]["noisy_signal"] for row in applications]
    preflip_labels = [int(signals[row["application_id"]]["preflip_shortlisted"]) for row in applications]
    base_auc = _safe_auc(labels, base_scores)
    noisy_final_auc = _safe_auc(labels, noisy_scores)
    noisy_preflip_auc = _safe_auc(preflip_labels, noisy_scores)
    oracle_share = (matcher_auc / noisy_final_auc) if matcher_auc is not None and noisy_final_auc else None
    chance_adjusted_share = (
        (matcher_auc - 0.5) / (base_auc - 0.5)
        if matcher_auc is not None and base_auc is not None and base_auc != 0.5
        else None
    )
    generator_path = DATA_DIR / "generate_data.py"
    lines = generator_path.read_text(encoding="utf-8").splitlines()
    formula_line = next(index + 1 for index, line in enumerate(lines) if "signal = 0.35 * overlap" in line)
    decision_line = next(index + 1 for index, line in enumerate(lines) if "shortlist = signal > 0.30" in line)
    flip_line = next(index + 1 for index, line in enumerate(lines) if "if rng.random() < 0.17:" in line)
    return {
        "pair_count": len(applications),
        "formula": "base = 0.35 * required_skill_overlap + 0.025 * (cgpa - 7); noisy_signal = base + Gaussian(0, 0.32); preflip label = noisy_signal > 0.30; with probability 0.17 invert that label",
        "source": f"ai/data/generate_data.py:{formula_line}-{flip_line} (formula line {formula_line}, threshold line {decision_line}, flip line {flip_line})",
        "replay_verified_against_all_csv_shortlist_labels": True,
        "deterministic_base_signal_vs_observed_shortlisted_roc_auc": base_auc,
        "noisy_generator_signal_vs_observed_shortlisted_roc_auc": noisy_final_auc,
        "upper_bound_under_generator_noise_roc_auc": noisy_final_auc,
        "noisy_signal_vs_preflip_label_roc_auc_no_17_percent_flip": noisy_preflip_auc,
        "matcher_auc": matcher_auc,
        "matcher_auc_chance_adjusted_share_of_deterministic_signal": round(chance_adjusted_share, 6) if chance_adjusted_share is not None else None,
        "matcher_auc_chance_adjusted_share_of_deterministic_signal_pct": round(chance_adjusted_share * 100, 2) if chance_adjusted_share is not None else None,
        "matcher_auc_share_of_oracle_signal_diagnostic_only": round(oracle_share, 6) if oracle_share is not None else None,
        "matcher_auc_share_of_oracle_signal_diagnostic_only_pct": round(oracle_share * 100, 2) if oracle_share is not None else None,
        "interpretation": "The realized noisy generator score is an oracle ceiling: it contains the exact Gaussian draw used to create each label. It is not an available feature for a real candidate.",
    }


def evaluate_eligibility(
    students: list[Student], jobs: list[Job], seed: int, sample_count: int
) -> dict[str, Any]:
    all_pairs = [(student, job) for student in students for job in jobs]
    rng = random.Random(seed)
    selected = rng.sample(all_pairs, min(sample_count, len(all_pairs)))
    disagreements = []
    correct = 0
    for student, job in selected:
        branch_name = student.branch.value if hasattr(student.branch, "value") else str(student.branch)
        eligible_branches = [branch.value if hasattr(branch, "value") else str(branch) for branch in job.eligible_branches]
        direct = (
            student.cgpa >= job.min_cgpa
            and (job.max_backlogs is None or student.backlogs <= job.max_backlogs)
            and (not eligible_branches or branch_name in eligible_branches)
        )
        service_value = matching_service.match(student, job).eligible
        if direct == service_value:
            correct += 1
        else:
            disagreements.append(
                {"student_id": student.student_id, "job_id": job.job_id, "direct_eligible": direct, "matcher_eligible": service_value}
            )
    return {
        "population_size": len(all_pairs),
        "sample_size": len(selected),
        "sampling": "seeded simple random sample without replacement from the full student x job Cartesian product",
        "agreement_count": correct,
        "agreement_rate": round(correct / len(selected), 6) if selected else None,
        "disagreements": disagreements,
    }


def evaluate_readiness(students: list[Student], offers: list[dict[str, Any]], sample: bool) -> dict[str, Any]:
    placed_ids = {
        row["student_id"] for row in offers if row["accepted"].casefold() == "true"
    }
    scored = [(student, readiness_service.compute_readiness(student)["score"]) for student in students]
    labels = [int(student.student_id in placed_ids) for student, _ in scored]
    scores = [float(score) for _, score in scored]
    placed_scores = [score for student, score in scored if student.student_id in placed_ids]
    unplaced_scores = [score for student, score in scored if student.student_id not in placed_ids]

    monotonic_sample = students[: min(len(students), 200 if sample else len(students))]
    cgpa_checks = 0
    cgpa_violations = []
    backlog_checks = 0
    backlog_violations = []
    for student in monotonic_sample:
        before = readiness_service.compute_readiness(student)["score"]
        if student.cgpa < 10:
            raised = student.model_copy(update={"cgpa": min(10.0, student.cgpa + 0.1)})
            after = readiness_service.compute_readiness(raised)["score"]
            cgpa_checks += 1
            if after < before:
                cgpa_violations.append({"student_id": student.student_id, "before": before, "after": after})
        increased_backlogs = student.model_copy(update={"backlogs": student.backlogs + 1})
        after_backlog = readiness_service.compute_readiness(increased_backlogs)["score"]
        backlog_checks += 1
        if after_backlog > before:
            backlog_violations.append({"student_id": student.student_id, "before": before, "after": after_backlog})

    return {
        "placed_count": len(placed_scores),
        "unplaced_count": len(unplaced_scores),
        "placed_rate": round(len(placed_scores) / len(students), 6) if students else None,
        "readiness_roc_auc_for_placed": _safe_auc(labels, scores),
        "mean_readiness_placed": round(statistics.mean(placed_scores), 4) if placed_scores else None,
        "mean_readiness_unplaced": round(statistics.mean(unplaced_scores), 4) if unplaced_scores else None,
        "monotonicity": {
            "sample_size": len(monotonic_sample),
            "cgpa_raise_checks": cgpa_checks,
            "cgpa_never_lowers_score": not cgpa_violations,
            "cgpa_violations": cgpa_violations,
            "backlog_increase_checks": backlog_checks,
            "backlog_never_raises_score": not backlog_violations,
            "backlog_violations": backlog_violations,
        },
    }


def _normalise_parser_cgpa(value: Any, warnings: list[str]) -> float | None:
    if value == 0 and "Minimum CGPA not specified" in warnings:
        return None
    return float(value) if value is not None else None


def _skill_metrics(expected: set[str], predicted: set[str]) -> dict[str, float | int]:
    true_positive = len(expected & predicted)
    precision = true_positive / len(predicted) if predicted else (1.0 if not expected else 0.0)
    recall = true_positive / len(expected) if expected else (1.0 if not predicted else 0.0)
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "expected_count": len(expected),
        "predicted_count": len(predicted),
        "true_positive": true_positive,
        "precision": round(precision, 6),
        "recall": round(recall, 6),
        "f1": round(f1, 6),
    }


def evaluate_jds() -> dict[str, Any]:
    labels = json.loads(LABELS_PATH.read_text(encoding="utf-8"))
    field_names = ("role", "min_cgpa", "max_backlogs", "eligible_branches", "required_skills", "preferred_skills")
    field_correct = {field: 0 for field in field_names}
    skill_expected: set[str] = set()
    skill_predicted: set[str] = set()
    incorrect_cases = []
    per_case = []

    for case in labels:
        expected = case["expected"]
        parsed = jd_service.parse_job(case["text"])
        actual = parsed["job"]
        actual_fields = {
            "role": actual["role"],
            "min_cgpa": _normalise_parser_cgpa(actual["min_cgpa"], parsed["warnings"]),
            "max_backlogs": actual["max_backlogs"],
            "eligible_branches": sorted(actual["eligible_branches"]),
            "required_skills": sorted(actual["required_skills"]),
            "preferred_skills": sorted(actual["preferred_skills"]),
        }
        expected_fields = {
            **expected,
            "eligible_branches": sorted(expected["eligible_branches"]),
            "required_skills": sorted(expected["required_skills"]),
            "preferred_skills": sorted(expected["preferred_skills"]),
        }
        case_fields = {}
        for field in field_names:
            if field == "min_cgpa" and actual_fields[field] is not None and expected_fields[field] is not None:
                is_correct = math.isclose(actual_fields[field], expected_fields[field], abs_tol=0.01)
            else:
                is_correct = actual_fields[field] == expected_fields[field]
            case_fields[field] = is_correct
            field_correct[field] += int(is_correct)
        expected_skills = set(expected["required_skills"] + expected["preferred_skills"])
        predicted_skills = set(actual["required_skills"] + actual["preferred_skills"])
        skill_expected.update(f"{case['id']}::{skill}" for skill in expected_skills)
        skill_predicted.update(f"{case['id']}::{skill}" for skill in predicted_skills)
        case_result = {"id": case["id"], "field_correct": case_fields, "actual": actual_fields, "expected": expected_fields}
        per_case.append(case_result)
        if not all(case_fields.values()):
            incorrect_cases.append(case_result)

    field_accuracy = {
        field: {"correct": count, "total": len(labels), "accuracy": round(count / len(labels), 6)}
        for field, count in field_correct.items()
    }
    total_correct = sum(field_correct.values())
    return {
        "labelled_description_count": len(labels),
        "field_accuracy": field_accuracy,
        "overall_field_accuracy": round(total_correct / (len(labels) * len(field_names)), 6),
        "skill_level_precision_recall_f1": _skill_metrics(skill_expected, skill_predicted),
        "skill_scoring_unit": "canonical skill occurrence per labelled JD; required/preferred distinction is also checked in field accuracy",
        "incorrect_cases": incorrect_cases,
        "per_case": per_case,
    }


def evaluate_skills(embedding_loaded: bool) -> dict[str, Any]:
    pairs = json.loads(SKILL_PAIRS_PATH.read_text(encoding="utf-8"))
    exact_expected: list[int] = []
    exact_predicted: list[int] = []
    embedding_predicted: list[int] = []
    pair_results = []
    category_stats: dict[str, dict[str, int]] = {}
    for pair in pairs:
        expected = int(pair["expected_match"])
        alias_prediction = int(
            skill_service.normalize_skill(pair["candidate"]).casefold()
            == skill_service.normalize_skill(pair["required"]).casefold()
        )
        exact_expected.append(expected)
        exact_predicted.append(alias_prediction)
        category = category_stats.setdefault(pair["category"], {"count": 0, "exact_alias_correct": 0})
        category["count"] += 1
        category["exact_alias_correct"] += int(expected == alias_prediction)
        similarity = None
        embedding_prediction = None
        if embedding_loaded:
            if alias_prediction:
                embedding_prediction = 1
            else:
                similarity = skill_service._semantic_similarity(pair["candidate"], pair["required"])
                embedding_prediction = int(similarity is not None and similarity >= skill_service.SIMILARITY_THRESHOLD)
            embedding_predicted.append(embedding_prediction)
        pair_results.append(
            {
                "candidate": pair["candidate"],
                "required": pair["required"],
                "category": pair["category"],
                "expected_match": bool(expected),
                "exact_alias_match": bool(alias_prediction),
                "embedding_similarity": round(similarity, 6) if similarity is not None else None,
                "embedding_match": bool(embedding_prediction) if embedding_prediction is not None else None,
            }
        )

    related_threshold_sweep = None
    related_pair_similarities = None
    if embedding_loaded:
        non_alias_pairs = [
            (pair, pair_results[index]["embedding_similarity"])
            for index, pair in enumerate(pairs)
            if pair["category"] in {"related", "different"}
        ]
        thresholds = [round(0.40 + 0.05 * index, 2) for index in range(9)]
        related_threshold_sweep = []
        expected_related = [int(pair["category"] == "related") for pair, _ in non_alias_pairs]
        for threshold in thresholds:
            predictions = [int(similarity is not None and similarity >= threshold) for _, similarity in non_alias_pairs]
            metrics = _binary_metrics(expected_related, predictions)
            related_threshold_sweep.append(
                {
                    "threshold": threshold,
                    "precision": metrics["precision"],
                    "recall": metrics["recall"],
                    "true_positive": sum(actual == 1 and predicted == 1 for actual, predicted in zip(expected_related, predictions)),
                    "false_positive": sum(actual == 0 and predicted == 1 for actual, predicted in zip(expected_related, predictions)),
                    "false_negative": sum(actual == 1 and predicted == 0 for actual, predicted in zip(expected_related, predictions)),
                    "evaluated_pair_count": len(non_alias_pairs),
                }
            )
        related_pair_similarities = [
            {"candidate": pair["candidate"], "required": pair["required"], "cosine_similarity": similarity}
            for pair, similarity in non_alias_pairs
            if pair["category"] == "related"
        ]

    result: dict[str, Any] = {
        "pair_count": len(pairs),
        "class_counts": {category: sum(pair["category"] == category for pair in pairs) for category in ("same_or_alias", "related", "different")},
        "exact_plus_alias": _binary_metrics(exact_expected, exact_predicted),
        "category_exact_alias_accuracy": {
            category: round(values["exact_alias_correct"] / values["count"], 6)
            for category, values in category_stats.items()
        },
        "embedding_loaded": embedding_loaded,
        "embedding_threshold": skill_service.SIMILARITY_THRESHOLD,
        "pair_results": pair_results,
        "related_threshold_sweep": related_threshold_sweep,
        "related_pair_similarities": related_pair_similarities,
    }
    if embedding_loaded:
        result["embedding_plus_alias"] = _binary_metrics(exact_expected, embedding_predicted)
        result["embedding_category_accuracy"] = {
            category: round(
                sum(
                    int(pair["expected_match"])
                    == embedding_predicted[index]
                    for index, pair in enumerate(pairs)
                    if pair["category"] == category
                )
                / values["count"],
                6,
            )
            for category, values in category_stats.items()
        }
    else:
        result["embedding_plus_alias"] = None
        result["embedding_skip_reason"] = "The sentence-transformers encoder was unavailable; semantic pair scoring was skipped."
    return result


def _binary_metrics(expected: list[int], predicted: list[int]) -> dict[str, float | int]:
    true_positive = sum(actual == 1 and guess == 1 for actual, guess in zip(expected, predicted))
    false_positive = sum(actual == 0 and guess == 1 for actual, guess in zip(expected, predicted))
    false_negative = sum(actual == 1 and guess == 0 for actual, guess in zip(expected, predicted))
    true_negative = sum(actual == 0 and guess == 0 for actual, guess in zip(expected, predicted))
    precision = true_positive / (true_positive + false_positive) if true_positive + false_positive else 0.0
    recall = true_positive / (true_positive + false_negative) if true_positive + false_negative else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "accuracy": round((true_positive + true_negative) / len(expected), 6) if expected else 0.0,
        "precision": round(precision, 6),
        "recall": round(recall, 6),
        "f1": round(f1, 6),
        "correct": true_positive + true_negative,
        "total": len(expected),
    }


def evaluate_risk_model() -> dict[str, Any]:
    metrics = json.loads(RISK_METRICS_PATH.read_text(encoding="utf-8"))
    return {
        **metrics,
        "always_unplaced_accuracy_baseline": metrics["unplaced_rate"],
        "caveats": [
            "About 73 percent of this cohort is unplaced, so accuracy near 0.77 is close to the always-unplaced baseline of 0.73.",
            "Features such as interviews attended come from the same placement funnel that produces the target label.",
            "These are synthetic holdout metrics and are not real-world accuracy estimates.",
        ],
    }


def evaluate_latency(students: list[Student], jobs: list[Job]) -> dict[str, Any]:
    student, job = students[0], jobs[0]
    matching_service.match(student, job)  # warm-up
    match_samples = []
    for _ in range(50):
        started = time.perf_counter()
        matching_service.match(student, job)
        match_samples.append((time.perf_counter() - started) * 1000)

    rank_result = {}
    for requested_count in (100, 500):
        cohort = students[: min(requested_count, len(students))]
        matching_service.rank(job, cohort)  # warm-up
        timings = []
        for _ in range(3):
            started = time.perf_counter()
            matching_service.rank(job, cohort)
            timings.append((time.perf_counter() - started) * 1000)
        rank_result[f"rank_{requested_count}_students"] = {
            "requested_count": requested_count,
            "actual_count": len(cohort),
            "median_ms": round(statistics.median(timings), 4),
            "repetitions_after_warmup": len(timings),
        }
    return {
        "machine_description": f"Developer laptop; {platform.platform()}; processor: {platform.processor() or 'unspecified'}; Python {platform.python_version()}.",
        "match_one_pair": {"pair": {"student_id": student.student_id, "job_id": job.job_id}, "median_ms": round(statistics.median(match_samples), 4), "calls_after_warmup": len(match_samples)},
        **rank_result,
    }


def run_evaluation(
    *, smoke: bool = False, try_embeddings: bool = True, output_path: Path | None = RESULTS_PATH
) -> dict[str, Any]:
    students, jobs, applications, offers = load_data(sample=smoke)
    embedding_loaded = False
    embedding_error = None
    if try_embeddings:
        try:
            skill_service.load_model()
            embedding_loaded = skill_service.model_loaded()
            if not embedding_loaded:
                embedding_error = "Model load returned without an encoder; using alias-only fallback."
        except Exception as exc:  # Record optional model unavailability without stopping the rule-based evaluation.
            embedding_error = f"{type(exc).__name__}: {exc}"

    matching_mode = "embedding_plus_exact_and_alias" if embedding_loaded else "exact_and_alias_only"
    matching_results = evaluate_matching(students, jobs, applications, SEED)
    generator_signal_results = evaluate_shortlist_signal_ceiling(
        applications, matching_results["overall"]["matcher"]["roc_auc"]
    )
    results = {
        "metadata": {
            "seed": SEED,
            "smoke_mode": smoke,
            "data_source": "Synthetic CSV cohort generated with random seed 42.",
            "matching_mode_for_pipeline_metrics": matching_mode,
            "circularity_note": "Applications.csv shortlisting labels were partly generated from required-skill overlap and CGPA, which the matcher also uses, with about 17 percent of outcomes flipped. These matching metrics are partly circular.",
        },
        "matching_vs_shortlisting": matching_results,
        "generator_shortlist_signal_ceiling": generator_signal_results,
        "eligibility_gate_correctness": evaluate_eligibility(
            students, jobs, SEED, sample_count=250 if smoke else 5000
        ),
        "readiness_vs_outcomes": evaluate_readiness(students, offers, smoke),
        "jd_parser_accuracy": evaluate_jds(),
        "skill_matching": evaluate_skills(embedding_loaded),
        "risk_model": evaluate_risk_model(),
        "latency": evaluate_latency(students, jobs),
    }
    results["metadata"]["embedding_load_error"] = embedding_error
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--smoke", action="store_true", help="Run a reduced offline smoke evaluation.")
    parser.add_argument("--no-embeddings", action="store_true", help="Do not attempt to load sentence-transformers.")
    parser.add_argument("--output", type=Path, default=RESULTS_PATH, help="Results JSON destination.")
    args = parser.parse_args()
    results = run_evaluation(
        smoke=args.smoke,
        try_embeddings=not args.no_embeddings and not args.smoke,
        output_path=None if args.smoke else args.output,
    )
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
