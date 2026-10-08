// ─── Institution Dashboard Data Contracts ────────────────────────────
// Every interface here is the source of truth for both mock data and
// future API responses. A backend dev implements these same shapes;
// the frontend swaps fetch calls — zero UI change.

// ─── Master Dashboard ────────────────────────────────────────────────

export interface InstitutionKPIs {
  totalStudents: number;
  assessedPercent: number;
  placementReadyPercent: number;
  activeInternships: number;
  studentsPlaced: number;
  totalPartners: number;
}

export interface KPITrend {
  metric: string;
  current: number;
  previous: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
}

export interface DashboardOverview {
  kpis: InstitutionKPIs;
  trends: KPITrend[];
  departmentSummary: DepartmentSummaryRow[];
  topSkillGaps: SkillGapSummary[];
  internshipPipeline: PipelineSummary;
  partnerHighlights: PartnerHighlight[];
}

// ─── Departments ─────────────────────────────────────────────────────

export interface DepartmentSummaryRow {
  id: string;
  name: string;
  shortName: string;
  totalStudents: number;
  assessedPercent: number;
  placementReadyPercent: number;
  placedCount: number;
  avgSkillScore: number;
  criticalGapCount: number;
}

export interface DepartmentDetail {
  id: string;
  name: string;
  shortName: string;
  hod: string;
  totalStudents: number;
  assessedPercent: number;
  placementReadyPercent: number;
  placedCount: number;
  avgSkillScore: number;
  skillRadar: { category: string; score: number; benchmark: number }[];
  placementTrend: { year: string; placed: number; total: number; rate: number }[];
  topCompetencies: { skill: string; avgScore: number; industryDemand: number; gap: number }[];
  recruiterFeedback: { company: string; rating: number; comment: string; date: string }[];
  readinessDistribution: { bucket: string; count: number; percent: number }[];
}

// ─── Skills Matrix ───────────────────────────────────────────────────

export interface SkillMatrixCell {
  deptId: string;
  deptShortName: string;
  avgScore: number | null; // null when out of curriculum / not applicable
  studentsAssessed: number;
  isRelevant?: boolean;
}

export interface SkillMatrixRow {
  skillId: string;
  skillName: string;
  category: string;
  departments: SkillMatrixCell[];
  industryDemand: number;
  overallAvg: number;
  gap: number;
  isCommonSkill?: boolean;
  relevantDeptIds?: string[];
}

export interface DepartmentSubjectSkill {
  id: string;
  name: string;
  category: string;
  curriculumSubject: string;
  subjectCode: string;
  semester: string;
  studentAvg: number;
  industryDemand: number;
  gap: number;
  studentsAssessed: number;
  benchmarkMet: boolean;
}

export interface DepartmentJobRoleMapping {
  roleId: string;
  title: string;
  topRecruiters: string[];
  requiredSkills: string[];
  studentReadinessPercent: number;
  annualOpeningsEstimate: number;
  avgPackageLPA: string;
}

export interface DepartmentSkillProfile {
  deptId: string;
  deptName: string;
  deptShortName: string;
  categories: string[];
  skills: DepartmentSubjectSkill[];
  jobRoles: DepartmentJobRoleMapping[];
}

export interface SkillGapSummary {
  skillName: string;
  gap: number;
  industryDemand: number;
  studentAvg: number;
  worstDept: string;
}

export interface CohortAnalytics {
  batchComparison: { batch: string; avgReadiness: number; assessedPercent: number }[];
  categoryBreakdown: { category: string; avgScore: number; skillCount: number }[];
}

// ─── Internships & Placements ────────────────────────────────────────

export type InternshipStatus = "applied" | "shortlisted" | "ongoing" | "completed" | "rejected";

export interface InternshipRecord {
  id: string;
  studentName: string;
  studentId: string;
  department: string;
  company: string;
  role: string;
  status: InternshipStatus;
  startDate: string;
  endDate: string | null;
  stipend: string;
  type: "Internship" | "Placement";
}

export interface PipelineSummary {
  applied: number;
  shortlisted: number;
  ongoing: number;
  completed: number;
  rejected: number;
  total: number;
}

