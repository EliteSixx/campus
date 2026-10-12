# AI client

Set `NEXT_PUBLIC_AI_BASE_URL` to the base URL of the AI service. It defaults to
`http://localhost:8000`.

The request and response types in `types.ts` are generated from
`contracts/openapi.json`. Regenerate them from `web/` with:

```sh
npm run gen:ai-types
```

Example:

```ts
import { readiness, type ReadinessRequest } from "@/lib/ai/client";

const request: ReadinessRequest = {
  student: {
    student_id: "ST001",
    branch: "CSE",
    cgpa: 8.2,
    backlogs: 0,
    graduation_year: 2027,
    skills: ["Python", "SQL"],
    certifications: [],
    projects: [],
    aptitude_score: 72,
    communication_score: 65,
    mock_interview_score: null,
    is_synthetic: true,
  },
};

const result = await readiness(request);
console.log(result.level, result.score);
```

Service errors are thrown as `AiError`, including HTTP 422 validation errors.
Network failures use code `NETWORK_ERROR` and have a `null` status because no
HTTP response was received.
