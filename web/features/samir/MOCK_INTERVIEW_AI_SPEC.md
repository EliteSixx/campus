# Mock interview: proposed AI service endpoints

**For:** Rudy (owner of `ai/**` and `contracts/**`)
**From:** Samir (student features)
**Status:** proposal. The frontend works today without these endpoints.

## Why

The mock interview at `/profile/interview` already uses the AI service for the student analysis:

- `POST /ai/readiness`: score, level, communication component
- `POST /ai/skill-gap`: matched skills and missing skills with priority

It also writes the result back as `mock_interview_score`, which `/ai/readiness` already weights.

Three parts still run in the browser because the service has no endpoints for them:

| Part | Today (frontend) | With the endpoint |
|---|---|---|
| Plan the questions | Rules + fixed question bank (`features/samir/data/interview-engine.ts`, `interview-question-bank.ts`) | Service picks or generates questions per student |
| Score an answer | Keyword coverage, length, structure, filler words, speaking pace | Semantic scoring (e.g. the MiniLM model `skill_service` already loads) |
| Speech-to-text / text-to-speech | Browser Web Speech API (STT only in Chrome and Edge, and the audio goes to the browser vendor's speech service) | Local STT/TTS, works in every browser and keeps audio on our server |

The request and response shapes below match the TypeScript types the frontend already uses (`InterviewPlan`, `PlannedQuestion`, `AnswerEvaluation`). Switching over means replacing two function calls, with no UI changes.

## 1. `POST /ai/interview/plan` (most useful)

```jsonc
// request
{
  "student": { /* existing Student schema */ },
  "target": { "role": "Backend Developer", "required_skills": ["Python", "SQL"], "preferred_skills": ["AWS"] },
  "max_questions": 7
}
// response
{
  "role": "Backend Developer",
  "readiness_score": 85,
  "readiness_level": "HIGHLY_EMPLOYABLE",
  "matched_skills": ["Python", "SQL"],
  "missing_skills": [{ "skill": "Docker", "priority": "HIGH" }],
  "estimated_minutes": 14,
  "questions": [
    {
      "id": "dk-1",
      "kind": "technical",            // intro | technical | project | behavioral
      "section": "Skill gaps",        // Warm-up | Core skills | Skill gaps | Project deep-dive | Behavioral
      "skill": "Docker",              // optional
      "difficulty": "easy",           // easy | medium | hard
      "prompt": "What is the difference between a Docker image and a container?",
      "reason": "Docker is a high-priority gap for Backend Developer.",
      "concepts": [{ "label": "layers", "terms": ["layer", "layers"] }],
      "follow_up": "What would you put in a Dockerfile for a Python app?"   // optional
    }
  ],
  "meta": { "engine_version": "…", "stub": false }
}
```

Planning rules the frontend uses today, as a starting point:
- 1 warm-up question.
- Up to 2 questions on matched skills (harder when the readiness level is `READY` or above).
- Up to 2 on missing skills, `HIGH` priority first, easy difficulty.
- 1 question on the student's first project.
- 1 behavioral question, plus a second one when the communication score is below 70 or not assessed.

## 2. `POST /ai/interview/evaluate`

```jsonc
// request
{
  "question": { /* one PlannedQuestion from the plan */ },
  "transcript": "An image is a template…",
  "duration_sec": 48.2,
  "mode": "voice"                     // voice | text
}
// response
{
  "question_id": "dk-1",
  "score": 72,                        // 0–100
  "covered": ["layers", "Dockerfile"],
  "missed": ["container"],
  "word_count": 96,
  "words_per_minute": 120,           // null for typed answers
  "filler_count": 2,
  "communication": 80,               // 0–100, delivery + structure
  "feedback": ["Strengthen it by mentioning container."],
  "skipped": false
}
```

The current weighting is 50% content, 15% length, 15% structure and 20% delivery. Semantic similarity between the transcript and a reference answer would be a good improvement on the keyword matching.

## 3. Optional: speech

- `POST /ai/speech/transcribe`: multipart audio (webm/opus) → `{ "text": "…", "duration_sec": 41.0 }`. Could use faster-whisper `base.en` on CPU.
- `POST /ai/speech/synthesize`: `{ "text": "…", "voice": "en-IN" }` → `audio/mpeg`. Could use Piper.

With these, STT works in Firefox and Safari, and no audio leaves our infrastructure.

## Errors

Use the existing `ErrorResponse` envelope (`{ "error": { "code", "message", "field" } }`). The frontend already handles it through `AiError`.