export interface PlacementTrend {
  month: string;
  placements: number;
  internships: number;
}

// ─── Corporate Partners ──────────────────────────────────────────────

export type MoUStatus = "active" | "expiring-soon" | "expired" | "pending";
export type EngagementLevel = "high" | "moderate" | "low";

export interface CorporatePartner {
  id: string;
  name: string;
  initials: string;
  industry: string;
  hq: string;
  mouStatus: MoUStatus;
  mouStart: string;
  mouEnd: string;
  engagementLevel: EngagementLevel;
  engagementScore: number;
  studentsHired: number;
  activePrograms: number;
  programs: PartnerProgram[];
  hiringHistory: { year: string; hired: number }[];
  contactPerson: string;
  contactEmail: string;
}

export interface PartnerProgram {
  name: string;
  type: "FDP" | "Workshop" | "Hackathon" | "Guest Lecture" | "Internship Drive";
  date: string;
  participants: number;
}

export interface PartnerHighlight {
  id: string;
  name: string;
  initials: string;
  engagementLevel: EngagementLevel;
  studentsHired: number;
  mouStatus: MoUStatus;
}

// ─── Student Directory ───────────────────────────────────────────────

export type PlacementStatus = "placed" | "interning" | "seeking" | "not-assessed";

export interface InstitutionStudent {
  regId: string;
  name: string;
  department: string;
  deptId: string;
  year: string;
  email: string;
  careerGoal: string;
  skillReadiness: number;
  employabilityScore: number;
  placementStatus: PlacementStatus;
  topSkills: { name: string; score: number }[];
  assessedDate: string | null;
  cgpa: number;
  activeBacklogs: number;
  offerCount: number;
}

// ─── Placement Policies ──────────────────────────────────────────────

export interface PlacementPolicy {
  minCgpa: number;
  maxActiveBacklogs: number;
  maxOffersPerStudent: number;
}

export interface DepartmentEligibilityStats {
  deptId: string;
  deptName: string;
  totalStudents: number;
  eligibleCount: number;
  ineligibleCount: number;
  ineligibleDueToCgpa: number;
  ineligibleDueToBacklogs: number;
  ineligibleDueToOffers: number;
}

export interface EligibilityMatrixData {
  policy: PlacementPolicy;
  departments: DepartmentEligibilityStats[];
  totalEligible: number;
  totalIneligible: number;
}

// ─── Campus Placement Drives ────────────────────────────────────────

export type DriveStatus = "upcoming" | "registration-open" | "assessment-ongoing" | "interviews-ongoing" | "completed";
export type DriveTier = "super-dream" | "dream" | "core-it" | "mass-recruitment";

export interface DriveRound {
  id: string;
  roundNumber: number;
  name: string;
  date: string;
  clearedCount: number;
  totalAppeared: number;
  status: "pending" | "in-progress" | "completed";
}

export interface DriveCandidate {
  regId: string;
  studentName: string;
  department: string;
  deptId: string;
  cgpa: number;
  currentRound: string;
  status: "registered" | "shortlisted" | "in-review" | "cleared" | "rejected" | "offered";
}

export interface CampusPlacementDrive {
  id: string;
  companyName: string;
  companyInitials: string;
  role: string;
  tier: DriveTier;
  packageLPA: number;
  packageDisplay: string;
  location: string;
  driveDate: string;
  registrationDeadline: string;
  eligibleDeptIds: string[];
  eligibleDeptNames: string[];
  minCgpa: number;
  maxBacklogsAllowed: number;
  status: DriveStatus;
  currentRoundIndex: number;
  rounds: DriveRound[];
  registeredCount: number;
  eligibleApplicantCount: number;
  shortlistedCount: number;
  offersReleased: number;
  candidates: DriveCandidate[];
}

// ─── Placement Readiness & Intervention Intelligence ─────────────────

export type ReadinessStatus = "ready" | "at-risk" | "critical";
export type InterventionPriority = "high" | "medium" | "low";

