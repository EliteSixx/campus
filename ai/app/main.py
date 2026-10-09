"""CampusLink AI service API, with contracts defined in ``schemas.py``."""
import os

from fastapi import Body, FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import examples as ex
from app.services.jd_service import parse_job as parse_job_text
from app.services.matching_service import match as match_job
from app.services.matching_service import rank as rank_students
from app.services.readiness_service import compute_readiness
from app.services.skill_service import skill_gap as compute_skill_gap
from app.schemas import (
    ErrorResponse,
    MatchRequest,
    MatchResponse,
    ParseJobRequest,
    ParseJobResponse,
    PredictPlacementRequest,
    PredictPlacementResponse,
    RankRequest,
    RankResponse,
    ReadinessRequest,
    ReadinessResponse,
    SkillGapRequest,
    SkillGapResponse,
)

app = FastAPI(
    title="CampusLink AI Service",
    version="0.1.0",
    description="Readiness, skill-gap, JD parsing, matching and placement-risk APIs. "
    "Responses carry meta.stub = true for endpoints that still return hardcoded data.",
)

origins = os.getenv("CAMPUSLINK_CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

ERRORS = {422: {"model": ErrorResponse, "description": "Invalid input"}}


def example_body(name: str):
    """Pre-fills Swagger's 'Try it out' with the demo payload."""
    return Body(..., openapi_examples={"demo": {"summary": "Demo scenario", "value": ex.EXAMPLES[name]}})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc: RequestValidationError):
    """Every endpoint reports bad input in the same shape."""
    first = exc.errors()[0]
    field = ".".join(str(p) for p in first["loc"] if p != "body") or None
    message = f"{field}: {first['msg']}" if field else first["msg"]
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "INVALID_INPUT", "message": message, "field": field}},
    )


@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "engine_version": ex.META["engine_version"], "stub": ex.META["stub"]}


@app.post("/ai/readiness", response_model=ReadinessResponse, responses=ERRORS, tags=["Student"])
def readiness(req: ReadinessRequest = example_body("readiness.request")):
    return compute_readiness(req.student)


@app.post("/ai/skill-gap", response_model=SkillGapResponse, responses=ERRORS, tags=["Student"])
def skill_gap(req: SkillGapRequest = example_body("skill-gap.request")):
    return compute_skill_gap(req.student, req.target).model_dump(mode="json")


@app.post("/ai/parse-job", response_model=ParseJobResponse, responses=ERRORS, tags=["Recruiter"])
def parse_job(req: ParseJobRequest = example_body("parse-job.request")):
    return parse_job_text(req.text)


@app.post("/ai/match", response_model=MatchResponse, responses=ERRORS, tags=["Recruiter"])
def match(req: MatchRequest = example_body("match.request")):
    result = match_job(req.student, req.job)
    return {
        **result.model_dump(mode="json"),
        "meta": {"engine_version": "0.2.0", "stub": False},
    }


@app.post("/ai/rank", response_model=RankResponse, responses=ERRORS, tags=["Recruiter"])
def rank(req: RankRequest = example_body("rank.request")):
    return {
        "job_id": req.job.job_id,
        "ranked": [item.model_dump(mode="json") for item in rank_students(req.job, req.students)],
        "meta": {"engine_version": "0.2.0", "stub": False},
    }


@app.post(
    "/ai/predict-placement",
    response_model=PredictPlacementResponse,
    responses=ERRORS,
    tags=["Placement Cell"],
)
def predict_placement(req: PredictPlacementRequest = example_body("predict-placement.request")):
    return {**ex.PREDICT_PLACEMENT_RESPONSE, "student_id": req.student.student_id}
