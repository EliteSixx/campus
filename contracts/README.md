# CampusLink API Contracts

Owner: Rudy. This folder defines what the frontend sends to the AI service and what it gets back. Build against it; do not depend on how scoring works inside.

The contract lives in code (`ai/app/schemas.py`). Everything in this folder is generated from it:

- `openapi.json`: the full machine-readable spec
- `examples/*.json`: a ready-to-copy request and response for every endpoint, using the demo scenario (ST001 strong student, ST104 at-risk student, JOB001 backend role)

## Run the stub service

```bash
cd ai
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs to see every endpoint and try it in the browser. Each one is pre-filled with the demo payload.

Set `CAMPUSLINK_CORS_ORIGINS` (comma-separated) if your frontend does not run on http://localhost:3000.

## Endpoints

| Endpoint | Used by | Request | Response |
|---|---|---|---|
| `POST /ai/readiness` | Samir (student) | `student` | score, level, strengths, gaps, recommendations, breakdown |
| `POST /ai/skill-gap` | Samir (student) | `student`, `target` role | matched skills, missing skills with priority, coverage % |
| `POST /ai/parse-job` | Ishaan (recruiter) | `text` | structured `job`, confidence, warnings |
| `POST /ai/match` | Ishaan (recruiter) | `student`, `job` | match score, eligible, matched skills, gaps, reasons, breakdown |
| `POST /ai/rank` | Ishaan (recruiter) | `job`, `students` (1 to 500) | candidates ranked best first, each with the same explanation as `/ai/match` |
| `POST /ai/predict-placement` | Shiva, Sinu | `student`, `activity` | risk level, probability, reasons, interventions |
| `GET /health` | everyone | none | status |

Example files are named `<endpoint>.request.json` and `<endpoint>.response.json`, for instance `match.request.json`.

## Stub status

While an endpoint is still a stub, every response has `"meta": {"stub": true}`. The shape is final; the values are fixed demo values. Real logic replaces the stubs behind the same contract, with no change needed in your code. Do not show stub numbers as real results once `stub` turns false.

## Conventions

- Field names are `snake_case` everywhere.
- Scores are 0 to 100, except probabilities (0 to 1) and CGPA (0 to 10).
- `null` means "not taken" or "not stated". Never send `0` for a missing score; 0 means the student scored zero.
- Fixed lists: branch (`CSE IT ECE EEE ME CE OTHER`), readiness level (`NOT_READY DEVELOPING READY HIGHLY_EMPLOYABLE`), priority and risk (`LOW MEDIUM HIGH`), reason type (`PASS WARN FAIL`).
- `student.is_synthetic` marks generated records, so they can be told apart from real student input.
- `reasons` in match results are for display: show `PASS` as a tick, `WARN` as a warning, `FAIL` as a cross.
- `breakdown` lists the weighted parts of a score (name, score, weight) for charts and "why this score".

## Errors

Bad input on any endpoint returns HTTP 422 in one shape:

```json
{ "error": { "code": "INVALID_INPUT", "message": "student.cgpa: Input should be less than or equal to 10", "field": "student.cgpa" } }
```

Handle it once in your API client.

## Change rules

1. You may add fields. You may not rename, remove or change the type of a published field.
2. Need a change? Ask Rudy. He updates `ai/app/schemas.py`, regenerates this folder and tells the consumers.
3. Regenerate after any change: `cd ai && python scripts/export_contracts.py`, then commit the result.
4. Never edit the generated files by hand.