export interface DepartmentReadinessIntelligence {
  deptId: string;
  deptName: string;
  shortName: string;
  totalStudents: number;
  assessedPercent: number;
  placementReadyPercent: number;
  status: ReadinessStatus;
  priority: InterventionPriority;
  primarySkillDeficit: string;
  policyDisqualificationPercent: number;
  drivesEligibleCount: number;
  totalDrivesCount: number;
  recommendedIntervention: string;
  suggestedProgramName: string;
  baselineReadiness: number;
  targetStudents: number;
  affectedActiveDrives: {
    driveId: string;
    companyName: string;
    role: string;
    driveDate: string;
    status: string;
  }[];
  curriculumGaps: string[];
  keyRiskFactors: {
    title: string;
    description: string;
    severity: "critical" | "high" | "medium";
  }[];
}

export interface PriorityInterventionAction {
  id: string;
  priority: "critical" | "high" | "medium";
  deptId: string;
  deptShortName: string;
  title: string;
  targetDrive: string;
  driveDate: string;
  affectedStudentsCount: number;
  recommendedRemediation: string;
  suggestedDuration: string;
}

// ─── Curriculum–Industry Alignment Intelligence ──────────────────────

export type TopicClassification =
  | "foundational"
  | "industry-relevant"
  | "industry-advanced"
  | "missing-recommended";

export type AlignmentStatus = "strong" | "moderate" | "needs-improvement";

export interface CurriculumTopic {
  id: string;
  name: string;
  classification: TopicClassification;
  description: string;
  industryRelevanceScore: number; // 0 - 100
  mappedSkills: string[];
  connectedJobRoles?: string[];
  priority?: "high" | "medium" | "low";
  rationale?: string;
}

export interface SubjectCurriculumAlignment {
  id: string;
  code: string;
  title: string;
  department: string;
  deptId: string;
  semester: string;
  primaryFacultyId: string;
  primaryFacultyName: string;
  primaryFacultyDesignation: string;
  credits: number;
  totalTopicsCount: number;
  foundationalCount: number;
  industryRelevantCount: number;
  industryAdvancedCount: number;
  missingRecommendedCount: number;
  alignmentScore: number; // percentage, e.g. 78
  alignmentStatus: AlignmentStatus;
  topics: CurriculumTopic[];
  strengths: string[];
  growthAreas: string[];
  recommendedAdditions: {
    topic: string;
    reason: string;
    priority: "high" | "medium" | "low";
    suggestedWeek: string;
  }[];
  industryJobRoleLinks: {
    roleTitle: string;
    alignmentPercent: number;
    topHiringPartners: string[];
  }[];
}

// ─── Accreditation & Compliance Intelligence ─────────────────────────

export type ComplianceStatus = "compliant" | "attention" | "non-compliant" | "informational";

export interface AccreditationEvidenceItem {
  id: string;
  category: "Placement Outcomes" | "Skill Development" | "Curriculum Alignment" | "Industry Engagement" | "Faculty & Academic" | "Policy Compliance";
  metric: string;
  currentValue: string | number;
  targetThreshold: string | null;
  status: ComplianceStatus;
  sourceFeature: string;
  sourceHref: string;
  supportingContext: string;
}

export interface AccreditationCategorySummary {
  category: "Placement Outcomes" | "Skill Development" | "Curriculum Alignment" | "Industry Engagement" | "Faculty & Academic" | "Policy Compliance";
  compliantCount: number;
  attentionCount: number;
  informationalCount: number;
  totalMetrics: number;
  items: AccreditationEvidenceItem[];
}

export interface InstitutionalAuditReport {
  institutionName: string;
  academicYear: string;
  generatedDate: string;
  auditScope: string;
  executiveSummary: string;
  overallComplianceRating: string;
  totalMetricsTracked: number;
  compliantCount: number;
  attentionCount: number;
  categories: AccreditationCategorySummary[];
  departmentPerformance: {
    deptId: string;
    deptName: string;
    students: number;
    placed: number;
    placementRate: number;
    avgSkillScore: number;
    readinessStatus: string;
    curriculumAlignment: number;
  }[];
  improvementPriorities: PriorityInterventionAction[];
}

