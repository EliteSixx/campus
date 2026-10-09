"""Example payloads for every endpoint.

These feed three things: the stub responses, the Swagger "Try it out" defaults at /docs,
and the JSON files exported to /contracts/examples. They describe the demo scenario:
ST001 (strong student), ST104 (at-risk student), JOB001 (backend role).
"""

META = {"engine_version": "0.1.0-stub", "stub": True}

JD_TEXT = "Backend Developer. CSE/IT. CGPA 7+. Python, SQL, REST APIs and Docker required. AWS preferred."

STUDENT_ST001 = {
    "student_id": "ST001",
    "branch": "CSE",
    "cgpa": 8.2,
    "backlogs": 0,
    "graduation_year": 2027,
    "skills": ["Python", "SQL", "Git", "Docker", "REST APIs"],
    "certifications": [],
    "projects": [
        {
            "title": "Library API",
            "tech": ["Python", "FastAPI", "SQL"],
            "description": "REST backend for a college library system",
        }
    ],
    "aptitude_score": 72,
    "communication_score": 65,
    "mock_interview_score": None,
    "is_synthetic": True,
}

STUDENT_ST104 = {
    "student_id": "ST104",
    "branch": "CSE",
    "cgpa": 6.1,
    "backlogs": 2,
    "graduation_year": 2027,
    "skills": ["Python", "HTML"],
    "certifications": [],
    "projects": [],
    "aptitude_score": 45,
    "communication_score": 50,
    "mock_interview_score": 38,
    "is_synthetic": True,
}

JOB_001 = {
    "job_id": "JOB001",
    "company": "Acme Tech",
    "role": "Backend Developer",
    "min_cgpa": 7.0,
    "max_backlogs": 0,
    "eligible_branches": ["CSE", "IT"],
    "required_skills": ["Python", "SQL", "REST APIs", "Docker"],
    "preferred_skills": ["AWS"],
    "experience_years": 0,
    "ctc_lpa": 8.0,
}

PARSED_JOB = {
    "job_id": None,
    "company": None,
    "role": "Backend Developer",
    "min_cgpa": 7.0,
    "max_backlogs": None,
    "eligible_branches": ["CSE", "IT"],
    "required_skills": ["Python", "SQL", "REST APIs", "Docker"],
    "preferred_skills": ["AWS"],
    "experience_years": None,
    "ctc_lpa": None,
}

TARGET_ROLE = {
    "role": "Backend Developer",
    "required_skills": ["Python", "SQL", "REST APIs", "Docker", "AWS", "Redis"],
    "preferred_skills": ["Kubernetes"],
}

# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------
READINESS_RESPONSE = {
    "student_id": "ST001",
    "score": 81,
    "level": "READY",
    "strengths": ["Strong academic performance (82/100)", "Strong technical skills (82/100)"],
    "gaps": ["Mock interview not yet attempted"],
    "recommendations": ["Take a mock interview to identify interview strengths and areas to improve."],
    "breakdown": [
        {"name": "academics", "score": 82, "weight": 0.2777777777777778},
        {"name": "technical_skills", "score": 82, "weight": 0.3888888888888889},
        {"name": "projects", "score": 45, "weight": 0.16666666666666669},
        {"name": "aptitude", "score": 72, "weight": 0.16666666666666669},
        {"name": "communication", "score": 65, "weight": 0.11111111111111112},
    ],
    "meta": {"engine_version": "0.2.0", "stub": False},
}

SKILL_GAP_RESPONSE = {
    "student_id": "ST001",
    "role": "Backend Developer",
    "matched_skills": ["Python", "SQL", "REST APIs", "Docker"],
    "missing_skills": [
        {"skill": "AWS", "priority": "HIGH"},
        {"skill": "Redis", "priority": "MEDIUM"},
        {"skill": "Kubernetes", "priority": "LOW"},
    ],
    "coverage_pct": 67,
    "meta": {"engine_version": "0.2.0", "stub": False},
}

PARSE_JOB_RESPONSE = {
    "job": PARSED_JOB,
    "confidence": 0.56,
    "warnings": [
        "Company not specified",
        "Maximum backlogs not specified",
        "Experience requirement not specified",
        "CTC not specified",
    ],
    "meta": {"engine_version": "0.2.0", "stub": False},
}

