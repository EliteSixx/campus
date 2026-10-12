# Models and algorithms

## Implemented today

CampusLink uses explicit rules, one optional sentence-transformers encoder for semantic skill matching, and one trained placement-risk classifier. **There is no LLM.** Matching, explanations, and interview question selection do not call a generative model.

### Readiness (`ai/app/services/readiness_service.py`)

- **Inputs:** CGPA, active backlogs, skills, certifications, project technology, aptitude, communication, and mock-interview scores. A null score means the assessment was not taken.
- **Algorithm and weights:** academics is `max(0, CGPA * 10 - 10 * backlogs)`. Base weights are academics `0.25`, technical skills `0.35`, projects `0.15`, aptitude `0.15`, and communication `0.10`. A present mock-interview score adds weight `0.10` while scaling every base weight by `0.90`. Missing assessment components are dropped, then remaining weights are normalized to total one.
- **Technical skills:** each skill contributes `8 * core_weight`; project demonstration of that skill adds the same amount; a matching certification adds `4 * core_weight`; each represented catalog category adds `1.5`. The score is capped at 100. Catalog weights live in `ai/app/data/skills.json`; unknown skills use core weight `0.5`.
- **Projects:** `25` per project plus `10` per project-tech overlap with a listed student skill, capped at 100.
- **Thresholds:** rounded score `0-49 NOT_READY`, `50-69 DEVELOPING`, `70-84 READY`, and `85-100 HIGHLY_EMPLOYABLE`. Strengths require component scores above 75; component gaps are below 60; missing assessments produce explicit gaps.
- **Explainability:** each used component and normalized weight, strengths, gap statements, and a concrete recommendation per gap are returned.
- **Libraries and limits:** Python, Pydantic schemas, and local JSON catalog. Rules do not measure actual skill proficiency; catalog coverage limits technical scoring.

### Skill gap (`skill_service.py`)

- **Inputs:** student skills and target role required/preferred skills.
- **Algorithm:** canonicalize aliases through the shared catalog. Assign exact/alias matches first. Remaining candidates match semantically at cosine similarity `>= 0.75`; each student skill can satisfy only one requested skill. Missing required core skills have `HIGH` priority, other required gaps `MEDIUM`, preferred gaps `LOW`. Coverage is matched required skills divided by required skill count.
- **Libraries:** Python and `sentence-transformers` model `all-MiniLM-L6-v2`; embeddings and pair similarities are cached in process. Startup attempts a load; genuine load failure falls back to alias-only matching.
- **Limits:** similarity is not proof of equivalent competence. The model can be unavailable offline; catalog and threshold are fixed.

### Job-description parser (`jd_service.py`)

- **Inputs:** recruiter text.
- **Algorithm:** regular expressions find an explicit Role/Position or first sentence/line; CGPA forms including percentages (divided by 10 with a warning); backlog limit/no backlogs; recognized branches; catalog skills and aliases; preferred phrases; experience and CTC. Confidence is the fraction of nine tracked fields found. Missing fields create warnings.
- **Explainability:** structured extracted fields, confidence, and warnings disclose what was found or absent; percentage conversion emits its own warning.
- **Libraries and limits:** Python regular expressions and shared skills JSON. This is not an NLP model; unusual wording and catalog omissions can cause misses. For an unstated minimum CGPA, the current Job schema output uses `0.0` with a warning rather than null.

### Matching, ranking, fit level, and summary (`matching_service.py`)

- **Inputs:** one student and structured job; rank accepts up to 500 students for one job.
- **Eligibility gates:** CGPA must meet the job minimum; active backlogs must not exceed the stated maximum; branch must be listed unless the eligible-branch list is empty. Each gate always emits PASS or FAIL. Ineligible match scores are capped at 40.
- **Score:** skills `0.50`, projects `0.20`, readiness `0.20`, assessments `0.10`. Skills score is required-skill coverage minus `2` points per missing preferred skill, floored at zero; with no required skills it is 100. Projects score is zero without overlap, otherwise `50 + 50 * required-skill overlap coverage`, capped at 100. Readiness reuses the readiness score. Assessments average the non-null aptitude, communication, and mock scores; if all are absent, neutral 50 is used and explicitly explained.
- **Fit thresholds:** ineligible or score `<=49`: `NOT_READY`; `50-69`: `DEVELOPING`; `70-84`: `READY`; `85+`: `HIGHLY_EMPLOYABLE`.
- **Ranking:** eligible candidates sort first, then descending match score.
- **Explainability:** gate PASS/FAIL and skill/project/readiness/assessment PASS/WARN reasons; matched/missing skill lists; fixed weighted breakdown; summary text using actual gate values, skill counts, and largest remaining gap. It is programmatic text, not LLM output.
- **Libraries and limits:** Python, Pydantic, standard statistics, and skill comparison which can use cached embeddings. Ranking calls the per-student matcher and has a 500-student API limit.

