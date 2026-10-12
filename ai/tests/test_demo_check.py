from pathlib import Path

from scripts.demo_check import load_demo_data


REPO_ROOT = Path(__file__).resolve().parents[2]


def test_demo_seed_parser_preserves_api_student_fields_and_null_score():
    demo = load_demo_data(REPO_ROOT)
    students = {student["student_id"]: student for student in demo["students"]}

    assert len(students) == 11
    assert students["ST001"]["mock_interview_score"] is None
    assert students["ST001"]["projects"][0]["tech"]
    assert students["ST104"]["backlogs"] > students["ST001"]["backlogs"]


def test_demo_jobs_and_drive_job_ids_are_loaded_from_typescript():
    demo = load_demo_data(REPO_ROOT)
    jobs = {job["job_id"]: job for job in demo["jobs"]}

    assert {"JOB001", "JOB002", "JOB005"} <= jobs.keys()
    assert demo["rank_jobs"][:3] == ["JOB001", "JOB002", "JOB005"]
    assert jobs["JOB001"]["required_skills"]
    assert demo["activities"]["ST104"]["drives_applied"] == 6
