"""CampusLink AI service: API contract.

This file is the single source of truth for every request and response shape.
FastAPI generates the OpenAPI spec (contracts/openapi.json) from these models.

Rules:
  * Add fields; never rename or remove one that is already published.
  * One concept = one name everywhere (student_id, not studentId or sid).
  * Optional score fields use null for "not taken", never 0.
"""
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Fixed lists, defined once
# ---------------------------------------------------------------------------
class Branch(str, Enum):
    CSE = "CSE"
    IT = "IT"
    ECE = "ECE"
    EEE = "EEE"
    ME = "ME"
    CE = "CE"
    OTHER = "OTHER"


class ReadinessLevel(str, Enum):
    NOT_READY = "NOT_READY"  # 0-49
    DEVELOPING = "DEVELOPING"  # 50-69
    READY = "READY"  # 70-84
    HIGHLY_EMPLOYABLE = "HIGHLY_EMPLOYABLE"  # 85-100


class Priority(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ReasonType(str, Enum):
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"


# ---------------------------------------------------------------------------
# Shared building blocks
# ---------------------------------------------------------------------------
class Meta(BaseModel):
    engine_version: str = Field(description="Version of the AI engine that produced this response.")
    stub: bool = Field(description="True while the endpoint returns hardcoded stub data.")


class ScoreComponent(BaseModel):
    """One weighted part of a score, for explainability (charts, 'why this score')."""

    name: str
    score: float = Field(ge=0, le=100)
    weight: float = Field(ge=0, le=1, description="Weights in one breakdown sum to 1.")


class Reason(BaseModel):
    type: ReasonType
    text: str


class ErrorBody(BaseModel):
    code: str = Field(description="Machine-readable, e.g. INVALID_INPUT.")
    message: str
    field: Optional[str] = Field(default=None, description="Dotted path to the bad field, e.g. student.cgpa.")


class ErrorResponse(BaseModel):
    error: ErrorBody


# ---------------------------------------------------------------------------
# Student (same shape for synthetic data and the real profile form)
# ---------------------------------------------------------------------------
class Project(BaseModel):
    title: str
    tech: list[str] = Field(default_factory=list)
    description: Optional[str] = None


class Student(BaseModel):
    student_id: str = Field(min_length=1, description="e.g. ST001")
    branch: Branch
    cgpa: float = Field(ge=0, le=10)
    backlogs: int = Field(default=0, ge=0, description="Active backlogs.")
    graduation_year: int = Field(ge=2020, le=2040)
    skills: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    aptitude_score: Optional[float] = Field(default=None, ge=0, le=100, description="null = not taken.")
    communication_score: Optional[float] = Field(default=None, ge=0, le=100, description="null = not taken.")
    mock_interview_score: Optional[float] = Field(default=None, ge=0, le=100, description="null = not taken.")
    is_synthetic: bool = Field(default=False, description="True for generated records, False for real student input.")


# ---------------------------------------------------------------------------
# Job (the structured form of a JD)
# ---------------------------------------------------------------------------
class Job(BaseModel):
    job_id: Optional[str] = Field(default=None, description="Assigned when the job is saved; null straight after parsing.")
    company: Optional[str] = None
    role: str
    min_cgpa: float = Field(default=0, ge=0, le=10)
    max_backlogs: Optional[int] = Field(default=None, ge=0, description="null = no limit stated.")
    eligible_branches: list[Branch] = Field(default_factory=list, description="Empty = all branches.")
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    experience_years: Optional[float] = Field(default=None, ge=0)
    ctc_lpa: Optional[float] = Field(default=None, ge=0, description="Offered CTC in lakhs per annum.")


# ---------------------------------------------------------------------------
# POST /ai/readiness
# ---------------------------------------------------------------------------
class ReadinessRequest(BaseModel):
    student: Student


class ReadinessResponse(BaseModel):
    student_id: str
    score: int = Field(ge=0, le=100)
    level: ReadinessLevel
    strengths: list[str]
    gaps: list[str]
    recommendations: list[str]
    breakdown: list[ScoreComponent] = Field(
        description="Weighted components. If a score is null, its weight is redistributed over the rest."
    )
    meta: Meta


# ---------------------------------------------------------------------------
# POST /ai/skill-gap
# ---------------------------------------------------------------------------
class TargetRole(BaseModel):
    role: str
    required_skills: list[str]
    preferred_skills: list[str] = Field(default_factory=list)


class SkillGapRequest(BaseModel):
    student: Student
    target: TargetRole


class MissingSkill(BaseModel):
    skill: str
    priority: Priority


class SkillGapResponse(BaseModel):
    student_id: str
    role: str
    matched_skills: list[str]
    missing_skills: list[MissingSkill]
    coverage_pct: int = Field(ge=0, le=100, description="Share of required skills the student has.")
    meta: Meta


# ---------------------------------------------------------------------------
# POST /ai/parse-job
# ---------------------------------------------------------------------------
class ParseJobRequest(BaseModel):
    text: str = Field(min_length=10, description="Raw job description text typed or pasted by the recruiter.")


class ParseJobResponse(BaseModel):
    job: Job
    confidence: float = Field(ge=0, le=1)
    warnings: list[str] = Field(description="Fields the parser could not find or was unsure about.")
    meta: Meta


# ---------------------------------------------------------------------------
# POST /ai/match   and   POST /ai/rank
# ---------------------------------------------------------------------------
class MatchResult(BaseModel):
    student_id: str
    job_id: Optional[str] = None
    match_score: int = Field(ge=0, le=100)
    eligible: bool
    matched_skills: list[str]
    skill_gaps: list[str]
    reasons: list[Reason]
    breakdown: list[ScoreComponent]


class MatchRequest(BaseModel):
    student: Student
    job: Job


class MatchResponse(MatchResult):
    meta: Meta


class RankRequest(BaseModel):
    job: Job
    students: list[Student] = Field(min_length=1, max_length=500)


class RankedMatch(MatchResult):
    rank: int = Field(ge=1)


class RankResponse(BaseModel):
    job_id: Optional[str] = None
    ranked: list[RankedMatch] = Field(description="Eligible candidates first, then ineligible; each group by score, highest first.")
    meta: Meta


# ---------------------------------------------------------------------------
# POST /ai/predict-placement
# ---------------------------------------------------------------------------
class PlacementActivity(BaseModel):
    drives_applied: int = Field(default=0, ge=0)
    shortlisted: int = Field(default=0, ge=0)
    interviews_attended: int = Field(default=0, ge=0)
    rejections: int = Field(default=0, ge=0)


class PredictPlacementRequest(BaseModel):
    student: Student
    activity: PlacementActivity = Field(default_factory=PlacementActivity)


class PredictPlacementResponse(BaseModel):
    student_id: str
    risk: RiskLevel
    probability_unplaced: float = Field(ge=0, le=1)
    reasons: list[str]
    interventions: list[str]
    meta: Meta


# ---------------------------------------------------------------------------
# GET /ai/analytics/summary
# ---------------------------------------------------------------------------
class AnalyticsTotals(BaseModel):
    students: int = Field(ge=0)
    placement_ready: int = Field(ge=0)
    jobs_with_applications: int = Field(ge=0, description="Distinct jobs that received at least one application.")
    applications: int = Field(ge=0)
    shortlisted: int = Field(ge=0)
    interviewed: int = Field(ge=0)
    offers_made: int = Field(ge=0)
    offers_accepted: int = Field(ge=0)
    offers_not_accepted: int = Field(ge=0, description="Offers recorded as not accepted; the synthetic data has no pending state.")
    placed: int = Field(ge=0)
    unplaced: int = Field(ge=0)


class BranchConversion(BaseModel):
    branch: Branch
    students: int = Field(ge=0)
    placed: int = Field(ge=0)
    conversion_pct: float = Field(ge=0, le=100)


class SkillConversion(BaseModel):
    skill: str
    students_with_skill: int = Field(ge=0)
    placed_with_skill: int = Field(ge=0)
    conversion_pct: float = Field(ge=0, le=100)
    demand_in_jobs: int = Field(ge=0)


class PackageOverallTrend(BaseModel):
    average_ctc_lpa: float = Field(ge=0)
    median_ctc_lpa: float = Field(ge=0)
    highest_ctc_lpa: float = Field(ge=0)


class PackageBranchTrend(BaseModel):
    branch: Branch
    average_ctc_lpa: float = Field(ge=0)
    highest_ctc_lpa: float = Field(ge=0)


class PackageCompanyTrend(BaseModel):
    company: str
    average_ctc_lpa: float = Field(ge=0)
    offers: int = Field(ge=0)


class PackageTrends(BaseModel):
    overall: PackageOverallTrend
    per_branch: list[PackageBranchTrend]
    per_company: list[PackageCompanyTrend]


class RecruiterPipeline(BaseModel):
    company: str
    jobs: int = Field(ge=0)
    applications: int = Field(ge=0)
    shortlisted: int = Field(ge=0)
    interviewed: int = Field(ge=0)
    offers: int = Field(ge=0)
    accepted: int = Field(ge=0)
    repeat_hiring: bool
    conversion_pct: float = Field(ge=0, le=100)


class AnalyticsFunnel(BaseModel):
    applied: int = Field(ge=0)
    shortlisted: int = Field(ge=0)
    interviewed: int = Field(ge=0)
    offered: int = Field(ge=0)
    accepted: int = Field(ge=0)


class AtRiskCounts(BaseModel):
    low: int = Field(ge=0)
    medium: int = Field(ge=0)
    high: int = Field(ge=0)


class AnalyticsSummary(BaseModel):
    totals: AnalyticsTotals
    branch_conversion: list[BranchConversion]
    skill_conversion: list[SkillConversion]
    package_trends: PackageTrends
    recruiter_pipeline: list[RecruiterPipeline]
    funnel: AnalyticsFunnel
    at_risk: Optional[AtRiskCounts] = None
    data_source: str
