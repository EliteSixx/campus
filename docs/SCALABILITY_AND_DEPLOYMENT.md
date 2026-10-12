# Scalability and deployment

## Implemented today

- The AI service is FastAPI and runs locally on port 8000. Startup loads the risk artifact, attempts to load/cache the embedding encoder, and warms the analytics summary. CSVs and the completed summary are cached in process memory.
- The web app is a Next.js App Router project. Its typed AI client uses `NEXT_PUBLIC_AI_BASE_URL`, defaulting to `http://localhost:8000`.
- AI analytics reads local synthetic CSVs; the risk predictor loads `ai/app/models/risk_model.joblib`. Web demo data is TypeScript under `web/data/demo/`; offer lifecycle state uses browser localStorage.
- Run locally from the repo root using two PowerShell terminals:

  ```powershell
  # Terminal 1: AI API on port 8000
  cd ai
  .\.venv\Scripts\Activate.ps1
  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```

  ```powershell
  # Terminal 2: web app on port 3000
  cd web
  npm install
  # Set NEXT_PUBLIC_AI_BASE_URL=http://localhost:8000 in .env.local
  npm run dev
  ```

- Intended hosting direction is web on Vercel and the AI service on a container host. Production deployment configuration is not included.

## Planned

| Area | Planned extension | Status today |
| --- | --- | --- |
| Tenant isolation | Add `campus_id` to every campus-owned student, recruiter, job, application, drive, offer, notification, model evaluation, and audit record; enforce scoping at API and database boundaries. | No tenant identifier or enforcement exists. |
| Campus policy | Store per-campus weights, eligibility policy, academic calendar, and configuration version. | Weights and calendar are code/demo configuration, not campus-managed configuration. |
| AI deployment | Package `ai/` in a versioned container. Serve stateless replicas behind a load balancer with health checks and explicit model artifact access. | FastAPI runs locally; no production container or load balancer config is present. Analytics cache is per process and recomputed on each replica. |
| Web deployment | Deploy the Next.js app on Vercel or package `web/` in a versioned web container, with environment-specific AI URLs. | Local scripts exist; production config is absent. |
| Persistent data | Move CSV analytics and browser-only demo records to a database. Add indexes for `campus_id`, student/job/drive IDs, application and offer status, branch, skill, and event due dates. | AI summary reads local CSVs; offers use localStorage; demo records are local TypeScript. |
| Embedding throughput | Load one encoder per AI worker; cache canonical skill vectors and pair similarities, batch encoding new skills, and observe cache hit/memory use. | Embeddings and similarities are cached in process; no shared cache or vector store exists. |
| Ranking throughput | Keep `/ai/rank` requests batched, profile candidate-set latency, bound concurrency, and queue larger work asynchronously if needed. | `/ai/rank` is synchronous and accepts up to 500 students. |
| Training pipeline | Train in background jobs using versioned and checked campus datasets; evaluate and approve artifacts separately from serving. | `ai/scripts/train_risk.py` locally compares logistic regression and gradient boosting on synthetic data. No automated pipeline exists. |
| Notifications | Use background jobs for deadlines and event notifications with retries and idempotency. | Offer notices are web-side logic; there is no delivery worker. |
| Model/config versioning | Version datasets, artifacts, feature definitions, and campus config; expose active engine/model versions in responses. | AI responses expose `engine_version` (currently `0.2.0`); no registry or dataset lineage system exists. |
| Observability | Add structured request logs, latency/error metrics, tracing, model/cache health, and campus-aware dashboards. | Basic logging handles model-load errors; no full observability stack exists. |
| Security | Add role authentication/authorization, tenant-scoped checks, transport security, secret management, retention, and audit logs. Do not log student PII, resumes, interview answers, or offer documents. | Role switcher is a demo UI, not authorization. AI API has no authentication. |
| Rollout | Stage synthetic internal checks, consented shadow evaluation, a monitored limited campus pilot, gradual enablement, and version-based rollback. | No production rollout procedure exists. |

### Staged rollout (planned)

1. Deploy staging web and AI services and keep synthetic data isolated from personal records.
2. Establish identity, authorization, tenant-scoped storage, retention, and audit controls before loading personal data.
3. Run consented shadow evaluation with human review; do not present synthetic evaluation metrics as production accuracy.
4. Pilot one campus with monitored, operator-controlled rollback, then expand only after reviewing outcomes and incidents.