// ─── Placement Performance & Outcome Analytics ────────────────────────

export interface RecruitmentFunnelStage {
  stage: string;
  count: number;
  conversionPercent: number;
  overallPercent: number;
  lossCount: number;
}

export interface FunnelBottleneckAnalysis {
  stageFrom: string;
  stageTo: string;
  dropRatePercent: number;
  candidatesLost: number;
  identifiedFriction: string;
  recommendedFocus: string;
}

export interface DepartmentReadinessOutcomeRow {
  deptId: string;
  deptName: string;
  shortName: string;
  totalStudents: number;
  placedCount: number;
  placementRate: number;
  readinessScore: number;
  readinessTier: "High" | "Moderate" | "Low";
  quadrantClassification: "Top Performer" | "Strong Outcome" | "Conversion Gap" | "High Intervention Priority";
  medianCTC: string;
  avgCTC: string;
  trend: "improving" | "stable" | "declining";
}

export interface SalaryTierOutcome {
  tierName: "Super Dream (≥15 LPA)" | "Dream (8–15 LPA)" | "Core & IT (5–8 LPA)";
  range: string;
  drivesCount: number;
  registeredCount: number;
  shortlistedCount: number;
  offersCount: number;
  shortlistRate: number;
  offerConversionRate: number;
  avgCTC: string;
  topRecruiters: string[];
}

export interface PlacementOutcomeHistoricalTrend {
  year: string;
  totalStudents: number;
  placedCount: number;
  placementRate: number;
  avgCTC: string;
  medianCTC: string;
  recruitersCount: number;
  internshipsCount: number;
}

export interface PlacementActionableInsight {
  id: string;
  type: "warning" | "opportunity" | "success";
  title: string;
  departmentOrScope: string;
  observation: string;
  evidence: string;
  recommendedAction: string;
  priority: "high" | "medium" | "routine";
}

export interface InstitutionalPlacementOutcomeIntelligence {
  academicYear: string;
  totalGraduatingCohort: number;
  totalPlaced: number;
  overallPlacementRate: number;
  medianCTC: string;
  averageCTC: string;
  highestCTC: string;
  activeRecruiters: number;
  funnelStages: RecruitmentFunnelStage[];
  bottleneck: FunnelBottleneckAnalysis;
  readinessVsOutcomes: DepartmentReadinessOutcomeRow[];
  salaryTierOutcomes: SalaryTierOutcome[];
  historicalTrends: PlacementOutcomeHistoricalTrend[];
  actionableInsights: PlacementActionableInsight[];
}

// ─── Industry Engagement & Relationship Intelligence ─────────────────

export interface PartnerSkillRoleMapping {
  partnerId: string;
  partnerName: string;
  industry: string;
  engagementLevel: "high" | "moderate" | "low";
  engagementScore: number;
  targetDepartments: { deptId: string; shortName: string }[];
  demandedSkills: string[];
  keyRoles: string[];
  activeDriveTitle?: string;
  activeDriveId?: string;
  totalHired: number;
  internshipsOffered: number;
  mouStatus: "active" | "expiring-soon" | "expired" | "pending";
  relationshipHealth: "thriving" | "needs-attention" | "dormant";
}

export interface DepartmentIndustryEngagementGap {
  deptId: string;
  deptName: string;
  shortName: string;
  activePartnersCount: number;
  activeDrivesCount: number;
  corePartnerNames: string[];
  engagementCoverage: "Strong" | "Adequate" | "Under-Represented";
  identifiedGap: string;
  recommendedAction: string;
}

export interface IndustryDemandSkillSummary {
  skillName: string;
  demandingPartnersCount: number;
  demandingPartnerNames: string[];
  curriculumCoverageStatus: "Aligned" | "Emerging Gap" | "Critical Deficit";
  priority: "high" | "medium" | "low";
}

export interface IndustryEngagementInsight {
  id: string;
  type: "warning" | "opportunity" | "success";
  title: string;
  partnerOrScope: string;
  observation: string;
  recommendedAction: string;
  priority: "high" | "medium" | "routine";
}