### Placement risk (`risk_service.py`)

- **Target/features:** probability a student remains unplaced, defined as having no accepted offer. Fourteen features: readiness score and academics/technical/project components; CGPA; backlogs; skill coverage; aptitude; communication; drives applied; shortlist rate; interviews attended; rejections; mock-interview score.
- **Training:** `ai/scripts/train_risk.py` compares median-imputed/scaled logistic regression (`max_iter=1200`, balanced classes) and median-imputed gradient boosting (`70` estimators, depth `2`, learning rate `0.05`, minimum leaf `10`). Both use stratified 80/20 split, seed 42; ROC-AUC selects the saved model.
- **Current metrics:** `ai/app/models/risk_metrics.json` selects `gradient_boosting`: accuracy `0.7733`, precision `0.8193`, recall `0.8864`, F1 `0.8515`, ROC-AUC `0.8568`; confusion matrix `[[37,43],[25,195]]` with actual rows [placed, unplaced], predicted columns [placed, unplaced]. These synthetic metrics are not real-world accuracy.
- **Risk thresholds:** below `0.35` LOW; `0.35-0.65` MEDIUM; above `0.65` HIGH.
- **Explainability:** response contains probability and risk, up to three feature contribution reasons, and one corresponding rule-based intervention per reason. Importance is combined with standardized distance from training medians and class-mean direction.
- **Libraries and limits:** scikit-learn, NumPy, and joblib. Synthetic outcomes and funnel features, including interviews attended, are correlated with the data generation. See [evaluation](EVALUATION.md). Missing artifact gives the documented stub response; an existing invalid artifact warns and raises.

### Analytics (`analytics_service.py`)

- **Inputs:** generated students, jobs, applications, interviews, and offers CSVs.
- **Algorithm:** Python aggregation computes totals, branch/skill conversions, package trends, company pipelines, funnel counts, and optional model risk counts. The readiness service determines the placement-ready count.
- **Caching:** CSVs and skill aliases are cached; completed response is computed under a lock, cached once in memory, and warmed during FastAPI startup. This cache is per process.
- **Limits:** reads seed-42 synthetic CSVs. Data edits while running do not refresh the summary automatically.

### Scheduler conflict detection (web app)

- **Inputs:** drive time intervals, student ID lists, venue, panel, local academic calendar, and recorded override data.
- **Algorithm:** TypeScript first checks interval overlap; each overlapping drive pair can produce separate conflicts for normalized venue, panel, and intersecting student IDs. Free-slot suggestions retain duration and scan in 30-minute steps, rejecting hard resource conflicts. Academic blocks/warnings are separate; a blocked date requires an explicit override, which never bypasses hard student/venue/panel conflicts.
- **Explainability:** conflict rows name the resource and overlapping window. Suggestions include calendar warnings and whether override is required.
- **Libraries and limits:** local TypeScript utilities and web-side data/state, not AI service logic. No cross-campus or distributed scheduling lock is present.
- The scheduler module has no localStorage persistence; it operates on the drive data loaded by the web page. Offer lifecycle persistence is a separate web-side store.

### Scripted mock interview

The web mock interview uses AI readiness and skill-gap results to plan around the profile. Question selection comes from a curated local question bank and rules. Answer scoring weights content `0.50`, length `0.15`, structure `0.15`, delivery `0.20`. It is a scripted question bank and rule-based score, not an LLM interview.

## Planned

- No generative AI or LLM integration is implemented or implied by these algorithms.
- Campus calibration, externally validated metrics, calibrated probabilities, and fairness analysis remain future work; the synthetic cohort cannot establish those properties.
- Persistent scheduler state and cross-user concurrency controls are not implemented.