MATCH_RESULT_ST001 = {
    "student_id": "ST001",
    "job_id": "JOB001",
    "match_score": 86,
    "eligible": True,
    "matched_skills": ["Python", "SQL", "REST APIs", "Docker"],
    "skill_gaps": ["AWS"],
    "reasons": [
        {"type": "PASS", "text": "CGPA 8.2 meets the minimum of 7.0"},
        {"type": "PASS", "text": "0 active backlogs meet the maximum of 0"},
        {"type": "PASS", "text": "CSE is an eligible branch"},
        {"type": "PASS", "text": "Matches 4 of 4 required skills"},
        {"type": "WARN", "text": "Missing preferred skill: AWS"},
        {"type": "PASS", "text": "Project technology overlaps 75% with required skills"},
        {"type": "PASS", "text": "Placement readiness score is 74"},
        {"type": "PASS", "text": "Assessment average from 2 completed assessments is 68.5"},
    ],
    "breakdown": [
        {"name": "skills", "score": 98.0, "weight": 0.5},
        {"name": "projects", "score": 75.0, "weight": 0.2},
        {"name": "readiness", "score": 74.0, "weight": 0.2},
        {"name": "assessments", "score": 68.5, "weight": 0.1},
    ],
}

MATCH_RESULT_ST104 = {
    "student_id": "ST104",
    "job_id": "JOB001",
    "match_score": 22,
    "eligible": False,
    "matched_skills": ["Python"],
    "skill_gaps": ["SQL", "REST APIs", "Docker", "AWS"],
    "reasons": [
        {"type": "FAIL", "text": "CGPA 6.1 is below the minimum of 7.0"},
        {"type": "FAIL", "text": "2 active backlogs exceed the maximum of 0"},
        {"type": "PASS", "text": "CSE is an eligible branch"},
        {"type": "WARN", "text": "Matches 1 of 4 required skills"},
        {"type": "WARN", "text": "Missing required skill: SQL"},
        {"type": "WARN", "text": "Missing required skill: REST APIs"},
        {"type": "WARN", "text": "Missing required skill: Docker"},
        {"type": "WARN", "text": "Missing preferred skill: AWS"},
        {"type": "WARN", "text": "No project technology overlaps the required skills"},
        {"type": "WARN", "text": "Placement readiness score is 30"},
        {"type": "WARN", "text": "Assessment average from 3 completed assessments is 44.3"},
    ],
    "breakdown": [
        {"name": "skills", "score": 23.0, "weight": 0.5},
        {"name": "projects", "score": 0.0, "weight": 0.2},
        {"name": "readiness", "score": 30.0, "weight": 0.2},
        {"name": "assessments", "score": 44.333333333333336, "weight": 0.1},
    ],
}

MATCH_RESPONSE = {**MATCH_RESULT_ST001, "meta": {"engine_version": "0.2.0", "stub": False}}

RANK_RESPONSE = {
    "job_id": "JOB001",
    "ranked": [
        {"rank": 1, **MATCH_RESULT_ST001},
        {"rank": 2, **MATCH_RESULT_ST104},
    ],
    "meta": {"engine_version": "0.2.0", "stub": False},
}

PREDICT_PLACEMENT_RESPONSE = {
    "student_id": "ST104",
    "risk": "HIGH",
    "probability_unplaced": 0.82,
    "reasons": [
        "Low application-to-shortlist conversion (0 of 6)",
        "Major target-role skill gaps (SQL, REST APIs, Docker)",
        "Below-benchmark mock interview score (38)",
    ],
    "interventions": [
        "3-week backend skills training",
        "2 mock interviews",
        "Assign a faculty mentor",
    ],
    "meta": META,
}

ERROR_EXAMPLE = {
    "error": {
        "code": "INVALID_INPUT",
        "message": "student.cgpa: Input should be less than or equal to 10",
        "field": "student.cgpa",
    }
}

# ---------------------------------------------------------------------------
# Name -> payload (names become files in contracts/examples)
# ---------------------------------------------------------------------------
EXAMPLES = {
    "student": STUDENT_ST001,
    "student-at-risk": STUDENT_ST104,
    "job": JOB_001,
    "readiness.request": {"student": STUDENT_ST001},
    "readiness.response": READINESS_RESPONSE,
    "skill-gap.request": {"student": STUDENT_ST001, "target": TARGET_ROLE},
    "skill-gap.response": SKILL_GAP_RESPONSE,
    "parse-job.request": {"text": JD_TEXT},
    "parse-job.response": PARSE_JOB_RESPONSE,
    "match.request": {"student": STUDENT_ST001, "job": JOB_001},
    "match.response": MATCH_RESPONSE,
    "rank.request": {"job": JOB_001, "students": [STUDENT_ST001, STUDENT_ST104]},
    "rank.response": RANK_RESPONSE,
    "predict-placement.request": {
        "student": STUDENT_ST104,
        "activity": {"drives_applied": 6, "shortlisted": 0, "interviews_attended": 0, "rejections": 6},
    },
    "predict-placement.response": PREDICT_PLACEMENT_RESPONSE,
    "error": ERROR_EXAMPLE,
}