export interface IndustryEngagementIntelligence {
  totalPartners: number;
  activeMoUsCount: number;
  expiringMoUsCount: number;
  topPartnersByHiring: { name: string; hired: number; engagementScore: number }[];
  partnerMappings: PartnerSkillRoleMapping[];
  departmentEngagementGaps: DepartmentIndustryEngagementGap[];
  topDemandedSkills: IndustryDemandSkillSummary[];
  actionableInsights: IndustryEngagementInsight[];
}

// ─── Skill Demand & Emerging Skills Intelligence ─────────────────────

export interface IndustrySkillDemandItem {
  id: string;
  skillName: string;
  category: string;
  demandingPartners: string[];
  targetJobRoles: string[];
  targetDepartmentIds: string[];
  curriculumCoverage: "adequate" | "partial" | "minimal" | "none";
  curriculumCoveragePercent: number; // e.g. 80 = adequate, 35 = partial, 15 = minimal
  placementImpact: "critical" | "high" | "moderate";
  averageAssociatedCTC: string;
  isEmerging: boolean;
  emergingRationale?: string;
  recommendedUpskillingAction: string;
}

export interface DepartmentSkillDemandSummary {
  deptId: string;
  deptName: string;
  shortName: string;
  topDemandedSkills: string[];
  highImpactDeficitSkills: string[];
  overallCurriculumAlignmentPercent: number;
  priorityUpskillingFocus: string;
}

export interface PriorityUpskillingArea {
  skillName: string;
  category: string;
  urgency: "Immediate (This Term)" | "Upcoming Academic Year";
  impactedDepartments: string[];
  placementRelevance: string;
  recommendedMethod: "Corporate Workshop / Bootcamp" | "Elective Syllabus Revision" | "Laboratory Upgrade";
}

export interface InstitutionalSkillDemandIntelligence {
  totalTrackedSkills: number;
  highDemandSkillsCount: number;
  emergingSkillsCount: number;
  curriculumDeficitSkillsCount: number;
  demandItems: IndustrySkillDemandItem[];
  departmentSummaries: DepartmentSkillDemandSummary[];
  priorityUpskillingAreas: PriorityUpskillingArea[];
  actionableRecommendations: {
    id: string;
    type: "critical" | "high" | "strategic";
    title: string;
    scope: string;
    evidence: string;
    action: string;
  }[];
}

// ─── Institutional Resource & Intervention Planning ─────────────────

export type InterventionCategory =
  | "Technical Bootcamp"
  | "Industry Workshop"
  | "Curriculum Revision"
  | "Laboratory / Resource Upgrade"
  | "Assessment Preparation"
  | "Drive-Specific Preparation"
  | "Faculty Industry Exposure";

export type InstitutionalPlanPriority = "critical" | "high" | "medium" | "low";

export interface InstitutionalInterventionPlanItem {
  id: string;
  title: string;
  category: InterventionCategory;
  priority: InstitutionalPlanPriority;
  targetDepartmentIds: string[];
  targetDepartmentNames: string[];
  affectedStudentsCount: number;
  timeframe: string;
  supportingEvidence: {
    skillOrCurriculumGap: string;
    readinessScore: number;
    funnelOrPlacementRisk: string;
    targetRecruiterOrDrive?: string;
  };
  recommendedAction: string;
  relevantPlacementImpact: string;
  operationalStatus: "Planned" | "In Execution" | "Under Review";
}

export interface InstitutionalResourceInterventionPlan {
  totalInterventions: number;
  criticalCount: number;
  highPriorityCount: number;
  totalStudentsCovered: number;
  planItems: InstitutionalInterventionPlanItem[];
  departmentCoverageSummary: {
    deptId: string;
    shortName: string;
    interventionsCount: number;
    highestPriority: InstitutionalPlanPriority;
    primaryFocus: string;
  }[];
  resourceAllocationGuidance: {
    category: InterventionCategory;
    count: number;
    rationale: string;
    urgency: "Immediate" | "Near Term" | "Next Academic Term";
  }[];
}
