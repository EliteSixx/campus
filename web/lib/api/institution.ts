// ─── Institution API Layer ───────────────────────────────────────────
// Thin async wrappers over mock data. To connect a real backend:
//   1. Replace each function body with `fetch("/api/institution/...")`
//   2. Return types stay identical — zero UI change.

import { dashboardOverview } from "@/data/institution/mock-overview";
import { departmentSummaryData, getDepartmentById } from "@/data/institution/mock-departments";
import { skillMatrixData, cohortAnalytics } from "@/data/institution/mock-skills";
import { internshipRecords, placementTrendData } from "@/data/institution/mock-internships";
import { corporatePartners } from "@/data/institution/mock-partners";
import { institutionStudents, getStudentsByDepartment as _getStudentsByDepartment } from "@/data/institution/mock-students";
import { defaultPlacementPolicy } from "@/data/institution/mock-policies";
import { mockPlacementDrives } from "@/data/institution/mock-drives";
import { mockSubjectAlignments } from "@/data/institution/mock-curriculum";
import { facultyAndStaffMembers } from "@/data/institution/mock-faculty";
import { HISTORICAL_YEARS } from "@/data/institution/mock-archives";

import type {
  DashboardOverview,
  DepartmentSummaryRow,
  DepartmentDetail,
  SkillMatrixRow,
  CohortAnalytics,
  InternshipRecord,
  PipelineSummary,
  PlacementTrend,
  CorporatePartner,
  InstitutionStudent,
  PlacementPolicy,
  CampusPlacementDrive,
  DepartmentReadinessIntelligence,
  SubjectCurriculumAlignment,
  PriorityInterventionAction,
  AccreditationEvidenceItem,
  AccreditationCategorySummary,
  InstitutionalAuditReport,
  InstitutionalPlacementOutcomeIntelligence,
  RecruitmentFunnelStage,
  FunnelBottleneckAnalysis,
  DepartmentReadinessOutcomeRow,
  SalaryTierOutcome,
  PlacementOutcomeHistoricalTrend,
  PlacementActionableInsight,
  PartnerSkillRoleMapping,
  DepartmentIndustryEngagementGap,
  IndustryDemandSkillSummary,
  IndustryEngagementInsight,
  IndustryEngagementIntelligence,
  IndustrySkillDemandItem,
  DepartmentSkillDemandSummary,
  PriorityUpskillingArea,
  InstitutionalSkillDemandIntelligence,
  InterventionCategory,
  InterventionPriority,
  InstitutionalPlanPriority,
  InstitutionalInterventionPlanItem,
  InstitutionalResourceInterventionPlan,
} from "@/data/institution/types";

// ─── Dashboard ───────────────────────────────────────────────────────

export async function getInstitutionDashboard(): Promise<DashboardOverview> {
  return dashboardOverview;
}

// ─── Departments ─────────────────────────────────────────────────────

export async function getDepartmentList(): Promise<DepartmentSummaryRow[]> {
  return departmentSummaryData;
}

export async function getDepartmentDetail(id: string): Promise<DepartmentDetail | null> {
  return getDepartmentById(id) ?? null;
}

// ─── Skills ──────────────────────────────────────────────────────────

export async function getSkillMatrix(): Promise<SkillMatrixRow[]> {
  return skillMatrixData;
}

export async function getCohortAnalytics(): Promise<CohortAnalytics> {
  return cohortAnalytics;
}

// ─── Internships ─────────────────────────────────────────────────────

export async function getInternshipRecords(): Promise<InternshipRecord[]> {
  return internshipRecords;
}

export async function getInternshipPipeline(): Promise<PipelineSummary> {
  return dashboardOverview.internshipPipeline;
}

export async function getPlacementTrends(): Promise<PlacementTrend[]> {
  return placementTrendData;
}

// ─── Partners ────────────────────────────────────────────────────────

export async function getPartnerList(): Promise<CorporatePartner[]> {
  return corporatePartners;
}

export async function getPartner(id: string): Promise<CorporatePartner | null> {
  return corporatePartners.find(p => p.id === id) ?? null;
}

// ─── Students ────────────────────────────────────────────────────────

export async function getAllInstitutionStudents(): Promise<InstitutionStudent[]> {
  return institutionStudents;
}

export async function getDepartmentStudents(deptId: string): Promise<InstitutionStudent[]> {
  return _getStudentsByDepartment(deptId);
}

// ─── Policies ────────────────────────────────────────────────────────

export async function getPlacementPolicies(): Promise<PlacementPolicy> {
  return defaultPlacementPolicy;
}

// ─── Placement Drives ───────────────────────────────────────────────

export async function getPlacementDrives(): Promise<CampusPlacementDrive[]> {
  return mockPlacementDrives;
}

export async function getPlacementDriveById(id: string): Promise<CampusPlacementDrive | null> {
  return mockPlacementDrives.find((d) => d.id === id) ?? null;
}

// ─── Placement Readiness & Intervention Intelligence ─────────────────

export async function getDepartmentReadinessIntelligence(): Promise<DepartmentReadinessIntelligence[]> {
  const policy = defaultPlacementPolicy;
  const totalDrives = mockPlacementDrives.length;

  const deficits: Record<string, { deficit: string; program: string }> = {
    me: {
      deficit: "AutoCAD & Embedded C++ (-42 pt deficit)",
      program: "Core Automation & CAD Intensive",
    },
    ee: {
      deficit: "Power Systems & IoT Firmware (-36 pt deficit)",
      program: "Embedded Systems & IoT Boot Camp",
    },
    ece: {
      deficit: "VLSI Verification & Embedded C++ (-32 pt deficit)",
      program: "Hardware Architecture & Embedded C++",
    },
    it: {
      deficit: "Cloud Infrastructure & Containerization (-28 pt deficit)",
      program: "Cloud & DevOps Acceleration Sprint",
    },
    cse: {
      deficit: "Cloud Architecture & Docker Containerization (-40 pt deficit)",
      program: "Full-Stack & Cloud Scalability Sprint",
    },
    ds: {
      deficit: "Distributed ML & Big Data Pipelines (-18 pt deficit)",
      program: "Applied Generative AI & ML Systems",
    },
  };

  return departmentSummaryData.map((dept) => {
    let status: "ready" | "at-risk" | "critical" = "ready";
    let priority: "high" | "medium" | "low" = "low";

    if (dept.placementReadyPercent < 40) {
      status = "critical";
      priority = "high";
    } else if (dept.placementReadyPercent < 60) {
      status = "at-risk";
      priority = "medium";
    } else {
      status = "ready";
      priority = "low";
    }

    const deptStudents = institutionStudents.filter((s) => s.deptId === dept.id);
    let disqualifiedCount = 0;
    for (const s of deptStudents) {
      if (s.cgpa < policy.minCgpa || s.activeBacklogs > policy.maxActiveBacklogs) {
        disqualifiedCount++;
      }
    }
    const policyDisqualificationPercent =
      deptStudents.length > 0
        ? Math.round((disqualifiedCount / deptStudents.length) * 100)
        : 0;

    const eligibleDrives = mockPlacementDrives.filter((d) =>
      d.eligibleDeptIds.includes(dept.id)
    ).length;

    const deficitInfo = deficits[dept.id] || {
      deficit: "Core Domain Practical Skill Deficit",
      program: "Technical Interview & Aptitude Fast-Track",
    };

    let recommendedIntervention = "";
    if (status === "critical") {
      recommendedIntervention = `Urgent 6-week ${deficitInfo.program} combined with special backlog recovery.`;
    } else if (status === "at-risk") {
      recommendedIntervention = `Targeted 4-week ${deficitInfo.program} focused on upcoming corporate drive clearing.`;
    } else {
      recommendedIntervention = `Routine peer mentorship and mock technical rounds for Tier 1 Super Dream drives.`;
    }

    const unreadyStudents = Math.round(
      dept.totalStudents * ((100 - dept.placementReadyPercent) / 100)
    );
    const affectedActiveDrives = mockPlacementDrives
      .filter((d) => d.eligibleDeptIds.includes(dept.id))
      .map((d) => ({
        driveId: d.id,
        companyName: d.companyName,
        role: d.role,
        driveDate: d.driveDate,
        status: d.status,
      }));

    const deptSubjects = mockSubjectAlignments.filter((s) => s.deptId === dept.id);
    const curriculumGaps: string[] = [];
    deptSubjects.forEach((s) => {
      s.recommendedAdditions.forEach((r) => curriculumGaps.push(`${s.code}: ${r.topic}`));
    });

    const keyRiskFactors: { title: string; description: string; severity: "critical" | "high" | "medium" }[] = [
      {
        title: "Core Skill Deficit",
        description: `Major negative gap in ${deficitInfo.deficit}. Direct barrier during company technical rounds.`,
        severity: status === "critical" ? "critical" : status === "at-risk" ? "high" : "medium",
      },
      {
        title: "Academic Policy Disqualification",
        description: `${policyDisqualificationPercent}% of department students fail institutional criteria (CGPA < ${policy.minCgpa} or backlogs > ${policy.maxActiveBacklogs}).`,
        severity: policyDisqualificationPercent > 25 ? "critical" : policyDisqualificationPercent > 15 ? "high" : "medium",
      },
      {
        title: "Corporate Drive Exposure",
        description: `Students eligible for ${eligibleDrives} of ${totalDrives} campus recruitment drives.`,
        severity: eligibleDrives <= 3 ? "high" : "medium",
      },
    ];

    return {
      deptId: dept.id,
      deptName: dept.name,
      shortName: dept.shortName,
      totalStudents: dept.totalStudents,
      assessedPercent: dept.assessedPercent,
      placementReadyPercent: dept.placementReadyPercent,
      status,
      priority,
      primarySkillDeficit: deficitInfo.deficit,
      policyDisqualificationPercent,
      drivesEligibleCount: eligibleDrives,
      totalDrivesCount: totalDrives,
      recommendedIntervention,
      suggestedProgramName: deficitInfo.program,
      baselineReadiness: dept.placementReadyPercent,
      targetStudents: Math.max(20, unreadyStudents),
      affectedActiveDrives,
      curriculumGaps,
      keyRiskFactors,
    };
  });
}

export async function getPriorityInterventionActions(): Promise<PriorityInterventionAction[]> {
  return [
    {
      id: "act-me-lt",
      priority: "critical",
      deptId: "me",
      deptShortName: "ME",
      title: "Core CAD & Automation Crash Course",
      targetDrive: "Larsen & Toubro (GET)",
      driveDate: "2026-09-10",
      affectedStudentsCount: 52,
      recommendedRemediation: "Intensive 4-week SolidWorks & GD&T refresher before technical viva rounds.",
      suggestedDuration: "4 Weeks",
    },
    {
      id: "act-cse-cloud",
      priority: "high",
      deptId: "cse",
      deptShortName: "CSE",
      title: "Cloud & Docker Architecture Sprint",
      targetDrive: "Google & Microsoft SDE",
      driveDate: "2026-09-15",
      affectedStudentsCount: 70,
      recommendedRemediation: "Hands-on containerization and distributed system design practice to clear Round 2.",
      suggestedDuration: "6 Weeks",
    },
    {
      id: "act-ee-iot",
      priority: "high",
      deptId: "ee",
      deptShortName: "EE",
      title: "Embedded Hardware & Power Systems Boot Camp",
      targetDrive: "Microsoft Cloud & L&T",
      driveDate: "2026-09-14",
      affectedStudentsCount: 44,
      recommendedRemediation: "Targeted backlog clearance counseling combined with IoT microcontroller hands-on labs.",
      suggestedDuration: "6 Weeks",
    },
  ];
}

// ─── Curriculum–Industry Alignment Intelligence ──────────────────────

export async function getCurriculumAlignments(): Promise<SubjectCurriculumAlignment[]> {
  return mockSubjectAlignments;
}

export async function getCurriculumAlignmentById(id: string): Promise<SubjectCurriculumAlignment | null> {
  return mockSubjectAlignments.find((s) => s.id === id || s.code.toLowerCase() === id.toLowerCase()) ?? null;
}

export async function getCurriculumByFaculty(facultyId: string): Promise<SubjectCurriculumAlignment[]> {
  return mockSubjectAlignments.filter((s) => s.primaryFacultyId === facultyId);
}

// ─── Accreditation & Compliance Intelligence ─────────────────────────

export async function getAccreditationEvidence(): Promise<AccreditationCategorySummary[]> {
  const k = dashboardOverview.kpis;
  const drives = mockPlacementDrives;
  const subjects = mockSubjectAlignments;
  const partners = corporatePartners;
  const faculty = facultyAndStaffMembers.filter((f) => f.roleType === "faculty");

  // Calculate curriculum aggregate alignment
  const avgCurriculumAlignment = Math.round(
    subjects.reduce((sum, s) => sum + s.alignmentScore, 0) / subjects.length
  );
  const totalIndustryTopics = subjects.reduce((sum, s) => sum + s.industryRelevantCount + s.industryAdvancedCount, 0);
  const totalFoundationalTopics = subjects.reduce((sum, s) => sum + s.foundationalCount, 0);
  const totalMissingRecommendations = subjects.reduce((sum, s) => sum + s.recommendedAdditions.length, 0);

  // Active MoUs
  const activeMousCount = partners.filter((p) => p.mouStatus === "active").length;

  // Faculty doctoral ratio
  const phdCount = faculty.filter((f) => f.qualification.toLowerCase().includes("ph.d") || f.qualification.toLowerCase().includes("phd")).length;
  const phdPercent = Math.round((phdCount / Math.max(1, faculty.length)) * 100);

  const categories: AccreditationCategorySummary[] = [
    {
      category: "Placement Outcomes",
      compliantCount: 3,
      attentionCount: 0,
      informationalCount: 1,
      totalMetrics: 4,
      items: [
        {
          id: "ev-plc-rate",
          category: "Placement Outcomes",
          metric: "Overall Institutional Placement Rate",
          currentValue: `${k.placementReadyPercent > 75 ? "82.4%" : "78.6%"}`,
          targetThreshold: "≥ 80.0%",
          status: "compliant",
          sourceFeature: "Internship & Placement Tracker",
          sourceHref: "/dashboard/institution/internships",
          supportingContext: `${k.studentsPlaced} of ${k.totalStudents} eligible graduating students placed across all branches.`,
        },
        {
          id: "ev-plc-ctc",
          category: "Placement Outcomes",
          metric: "Average CTC Package Across Cohorts",
          currentValue: "8.6 LPA",
          targetThreshold: "≥ 7.5 LPA",
          status: "compliant",
          sourceFeature: "Placement Drive Orchestration Hub",
          sourceHref: "/dashboard/institution/drives",
          supportingContext: "Campus-wide mean annual compensation; median offer benchmarked at 7.8 LPA.",
        },
        {
          id: "ev-plc-drives",
          category: "Placement Outcomes",
          metric: "Active Campus Placement Drives",
          currentValue: `${drives.length} Drives Conducted`,
          targetThreshold: "≥ 5 Active Drives",
          status: "compliant",
          sourceFeature: "Placement Drive Orchestration Hub",
          sourceHref: "/dashboard/institution/drives",
          supportingContext: "High-tier marquee, product software, and core engineering corporate recruitment pipelines.",
        },
        {
          id: "ev-plc-highest",
          category: "Placement Outcomes",
          metric: "Maximum Compensation Offered",
          currentValue: "44.0 LPA",
          targetThreshold: "No configured threshold",
          status: "informational",
          sourceFeature: "Placement Drive Orchestration Hub",
          sourceHref: "/dashboard/institution/drives",
          supportingContext: "Offered by Microsoft Cloud Engineering in SDE-1 Drive.",
        },
      ],
    },
    {
      category: "Skill Development",
      compliantCount: 2,
      attentionCount: 1,
      informationalCount: 0,
      totalMetrics: 3,
      items: [
        {
          id: "ev-skl-assessment",
          category: "Skill Development",
          metric: "Cohort Technical Assessment Coverage",
          currentValue: `${k.assessedPercent}%`,
          targetThreshold: "≥ 85.0%",
          status: "compliant",
          sourceFeature: "Skill Gap Matrix",
          sourceHref: "/dashboard/institution/skills",
          supportingContext: "Standardized multi-tier diagnostic exams covering core CS, IT, and engineering fundamentals.",
        },
        {
          id: "ev-skl-readiness",
          category: "Skill Development",
          metric: "Institutional Placement Readiness Index",
          currentValue: `${k.placementReadyPercent}%`,
          targetThreshold: "≥ 65.0%",
          status: "compliant",
          sourceFeature: "Readiness & Intervention Intelligence",
          sourceHref: "/dashboard/institution",
          supportingContext: "Composite metric evaluating coding proficiency, core technical mastery, and aptitude benchmarks.",
        },
        {
          id: "ev-skl-gaps",
          category: "Skill Development",
          metric: "Severe Departmental Skill Bottlenecks",
          currentValue: "2 Branch Deficits (>35 pts)",
          targetThreshold: "0 Severe Gaps",
          status: "attention",
          sourceFeature: "Skill Gap Matrix",
          sourceHref: "/dashboard/institution/skills",
          supportingContext: "Mechanical (AutoCAD/C++ -42 pt) and CSE (Cloud Containerization -40 pt) require active intervention.",
        },
      ],
    },
    {
      category: "Curriculum Alignment",
      compliantCount: 3,
      attentionCount: 0,
      informationalCount: 1,
      totalMetrics: 4,
      items: [
        {
          id: "ev-cur-alignment",
          category: "Curriculum Alignment",
          metric: "Institutional Mean Syllabus Alignment Score",
          currentValue: `${avgCurriculumAlignment}%`,
          targetThreshold: "≥ 75.0%",
          status: "compliant",
          sourceFeature: "Curriculum–Industry Alignment Intelligence",
          sourceHref: "/dashboard/institution/curriculum",
          supportingContext: `Evaluated across ${subjects.length} audited core subjects mapping syllabus topics against corporate requirements.`,
        },
        {
          id: "ev-cur-industry-topics",
          category: "Curriculum Alignment",
          metric: "Industry-Relevant Syllabus Topics Taught",
          currentValue: `${totalIndustryTopics} Topics`,
          targetThreshold: "≥ 35 Topics",
          status: "compliant",
          sourceFeature: "Curriculum–Industry Alignment Intelligence",
          sourceHref: "/dashboard/institution/curriculum",
          supportingContext: "Applied engineering competencies actively demanded by recruiting partner organizations.",
        },
        {
          id: "ev-cur-foundations",
          category: "Curriculum Alignment",
          metric: "Foundational Academic Topics Preserved",
          currentValue: `${totalFoundationalTopics} Topics`,
          targetThreshold: "No configured threshold",
          status: "informational",
          sourceFeature: "Curriculum–Industry Alignment Intelligence",
          sourceHref: "/dashboard/institution/curriculum",
          supportingContext: "Fundamental mathematical and architectural theory essential for deep engineering rigor.",
        },
        {
          id: "ev-cur-recommended",
          category: "Curriculum Alignment",
          metric: "Actionable Syllabus Additions Identified",
          currentValue: `${totalMissingRecommendations} Recommendations`,
          targetThreshold: "≤ 15 Missing Topics",
          status: "compliant",
          sourceFeature: "Curriculum–Industry Alignment Intelligence",
          sourceHref: "/dashboard/institution/curriculum",
          supportingContext: "Specific high-priority module insertions (e.g. Docker, Kafka, Microcontroller RTOS) planned for BoS review.",
        },
      ],
    },
    {
      category: "Industry Engagement",
      compliantCount: 3,
      attentionCount: 0,
      informationalCount: 0,
      totalMetrics: 3,
      items: [
        {
          id: "ev-ind-partners",
          category: "Industry Engagement",
          metric: "Active Corporate Hiring Partners",
          currentValue: `${partners.length} Companies`,
          targetThreshold: "≥ 20 Partners",
          status: "compliant",
          sourceFeature: "Corporate Partners",
          sourceHref: "/dashboard/institution/partners",
          supportingContext: "Fortune 500 enterprises, national conglomerates, and high-growth technology unicorns.",
        },
        {
          id: "ev-ind-mous",
          category: "Industry Engagement",
          metric: "Institutional MoUs in Good Standing",
          currentValue: `${activeMousCount} Active MoUs`,
          targetThreshold: "≥ 10 MoUs",
          status: "compliant",
          sourceFeature: "Corporate Partners",
          sourceHref: "/dashboard/institution/partners",
          supportingContext: "Legally verified institutional agreements governing joint student training, projects, and hiring.",
        },
        {
          id: "ev-ind-internships",
          category: "Industry Engagement",
          metric: "Corporate Sponsored Internships",
          currentValue: `${k.activeInternships} Internships`,
          targetThreshold: "≥ 180 Internships",
          status: "compliant",
          sourceFeature: "Internship & Placement Tracker",
          sourceHref: "/dashboard/institution/internships",
          supportingContext: "Paid industrial summer internships and corporate capstone research positions.",
        },
      ],
    },
    {
      category: "Faculty & Academic",
      compliantCount: 1,
      attentionCount: 0,
      informationalCount: 2,
      totalMetrics: 3,
      items: [
        {
          id: "ev-fac-allocation",
          category: "Faculty & Academic",
          metric: "Course Assignment Coverage",
          currentValue: "100.0%",
          targetThreshold: "100.0%",
          status: "compliant",
          sourceFeature: "Faculty & Staff Directory",
          sourceHref: "/dashboard/institution/faculty",
          supportingContext: "All audited departmental subjects have a designated primary faculty instructor with verified credentials.",
        },
        {
          id: "ev-fac-total",
          category: "Faculty & Academic",
          metric: "Full-Time Engineering Faculty",
          currentValue: `${faculty.length} Faculty Members`,
          targetThreshold: "No configured threshold",
          status: "informational",
          sourceFeature: "Faculty & Staff Directory",
          sourceHref: "/dashboard/institution/faculty",
          supportingContext: "Active faculty across Computer Science, Information Technology, ECE, Data Science, Mechanical, and EE.",
        },
        {
          id: "ev-fac-phd",
          category: "Faculty & Academic",
          metric: "Doctoral / Advanced Research Ratio",
          currentValue: `${phdPercent}% Ph.D. Qualified`,
          targetThreshold: "No configured threshold",
          status: "informational",
          sourceFeature: "Faculty & Staff Directory",
          sourceHref: "/dashboard/institution/faculty",
          supportingContext: "Faculty members holding doctorate degrees with verified publication records in peer-reviewed journals.",
        },
      ],
    },
    {
      category: "Policy Compliance",
      compliantCount: 2,
      attentionCount: 0,
      informationalCount: 1,
      totalMetrics: 3,
      items: [
        {
          id: "ev-pol-framework",
          category: "Policy Compliance",
          metric: "Placement Policy Implementation",
          currentValue: "Active Standard Policy",
          targetThreshold: "No configured threshold",
          status: "informational",
          sourceFeature: "Placement Policy Monitoring",
          sourceHref: "/dashboard/institution/policies",
          supportingContext: `Enforcing Min CGPA ${defaultPlacementPolicy.minCgpa} and Max Active Backlogs ${defaultPlacementPolicy.maxActiveBacklogs} across all recruitment drives.`,
        },
        {
          id: "ev-pol-clearance",
          category: "Policy Compliance",
          metric: "Cohort Policy Eligibility Clearance",
          currentValue: "84.8%",
          targetThreshold: "≥ 80.0%",
          status: "compliant",
          sourceFeature: "Placement Policy Monitoring",
          sourceHref: "/dashboard/institution/policies",
          supportingContext: "Students meeting transparent CGPA and backlog criteria for on-campus placement participation.",
        },
        {
          id: "ev-pol-fairness",
          category: "Policy Compliance",
          metric: "Offer Governance Compliance Index",
          currentValue: "96.4% Compliance",
          targetThreshold: "≥ 95.0%",
          status: "compliant",
          sourceFeature: "Placement Policy Monitoring",
          sourceHref: "/dashboard/institution/policies",
          supportingContext: "Transparent enforcement of 1-offer policy with regulated Dream/Super Dream upgrade criteria.",
        },
      ],
    },
  ];

  return categories;
}

export async function getInstitutionalAuditReport(): Promise<InstitutionalAuditReport> {
  const categories = await getAccreditationEvidence();
  const priorities = await getPriorityInterventionActions();
  const departments = departmentSummaryData;
  const subjects = mockSubjectAlignments;

  let totalMetrics = 0;
  let compliantCount = 0;
  let attentionCount = 0;

  categories.forEach((cat) => {
    cat.items.forEach((item) => {
      totalMetrics++;
      if (item.status === "compliant") compliantCount++;
      if (item.status === "attention") attentionCount++;
    });
  });

  const compliantPercent = Math.round((compliantCount / Math.max(1, totalMetrics - 5)) * 100);

  const deptPerformance = departments.map((d) => {
    const deptSubjects = subjects.filter((s) => s.deptId === d.id);
    const avgAlign = deptSubjects.length > 0
      ? Math.round(deptSubjects.reduce((sum, s) => sum + s.alignmentScore, 0) / deptSubjects.length)
      : 80;

    return {
      deptId: d.id,
      deptName: d.name,
      students: d.totalStudents,
      placed: d.placedCount,
      placementRate: Math.round((d.placedCount / d.totalStudents) * 100),
      avgSkillScore: d.avgSkillScore,
      readinessStatus: d.placementReadyPercent >= 60 ? "Placement Ready" : d.placementReadyPercent >= 40 ? "At Risk" : "Critical Risk",
      curriculumAlignment: avgAlign,
    };
  });

  return {
    institutionName: "National Institute of Advanced Engineering & Technology",
    academicYear: "2024–2025",
    generatedDate: "September 2026",
    auditScope: "Institutional Placement Outcomes, Curriculum Industry Alignment, and Compliance Dossier",
    executiveSummary: `Institutional performance across academic year 2024–25 exhibits strong placement outcomes (82.4% placement rate, 8.6 LPA average CTC) and robust curriculum-industry alignment (81.3% mean syllabus alignment across 8 core subjects). Assessment participation reached 90.6% across graduating cohorts, backed by 28 corporate partners and 14 active MoUs. Two primary technical bottlenecks—Cloud Architecture containerization in CSE and Core Automation in Mechanical Engineering—have been identified and prioritized for targeted bootcamp intervention ahead of Tier-1 recruitment drives.`,
    overallComplianceRating: `High Institutional Compliance (${compliantPercent}% of target thresholds met)`,
    totalMetricsTracked: totalMetrics,
    compliantCount,
    attentionCount,
    categories,
    departmentPerformance: deptPerformance,
    improvementPriorities: priorities,
  };
}

// ─── Placement Performance & Outcome Analytics ────────────────────────

export async function getPlacementOutcomeIntelligence(): Promise<InstitutionalPlacementOutcomeIntelligence> {
  const currentYear = HISTORICAL_YEARS["2024-25"];
  const totalEligible = currentYear.totalStudents; // 565
  const totalRegistered = 478; // 84.6% of eligible (policy clearance)
  const totalAppeared = 412; // 86.2% of registered
  const totalShortlisted = 218; // 52.9% of appeared (47.1% attrition bottleneck)
  const totalOffersReleased = 142; // unique offers in active drives
  const totalPlacedFinal = currentYear.totalPlaced; // 466 (82.4%)

  const funnelStages: RecruitmentFunnelStage[] = [
    {
      stage: "1. Eligible Cohort",
      count: totalEligible,
      conversionPercent: 100,
      overallPercent: 100,
      lossCount: 0,
    },
    {
      stage: "2. Registered for Drives",
      count: totalRegistered,
      conversionPercent: Math.round((totalRegistered / totalEligible) * 100),
      overallPercent: Math.round((totalRegistered / totalEligible) * 100),
      lossCount: totalEligible - totalRegistered,
    },
    {
      stage: "3. Appeared in Technical Tests",
      count: totalAppeared,
      conversionPercent: Math.round((totalAppeared / totalRegistered) * 100),
      overallPercent: Math.round((totalAppeared / totalEligible) * 100),
      lossCount: totalRegistered - totalAppeared,
    },
    {
      stage: "4. Shortlisted for Interviews",
      count: totalShortlisted,
      conversionPercent: Math.round((totalShortlisted / totalAppeared) * 100),
      overallPercent: Math.round((totalShortlisted / totalEligible) * 100),
      lossCount: totalAppeared - totalShortlisted,
    },
    {
      stage: "5. Offers Released (Active Phase)",
      count: totalOffersReleased,
      conversionPercent: Math.round((totalOffersReleased / totalShortlisted) * 100),
      overallPercent: Math.round((totalOffersReleased / totalEligible) * 100),
      lossCount: totalShortlisted - totalOffersReleased,
    },
    {
      stage: "6. Total Placed (Cumulative)",
      count: totalPlacedFinal,
      conversionPercent: Math.round((totalPlacedFinal / totalEligible) * 100),
      overallPercent: Math.round((totalPlacedFinal / totalEligible) * 100),
      lossCount: totalEligible - totalPlacedFinal,
    },
  ];

  const bottleneck: FunnelBottleneckAnalysis = {
    stageFrom: "Appeared in Technical Tests",
    stageTo: "Shortlisted for Interviews",
    dropRatePercent: 47.1,
    candidatesLost: totalAppeared - totalShortlisted, // 194
    identifiedFriction: "High candidate elimination in Round 1 automated code evaluation and technical viva cutoffs.",
    recommendedFocus: "Implement timed coding simulations and core domain problem-solving drills before high-volume recruitment drives.",
  };

  const readinessVsOutcomes: DepartmentReadinessOutcomeRow[] = [
    {
      deptId: "cse",
      deptName: "Computer Science & Engineering",
      shortName: "CSE",
      totalStudents: 172,
      placedCount: 154,
      placementRate: 89.5,
      readinessScore: 65,
      readinessTier: "High",
      quadrantClassification: "Strong Outcome",
      medianCTC: "8.4 LPA",
      avgCTC: "9.6 LPA",
      trend: "improving",
    },
    {
      deptId: "it",
      deptName: "Information Technology",
      shortName: "IT",
      totalStudents: 115,
      placedCount: 98,
      placementRate: 85.2,
      readinessScore: 61,
      readinessTier: "Moderate",
      quadrantClassification: "Strong Outcome",
      medianCTC: "7.8 LPA",
      avgCTC: "8.8 LPA",
      trend: "improving",
    },
    {
      deptId: "ece",
      deptName: "Electronics & Communication",
      shortName: "ECE",
      totalStudents: 86,
      placedCount: 67,
      placementRate: 77.9,
      readinessScore: 54,
      readinessTier: "Moderate",
      quadrantClassification: "Conversion Gap",
      medianCTC: "7.2 LPA",
      avgCTC: "8.2 LPA",
      trend: "stable",
    },
    {
      deptId: "ds",
      deptName: "Data Science & AI",
      shortName: "DS & AI",
      totalStudents: 52,
      placedCount: 48,
      placementRate: 92.3,
      readinessScore: 70,
      readinessTier: "High",
      quadrantClassification: "Top Performer",
      medianCTC: "10.2 LPA",
      avgCTC: "11.4 LPA",
      trend: "improving",
    },
    {
      deptId: "me",
      deptName: "Mechanical Engineering",
      shortName: "ME",
      totalStudents: 72,
      placedCount: 51,
      placementRate: 70.8,
      readinessScore: 43,
      readinessTier: "Low",
      quadrantClassification: "High Intervention Priority",
      medianCTC: "6.2 LPA",
      avgCTC: "6.8 LPA",
      trend: "stable",
    },
    {
      deptId: "ee",
      deptName: "Electrical Engineering",
      shortName: "EE",
      totalStudents: 68,
      placedCount: 48,
      placementRate: 70.5,
      readinessScore: 46,
      readinessTier: "Low",
      quadrantClassification: "High Intervention Priority",
      medianCTC: "6.4 LPA",
      avgCTC: "7.0 LPA",
      trend: "stable",
    },
  ];

  const salaryTierOutcomes: SalaryTierOutcome[] = [
    {
      tierName: "Super Dream (≥15 LPA)",
      range: "15.0 – 44.0 LPA",
      drivesCount: 3,
      registeredCount: 295,
      shortlistedCount: 54,
      offersCount: 18,
      shortlistRate: 18.3,
      offerConversionRate: 33.3,
      avgCTC: "32.8 LPA",
      topRecruiters: ["Microsoft Cloud", "Google SDE", "Qualcomm VLSI"],
    },
    {
      tierName: "Dream (8–15 LPA)",
      range: "8.0 – 14.9 LPA",
      drivesCount: 4,
      registeredCount: 340,
      shortlistedCount: 112,
      offersCount: 52,
      shortlistRate: 32.9,
      offerConversionRate: 46.4,
      avgCTC: "10.4 LPA",
      topRecruiters: ["Deloitte USI", "Tata Advanced Systems", "TechNova Systems", "DataForge Analytics"],
    },
    {
      tierName: "Core & IT (5–8 LPA)",
      range: "5.0 – 7.9 LPA",
      drivesCount: 5,
      registeredCount: 420,
      shortlistedCount: 210,
      offersCount: 124,
      shortlistRate: 50.0,
      offerConversionRate: 59.0,
      avgCTC: "6.8 LPA",
      topRecruiters: ["Larsen & Toubro GET", "Tata Consultancy Services", "Schneider Electric", "Infosys Ltd"],
    },
  ];

  const historicalTrends: PlacementOutcomeHistoricalTrend[] = Object.keys(HISTORICAL_YEARS)
    .sort()
    .map((key) => {
      const h = HISTORICAL_YEARS[key];
      const medianMap: Record<string, string> = {
        "2021–22": "5.8 LPA",
        "2022–23": "6.5 LPA",
        "2023–24": "7.2 LPA",
        "2024–25": "7.8 LPA",
      };
      return {
        year: h.year,
        totalStudents: h.totalStudents,
        placedCount: h.totalPlaced,
        placementRate: h.placementRate,
        avgCTC: h.averageCTC,
        medianCTC: medianMap[h.year] || "7.5 LPA",
        recruitersCount: h.activeRecruiters,
        internshipsCount: h.totalInternships,
      };
    });

  const actionableInsights: PlacementActionableInsight[] = [
    {
      id: "ins-funnel-screening",
      type: "warning",
      title: "Technical Screening Conversion Friction",
      departmentOrScope: "Campus-wide Technical Funnel",
      observation: "The steepest funnel attrition occurs between Appearing and Shortlisting (47.1% drop rate across 194 candidates).",
      evidence: "Only 52.9% of students who appear in online coding assessments clear to the interview stage across Tier-1/Tier-2 drives.",
      recommendedAction: "Mandate pre-drive automated code evaluation diagnostics focusing on dynamic programming and system design.",
      priority: "high",
    },
    {
      id: "ins-ece-gap",
      type: "opportunity",
      title: "ECE High Readiness vs. Moderate Conversion Gap",
      departmentOrScope: "Electronics & Communication (ECE)",
      observation: "ECE students exhibit solid theoretical readiness (54%), but final offer conversion (77.9%) lags behind CS/IT peers (85%+).",
      evidence: "Hardware companies report strong circuit knowledge but suggest improvements in Verilog simulation and embedded C++ viva.",
      recommendedAction: "Schedule specialized VLSI testbench bootcamps prior to Qualcomm and Texas Instruments on-campus rounds.",
      priority: "medium",
    },
    {
      id: "ins-core-quadrant",
      type: "warning",
      title: "Mechanical & Electrical Core Hiring Bottleneck",
      departmentOrScope: "Mechanical & Electrical Engineering",
      observation: "Both ME (43% readiness) and EE (46% readiness) occupy the High Intervention Priority quadrant.",
      evidence: "Students who fail core engineering CAD/automation cutoffs default to generic IT roles with lower compensation packages.",
      recommendedAction: "Execute the 4-week AutoCAD/SolidWorks intensive before the upcoming Larsen & Toubro GET campus drive.",
      priority: "high",
    },
  ];

  return {
    academicYear: "2024–2025",
    totalGraduatingCohort: totalEligible,
    totalPlaced: totalPlacedFinal,
    overallPlacementRate: currentYear.placementRate,
    medianCTC: "7.8 LPA",
    averageCTC: currentYear.averageCTC,
    highestCTC: currentYear.highestCTC,
    activeRecruiters: currentYear.activeRecruiters,
    funnelStages,
    bottleneck,
    readinessVsOutcomes,
    salaryTierOutcomes,
    historicalTrends,
    actionableInsights,
  };
}

// ─── Industry Engagement & Relationship Intelligence ─────────────────

export async function getIndustryEngagementIntelligence(): Promise<IndustryEngagementIntelligence> {
  const partners = corporatePartners;

  const totalPartners = partners.length;
  const activeMoUsCount = partners.filter((p) => p.mouStatus === "active").length;
  const expiringMoUsCount = partners.filter((p) => p.mouStatus === "expiring-soon" || p.mouStatus === "expired").length;

  const topPartnersByHiring = [...partners]
    .sort((a, b) => b.studentsHired - a.studentsHired)
    .slice(0, 5)
    .map((p) => ({
      name: p.name,
      hired: p.studentsHired,
      engagementScore: p.engagementScore,
    }));

  const partnerMappings: PartnerSkillRoleMapping[] = [
    {
      partnerId: "p1",
      partnerName: "TechNova",
      industry: "Cloud Infrastructure",
      engagementLevel: "high",
      engagementScore: 92,
      targetDepartments: [
        { deptId: "cse", shortName: "CSE" },
        { deptId: "it", shortName: "IT" },
        { deptId: "ds", shortName: "DS & AI" },
      ],
      demandedSkills: ["Cloud Architecture", "Docker / Kubernetes", "Go / Python", "DevOps CI/CD"],
      keyRoles: ["Cloud DevOps Engineer", "Site Reliability Engineer"],
      activeDriveTitle: "Site Reliability & Cloud DevOps Engineer",
      activeDriveId: "drv-technova-sre",
      totalHired: 24,
      internshipsOffered: 15,
      mouStatus: "active",
      relationshipHealth: "thriving",
    },
    {
      partnerId: "p2",
      partnerName: "DataForge",
      industry: "Data Engineering",
      engagementLevel: "high",
      engagementScore: 88,
      targetDepartments: [
        { deptId: "ds", shortName: "DS & AI" },
        { deptId: "cse", shortName: "CSE" },
        { deptId: "it", shortName: "IT" },
      ],
      demandedSkills: ["Apache Spark", "Data Pipelines / ETL", "PostgreSQL / Snowflake", "Python"],
      keyRoles: ["Data Engineer", "Analytics Specialist"],
      totalHired: 18,
      internshipsOffered: 12,
      mouStatus: "active",
      relationshipHealth: "thriving",
    },
    {
      partnerId: "p3",
      partnerName: "Orbital Cloud",
      industry: "Cloud Platforms",
      engagementLevel: "moderate",
      engagementScore: 74,
      targetDepartments: [
        { deptId: "cse", shortName: "CSE" },
        { deptId: "it", shortName: "IT" },
      ],
      demandedSkills: ["AWS / Azure Solutions", "Terraform", "Kubernetes", "Microservices"],
      keyRoles: ["Cloud Infrastructure Associate", "Solutions Architect"],
      totalHired: 15,
      internshipsOffered: 8,
      mouStatus: "active",
      relationshipHealth: "thriving",
    },
    {
      partnerId: "p4",
      partnerName: "Cybergrid Labs",
      industry: "Cybersecurity",
      engagementLevel: "moderate",
      engagementScore: 68,
      targetDepartments: [
        { deptId: "cse", shortName: "CSE" },
        { deptId: "it", shortName: "IT" },
        { deptId: "ece", shortName: "ECE" },
      ],
      demandedSkills: ["Network Security", "Penetration Testing", "Cryptography", "Linux Internals"],
      keyRoles: ["Cybersecurity Analyst", "Security Engineer"],
      totalHired: 12,
      internshipsOffered: 6,
      mouStatus: "expiring-soon",
      relationshipHealth: "needs-attention",
    },
    {
      partnerId: "p5",
      partnerName: "Finlytics",
      industry: "Fintech",
      engagementLevel: "high",
      engagementScore: 85,
      targetDepartments: [
        { deptId: "cse", shortName: "CSE" },
        { deptId: "it", shortName: "IT" },
        { deptId: "ds", shortName: "DS & AI" },
      ],
      demandedSkills: ["Financial Modeling", "Spring Boot / Java", "Distributed Systems", "SQL"],
      keyRoles: ["Fintech Backend Engineer", "Systems Analyst"],
      totalHired: 14,
      internshipsOffered: 10,
      mouStatus: "active",
      relationshipHealth: "thriving",
    },
    {
      partnerId: "p6",
      partnerName: "Northwind Systems",
      industry: "Enterprise Software",
      engagementLevel: "moderate",
      engagementScore: 71,
      targetDepartments: [
        { deptId: "cse", shortName: "CSE" },
        { deptId: "it", shortName: "IT" },
      ],
      demandedSkills: ["Enterprise SaaS", "React / Next.js", "REST APIs", "Node.js"],
      keyRoles: ["Full Stack SaaS Developer", "Software Engineer"],
      totalHired: 10,
      internshipsOffered: 5,
      mouStatus: "active",
      relationshipHealth: "thriving",
    },
    {
      partnerId: "p7",
      partnerName: "Pixel Foundry",
      industry: "Product Design",
      engagementLevel: "low",
      engagementScore: 35,
      targetDepartments: [
        { deptId: "cse", shortName: "CSE" },
        { deptId: "it", shortName: "IT" },
      ],
      demandedSkills: ["UI/UX Design Systems", "Figma", "User Research", "Frontend Prototyping"],
      keyRoles: ["Product Designer", "UI/UX Specialist"],
      totalHired: 4,
      internshipsOffered: 2,
      mouStatus: "pending",
      relationshipHealth: "needs-attention",
    },
    {
      partnerId: "p8",
      partnerName: "Meridian Health Tech",
      industry: "HealthTech",
      engagementLevel: "moderate",
      engagementScore: 62,
      targetDepartments: [
        { deptId: "ds", shortName: "DS & AI" },
        { deptId: "ece", shortName: "ECE" },
      ],
      demandedSkills: ["Biomedical Informatics", "HIPAA Data Security", "Computer Vision", "Python"],
      keyRoles: ["Health Data Scientist", "Informatics Associate"],
      totalHired: 8,
      internshipsOffered: 4,
      mouStatus: "active",
      relationshipHealth: "thriving",
    },
    {
      partnerId: "p9",
      partnerName: "Vertex Robotics",
      industry: "Robotics & Automation",
      engagementLevel: "low",
      engagementScore: 48,
      targetDepartments: [
        { deptId: "me", shortName: "ME" },
        { deptId: "ee", shortName: "EE" },
        { deptId: "ece", shortName: "ECE" },
      ],
      demandedSkills: ["Embedded C / C++", "ROS (Robot Operating System)", "Control Systems", "CAD / SolidWorks"],
      keyRoles: ["Robotics & Automation Engineer", "Embedded Firmware Engineer"],
      totalHired: 6,
      internshipsOffered: 3,
      mouStatus: "active",
      relationshipHealth: "needs-attention",
    },
    {
      partnerId: "p10",
      partnerName: "Ledgerline",
      industry: "Blockchain",
      engagementLevel: "low",
      engagementScore: 28,
      targetDepartments: [
        { deptId: "cse", shortName: "CSE" },
        { deptId: "it", shortName: "IT" },
      ],
      demandedSkills: ["Smart Contracts", "Solidity", "Web3 Architecture", "Cryptography"],
      keyRoles: ["Blockchain Developer", "Smart Contract Auditor"],
      totalHired: 3,
      internshipsOffered: 1,
      mouStatus: "expired",
      relationshipHealth: "dormant",
    },
  ];

  const departmentEngagementGaps: DepartmentIndustryEngagementGap[] = [
    {
      deptId: "cse",
      deptName: "Computer Science & Engineering",
      shortName: "CSE",
      activePartnersCount: 8,
      activeDrivesCount: 4,
      corePartnerNames: ["TechNova", "DataForge", "Orbital Cloud", "Finlytics", "Northwind Systems"],
      engagementCoverage: "Strong",
      identifiedGap: "High recruiter density in software/cloud; slight gap in low-latency systems engineering.",
      recommendedAction: "Maintain Tier-1 partner pipeline while expanding specialist systems engineering partnerships.",
    },
    {
      deptId: "it",
      deptName: "Information Technology",
      shortName: "IT",
      activePartnersCount: 7,
      activeDrivesCount: 3,
      corePartnerNames: ["TechNova", "Finlytics", "Northwind Systems", "Cybergrid Labs"],
      engagementCoverage: "Strong",
      identifiedGap: "Curriculum matches software SaaS well; minor gap in automated CI/CD pipeline skills.",
      recommendedAction: "Integrate partner-sponsored Cloud DevOps and QA automation tracks into semester 7 electives.",
    },
    {
      deptId: "ds",
      deptName: "Data Science & AI",
      shortName: "DS & AI",
      activePartnersCount: 4,
      activeDrivesCount: 2,
      corePartnerNames: ["DataForge", "Finlytics", "Meridian Health Tech", "TechNova"],
      engagementCoverage: "Adequate",
      identifiedGap: "Strong demand for analytics; growing partner requests for LLMOps and distributed model training.",
      recommendedAction: "Introduce a capstone project pathway directly mentored by DataForge analytics leads.",
    },
    {
      deptId: "ece",
      deptName: "Electronics & Communication",
      shortName: "ECE",
      activePartnersCount: 3,
      activeDrivesCount: 2,
      corePartnerNames: ["Vertex Robotics", "Cybergrid Labs", "Meridian Health Tech"],
      engagementCoverage: "Adequate",
      identifiedGap: "Hardware and VLSI hiring remains concentrated in a small number of semiconductor partners.",
      recommendedAction: "Engage with semiconductor consortia (Qualcomm, Texas Instruments) to expand on-campus core electronics drives.",
    },
    {
      deptId: "me",
      deptName: "Mechanical Engineering",
      shortName: "ME",
      activePartnersCount: 1,
      activeDrivesCount: 1,
      corePartnerNames: ["Vertex Robotics"],
      engagementCoverage: "Under-Represented",
      identifiedGap: "Severe deficit in dedicated manufacturing and automotive corporate partnerships; heavy student spillover into IT roles.",
      recommendedAction: "Fast-track institutional MoUs with automotive OEMs and manufacturing enterprises (L&T, Tata Motors, Mahindra).",
    },
    {
      deptId: "ee",
      deptName: "Electrical Engineering",
      shortName: "EE",
      activePartnersCount: 1,
      activeDrivesCount: 1,
      corePartnerNames: ["Vertex Robotics"],
      engagementCoverage: "Under-Represented",
      identifiedGap: "Limited engagement with power systems, renewable energy, and grid automation industry partners.",
      recommendedAction: "Target active MoUs with energy infrastructure leaders (Schneider Electric, Siemens Energy, ABB) to expand core placements.",
    },
  ];

  const topDemandedSkills: IndustryDemandSkillSummary[] = [
    {
      skillName: "Cloud Architecture & Containers (Docker, K8s)",
      demandingPartnersCount: 4,
      demandingPartnerNames: ["TechNova", "Orbital Cloud", "Finlytics", "Northwind Systems"],
      curriculumCoverageStatus: "Emerging Gap",
      priority: "high",
    },
    {
      skillName: "Data Pipelines & Distributed ETL (Spark, SQL)",
      demandingPartnersCount: 3,
      demandingPartnerNames: ["DataForge", "Finlytics", "Meridian Health Tech"],
      curriculumCoverageStatus: "Aligned",
      priority: "medium",
    },
    {
      skillName: "Enterprise SaaS & Modern Web (React, Node, APIs)",
      demandingPartnersCount: 3,
      demandingPartnerNames: ["Northwind Systems", "Pixel Foundry", "Finlytics"],
      curriculumCoverageStatus: "Aligned",
      priority: "medium",
    },
    {
      skillName: "Embedded C++ & Robotics Automation",
      demandingPartnersCount: 2,
      demandingPartnerNames: ["Vertex Robotics", "Cybergrid Labs"],
      curriculumCoverageStatus: "Critical Deficit",
      priority: "high",
    },
    {
      skillName: "Cybersecurity & Network Hardening",
      demandingPartnersCount: 2,
      demandingPartnerNames: ["Cybergrid Labs", "Meridian Health Tech"],
      curriculumCoverageStatus: "Aligned",
      priority: "medium",
    },
    {
      skillName: "CAD Modeling & SolidWorks Automation",
      demandingPartnersCount: 1,
      demandingPartnerNames: ["Vertex Robotics"],
      curriculumCoverageStatus: "Critical Deficit",
      priority: "high",
    },
  ];

  const actionableInsights: IndustryEngagementInsight[] = [
    {
      id: "ins-gap-core-dept",
      type: "warning",
      title: "Critical Partnership Deficit in Core Engineering (ME & EE)",
      partnerOrScope: "Mechanical & Electrical Departments",
      observation: "80% of active corporate partners recruit strictly from CS/IT/DS, leaving ME and EE with only 1 shared active partner (Vertex Robotics).",
      recommendedAction: "Empower the Placement Cell to execute new MoUs with automotive OEMs and renewable energy leaders (e.g. L&T, Tata Motors, Schneider) before Q4 recruitment.",
      priority: "high",
    },
    {
      id: "ins-mou-renewal",
      type: "warning",
      title: "Expiring MoU & Relationship Re-engagement Required for Cybergrid Labs",
      partnerOrScope: "Cybergrid Labs (Cybersecurity)",
      observation: "MoU expired/expiring with 12 students previously hired; engagement score sits at 68 with no recent workshop registered this semester.",
      recommendedAction: "Schedule a formal liaison review with Neelam Saxena to renew the institutional MoU and organize the Ethical Hacking FDP.",
      priority: "medium",
    },
    {
      id: "ins-high-demand-cloud",
      type: "opportunity",
      title: "High Industry Demand for Cloud DevOps vs. Syllabus Coverage Gap",
      partnerOrScope: "TechNova & Orbital Cloud (Cloud Platforms)",
      observation: "4 partners with 50+ collective hires require Docker and Kubernetes container orchestration, which was flagged as a 16% missing coverage gap in the curriculum audit.",
      recommendedAction: "Launch the joint TechNova Cloud DevOps Bootcamp in Week 6 to train 120 pre-final year students prior to campus drive shortlisting.",
      priority: "high",
    },
  ];

  return {
    totalPartners,
    activeMoUsCount,
    expiringMoUsCount,
    topPartnersByHiring,
    partnerMappings,
    departmentEngagementGaps,
    topDemandedSkills,
    actionableInsights,
  };
}

// ─── Skill Demand & Emerging Skills Intelligence ─────────────────────

export async function getInstitutionalSkillDemandIntelligence(): Promise<InstitutionalSkillDemandIntelligence> {
  const demandItems: IndustrySkillDemandItem[] = [
    {
      id: "sk-cloud-k8s",
      skillName: "Docker, Kubernetes & Cloud Architecture",
      category: "Cloud & Infrastructure",
      demandingPartners: ["TechNova", "Orbital Cloud", "Microsoft", "Google"],
      targetJobRoles: ["Cloud DevOps Engineer", "Site Reliability Engineer", "Solutions Architect"],
      targetDepartmentIds: ["cse", "it", "ds"],
      curriculumCoverage: "partial",
      curriculumCoveragePercent: 35,
      placementImpact: "critical",
      averageAssociatedCTC: "16.5 LPA",
      isEmerging: true,
      emergingRationale: "Mandatory in 4 active Tier-1 cloud drives with 14+ LPA minimum package; verified missing from 3 syllabi in curriculum audit",
      recommendedUpskillingAction: "Execute TechNova DevOps Bootcamp and add container lab to Cloud Computing syllabus.",
    },
    {
      id: "sk-bigdata-spark",
      skillName: "Distributed Big Data & ETL Pipelines (Spark, Kafka)",
      category: "Data Engineering & AI",
      demandingPartners: ["DataForge", "Finlytics", "Google", "Deloitte"],
      targetJobRoles: ["Data Engineer", "Analytics Specialist", "BI Systems Engineer"],
      targetDepartmentIds: ["ds", "cse", "it"],
      curriculumCoverage: "partial",
      curriculumCoveragePercent: 45,
      placementImpact: "high",
      averageAssociatedCTC: "13.8 LPA",
      isEmerging: false,
      recommendedUpskillingAction: "Integrate PySpark hands-on streaming module into Data Warehousing & Mining course.",
    },
    {
      id: "sk-enterprise-saas",
      skillName: "Enterprise SaaS Architecture & Modern Web (React, Node, APIs)",
      category: "Enterprise Software",
      demandingPartners: ["Northwind Systems", "Pixel Foundry", "Deloitte", "Finlytics"],
      targetJobRoles: ["Full Stack SaaS Developer", "Software Development Engineer", "Product Engineer"],
      targetDepartmentIds: ["cse", "it"],
      curriculumCoverage: "adequate",
      curriculumCoveragePercent: 78,
      placementImpact: "high",
      averageAssociatedCTC: "10.4 LPA",
      isEmerging: false,
      recommendedUpskillingAction: "Maintain current web development lab coursework; encourage modern TypeScript standards.",
    },
    {
      id: "sk-embedded-ros",
      skillName: "Embedded C++, RTOS & Robotics Automation",
      category: "Robotics & Core Systems",
      demandingPartners: ["Vertex Robotics", "Schneider Electric", "Qualcomm"],
      targetJobRoles: ["Robotics Engineer", "Embedded Firmware Engineer", "Control Systems Specialist"],
      targetDepartmentIds: ["me", "ee", "ece"],
      curriculumCoverage: "minimal",
      curriculumCoveragePercent: 20,
      placementImpact: "critical",
      averageAssociatedCTC: "11.2 LPA",
      isEmerging: true,
      emergingRationale: "Rapidly requested by robotics OEMs and automated manufacturing partners seeking cross-disciplinary engineers",
      recommendedUpskillingAction: "Form cross-department Mechatronics & ROS laboratory with Vertex Robotics corporate sponsorship.",
    },
    {
      id: "sk-vlsi-verilog",
      skillName: "VLSI Design, Verilog & Testbench Verification",
      category: "Semiconductor & Hardware",
      demandingPartners: ["Qualcomm", "Texas Instruments", "Cybergrid Labs"],
      targetJobRoles: ["VLSI Design Engineer", "Hardware Verification Associate", "FPGA Specialist"],
      targetDepartmentIds: ["ece", "ee"],
      curriculumCoverage: "partial",
      curriculumCoveragePercent: 42,
      placementImpact: "critical",
      averageAssociatedCTC: "18.5 LPA",
      isEmerging: false,
      recommendedUpskillingAction: "Mandate SystemVerilog simulation hours in semiconductor elective before Qualcomm campus rounds.",
    },
    {
      id: "sk-cybersecurity",
      skillName: "Cybersecurity, Threat Modeling & Network Hardening",
      category: "Security & Governance",
      demandingPartners: ["Cybergrid Labs", "Meridian Health Tech", "Finlytics"],
      targetJobRoles: ["Cybersecurity Analyst", "Security Engineer", "Compliance Auditor"],
      targetDepartmentIds: ["cse", "it", "ece"],
      curriculumCoverage: "partial",
      curriculumCoveragePercent: 50,
      placementImpact: "high",
      averageAssociatedCTC: "12.0 LPA",
      isEmerging: false,
      recommendedUpskillingAction: "Organize the Cybergrid Labs Ethical Hacking workshop to bolster application security competencies.",
    },
    {
      id: "sk-cad-solidworks",
      skillName: "CAD Modeling, Finite Element Analysis (FEA) & SolidWorks",
      category: "Mechanical & Manufacturing",
      demandingPartners: ["Larsen & Toubro", "Tata Advanced Systems", "Vertex Robotics"],
      targetJobRoles: ["Graduate Engineer Trainee (GET)", "Mechanical Design Engineer", "Structural Analyst"],
      targetDepartmentIds: ["me"],
      curriculumCoverage: "minimal",
      curriculumCoveragePercent: 28,
      placementImpact: "high",
      averageAssociatedCTC: "7.8 LPA",
      isEmerging: false,
      recommendedUpskillingAction: "Introduce parametric modeling and GD&T certifications into semester 6 Mechanical curriculum.",
    },
    {
      id: "sk-plc-power",
      skillName: "Power Electronics, Smart Grid & PLC Automation",
      category: "Energy & Infrastructure",
      demandingPartners: ["Schneider Electric", "Tata Power", "Siemens"],
      targetJobRoles: ["Power Systems Engineer", "Automation Engineer", "Substation Specialist"],
      targetDepartmentIds: ["ee"],
      curriculumCoverage: "partial",
      curriculumCoveragePercent: 38,
      placementImpact: "high",
      averageAssociatedCTC: "8.2 LPA",
      isEmerging: false,
      recommendedUpskillingAction: "Schedule industrial PLC automation training in collaboration with Schneider Electric.",
    },
  ];

  const departmentSummaries: DepartmentSkillDemandSummary[] = [
    {
      deptId: "cse",
      deptName: "Computer Science & Engineering",
      shortName: "CSE",
      topDemandedSkills: ["Docker & Kubernetes", "Enterprise SaaS", "Data Pipelines"],
      highImpactDeficitSkills: ["Docker, Kubernetes & Cloud Architecture"],
      overallCurriculumAlignmentPercent: 72,
      priorityUpskillingFocus: "Container Orchestration & CI/CD Pipeline Automation",
    },
    {
      deptId: "it",
      deptName: "Information Technology",
      shortName: "IT",
      topDemandedSkills: ["Enterprise SaaS", "Data Pipelines", "Docker & Kubernetes"],
      highImpactDeficitSkills: ["Docker, Kubernetes & Cloud Architecture", "Automated QA"],
      overallCurriculumAlignmentPercent: 70,
      priorityUpskillingFocus: "Cloud Architecture & Automated Testing Pipelines",
    },
    {
      deptId: "ds",
      deptName: "Data Science & AI",
      shortName: "DS & AI",
      topDemandedSkills: ["Distributed Big Data (Spark)", "Cloud DevOps", "Python ML"],
      highImpactDeficitSkills: ["Distributed Big Data (Spark)", "Cloud DevOps"],
      overallCurriculumAlignmentPercent: 74,
      priorityUpskillingFocus: "Distributed Data Engineering & Production ML Pipelines",
    },
    {
      deptId: "ece",
      deptName: "Electronics & Communication",
      shortName: "ECE",
      topDemandedSkills: ["VLSI Design & Verilog", "Embedded C++", "Network Security"],
      highImpactDeficitSkills: ["VLSI Testbench Verification", "Embedded C++"],
      overallCurriculumAlignmentPercent: 62,
      priorityUpskillingFocus: "SystemVerilog Verification & Embedded Systems Integration",
    },
    {
      deptId: "me",
      deptName: "Mechanical Engineering",
      shortName: "ME",
      topDemandedSkills: ["CAD & SolidWorks", "Embedded Robotics (ROS)", "FEA Analysis"],
      highImpactDeficitSkills: ["CAD Modeling (SolidWorks)", "Embedded C++ & Robotics"],
      overallCurriculumAlignmentPercent: 45,
      priorityUpskillingFocus: "Parametric CAD Automation & Industrial Robotics",
    },
    {
      deptId: "ee",
      deptName: "Electrical Engineering",
      shortName: "EE",
      topDemandedSkills: ["Power Electronics", "PLC Automation", "Embedded C++"],
      highImpactDeficitSkills: ["PLC Automation", "Embedded C++ & RTOS"],
      overallCurriculumAlignmentPercent: 48,
      priorityUpskillingFocus: "Industrial PLC Systems & Smart Grid Power Electronics",
    },
  ];

  const priorityUpskillingAreas: PriorityUpskillingArea[] = [
    {
      skillName: "Docker, Kubernetes & Cloud DevOps",
      category: "Cloud & Infrastructure",
      urgency: "Immediate (This Term)",
      impactedDepartments: ["CSE", "IT", "DS & AI"],
      placementRelevance: "Mandatory qualification for 4 Super Dream drives (Google, Microsoft, TechNova) with 14–32 LPA CTC packages.",
      recommendedMethod: "Corporate Workshop / Bootcamp",
    },
    {
      skillName: "Embedded C++, RTOS & Robotics Automation",
      category: "Robotics & Core Systems",
      urgency: "Immediate (This Term)",
      impactedDepartments: ["Mechanical", "Electrical", "ECE"],
      placementRelevance: "Highest corporate hiring bottleneck in non-software branches; needed for Vertex Robotics & Schneider rounds.",
      recommendedMethod: "Laboratory Upgrade",
    },
    {
      skillName: "VLSI Design & SystemVerilog Testbench",
      category: "Semiconductor & Hardware",
      urgency: "Upcoming Academic Year",
      impactedDepartments: ["ECE", "Electrical"],
      placementRelevance: "Top compensation multiplier (18.5 LPA average CTC) for hardware engineering candidates.",
      recommendedMethod: "Elective Syllabus Revision",
    },
    {
      skillName: "Parametric CAD & SolidWorks Automation",
      category: "Mechanical & Manufacturing",
      urgency: "Immediate (This Term)",
      impactedDepartments: ["Mechanical"],
      placementRelevance: "Directly evaluated in round 1 technical screening for Larsen & Toubro and Tata Advanced GET drives.",
      recommendedMethod: "Corporate Workshop / Bootcamp",
    },
  ];

  const actionableRecommendations = [
    {
      id: "rec-cloud-gap",
      type: "critical" as const,
      title: "Severe Curriculum Deficit in Cloud Containerization (Docker/K8s)",
      scope: "CSE & IT (287 Graduating Students)",
      evidence: "4 active corporate recruiters offering ≥14 LPA require container orchestration; curriculum audit revealed only 35% syllabus coverage.",
      action: "Fast-track the planned 3-week TechNova Cloud DevOps Bootcamp before Tier-1 campus drive shortlisting.",
    },
    {
      id: "rec-core-embedded",
      type: "critical" as const,
      title: "Core Branch (ME & EE) Lagging in Modern Embedded & Automation Skills",
      scope: "Mechanical & Electrical Engineering (140 Students)",
      evidence: "Core branches have 45–48% curriculum alignment with high recruiter rejection in technical screening rounds.",
      action: "Establish a sponsored Mechatronics & PLC automation training track with Vertex Robotics and Schneider Electric.",
    },
    {
      id: "rec-vlsi-leverage",
      type: "high" as const,
      title: "High-Yield VLSI Verification Gap in ECE Hardware Candidates",
      scope: "Electronics & Communication (86 Students)",
      evidence: "Semiconductor partners (Qualcomm, Texas Instruments) report strong circuits foundation but weak Verilog testbench simulation skills.",
      action: "Conduct hands-on FPGA & Verilog simulation workshops in week 4 ahead of semiconductor campus interviews.",
    },
  ];

  const highDemandSkillsCount = demandItems.filter((d) => d.demandingPartners.length >= 3).length;
  const emergingSkillsCount = demandItems.filter((d) => d.isEmerging).length;
  const curriculumDeficitSkillsCount = demandItems.filter((d) => d.curriculumCoverage === "minimal" || d.curriculumCoverage === "none").length;

  return {
    totalTrackedSkills: demandItems.length,
    highDemandSkillsCount,
    emergingSkillsCount,
    curriculumDeficitSkillsCount,
    demandItems,
    departmentSummaries,
    priorityUpskillingAreas,
    actionableRecommendations,
  };
}

// ─── Institutional Resource & Intervention Planning ─────────────────

export async function getInstitutionalResourceInterventionPlan(): Promise<InstitutionalResourceInterventionPlan> {
  const planItems: InstitutionalInterventionPlanItem[] = [
    {
      id: "int-cloud-devops",
      title: "Docker, Kubernetes & Cloud DevOps Intensive Bootcamp",
      category: "Technical Bootcamp",
      priority: "critical",
      targetDepartmentIds: ["cse", "it"],
      targetDepartmentNames: ["Computer Science", "Information Tech"],
      affectedStudentsCount: 287,
      timeframe: "Immediate (Weeks 1–3)",
      supportingEvidence: {
        skillOrCurriculumGap: "Cloud containerization flagged as 16% missing coverage in curriculum audit; 35% overall syllabus depth.",
        readinessScore: 65,
        funnelOrPlacementRisk: "4 active Tier-1 cloud recruiters (Google, Microsoft, TechNova, Orbital Cloud) mandate container orchestration for Super Dream shortlists (≥15 LPA).",
        targetRecruiterOrDrive: "TechNova & Google SDE Drives",
      },
      recommendedAction: "Execute the 3-week hands-on containerization, Kubernetes cluster deployment, and CI/CD bootcamp with TechNova certified engineers.",
      relevantPlacementImpact: "Directly qualifies 143 shortlisted candidates for Super Dream cloud interviews (14–32 LPA packages).",
      operationalStatus: "In Execution",
    },
    {
      id: "int-core-robotics-lab",
      title: "Core Engineering Embedded Robotics & ROS Workbench Upgrade",
      category: "Laboratory / Resource Upgrade",
      priority: "critical",
      targetDepartmentIds: ["me", "ee", "ece"],
      targetDepartmentNames: ["Mechanical", "Electrical", "Electronics & Comm"],
      affectedStudentsCount: 140,
      timeframe: "Immediate (Weeks 2–5)",
      supportingEvidence: {
        skillOrCurriculumGap: "Only 20% curriculum coverage in ROS and embedded C++; severe core corporate partner deficit.",
        readinessScore: 43,
        funnelOrPlacementRisk: "Both ME (43% readiness) and EE (46% readiness) occupy the High Intervention Priority quadrant with heavy spillover into low-package IT roles.",
        targetRecruiterOrDrive: "Vertex Robotics & Schneider Electric",
      },
      recommendedAction: "Upgrade workbench hardware with ROS-enabled microcontrollers, PLC motor control rigs, and sensor telemetry kits with Vertex Robotics sponsorship.",
      relevantPlacementImpact: "Elevates ME/EE core engineering placement rate from 70.8% toward the 80%+ institutional threshold.",
      operationalStatus: "Planned",
    },
    {
      id: "int-algo-speed-drills",
      title: "Automated Code Evaluation & Dynamic Programming Screening Drills",
      category: "Assessment Preparation",
      priority: "high",
      targetDepartmentIds: ["cse", "it", "ds"],
      targetDepartmentNames: ["Computer Science", "Information Tech", "Data Science & AI"],
      affectedStudentsCount: 339,
      timeframe: "Immediate (Weeks 1–4)",
      supportingEvidence: {
        skillOrCurriculumGap: "Students have theoretical data structures knowledge but fail timed automated test suite constraints.",
        readinessScore: 52.9,
        funnelOrPlacementRisk: "Recruitment funnel bottleneck identified 194 candidates eliminated at Round 1 technical assessments (47.1% attrition drop).",
        targetRecruiterOrDrive: "All Campus Placement Drives (Google, Microsoft, Deloitte)",
      },
      recommendedAction: "Mandate weekly timed coding simulations focusing on dynamic programming, graph traversal, and edge-case testing.",
      relevantPlacementImpact: "Directly mitigates the identified 47.1% screening bottleneck, preserving ~80 candidate opportunities for interview rounds.",
      operationalStatus: "In Execution",
    },
    {
      id: "int-cad-solidworks",
      title: "Parametric CAD & GD&T Certification Intensive",
      category: "Drive-Specific Preparation",
      priority: "high",
      targetDepartmentIds: ["me"],
      targetDepartmentNames: ["Mechanical Engineering"],
      affectedStudentsCount: 72,
      timeframe: "Near Term (Weeks 3–6)",
      supportingEvidence: {
        skillOrCurriculumGap: "28% curriculum coverage in modern SolidWorks parametric modeling and structural FEA.",
        readinessScore: 43,
        funnelOrPlacementRisk: "Mechanical graduates struggle with industrial GD&T drawing interpretations during core engineering viva rounds.",
        targetRecruiterOrDrive: "Larsen & Toubro GET & Tata Advanced Systems",
      },
      recommendedAction: "Conduct a 4-week AutoCAD/SolidWorks intensive before the upcoming Larsen & Toubro on-campus recruitment drive.",
      relevantPlacementImpact: "Prevents technical interview eliminations in core manufacturing and structural design roles.",
      operationalStatus: "Planned",
    },
    {
      id: "int-vlsi-curriculum",
      title: "SystemVerilog & Hardware Verification Elective Revision",
      category: "Curriculum Revision",
      priority: "medium",
      targetDepartmentIds: ["ece", "ee"],
      targetDepartmentNames: ["Electronics & Comm", "Electrical Engineering"],
      affectedStudentsCount: 154,
      timeframe: "Upcoming Academic Term",
      supportingEvidence: {
        skillOrCurriculumGap: "42% curriculum coverage; high theoretical circuit knowledge but low testbench simulation practice.",
        readinessScore: 54,
        funnelOrPlacementRisk: "Semiconductor partners report strong fundamentals but suggest improvements in Verilog simulation and viva speed.",
        targetRecruiterOrDrive: "Qualcomm & Texas Instruments",
      },
      recommendedAction: "Formalize SystemVerilog and UVM testbench coursework in semester 7 ECE curriculum.",
      relevantPlacementImpact: "Unlocks high-value semiconductor offers with 18.5 LPA average compensation packages.",
      operationalStatus: "Under Review",
    },
    {
      id: "int-plc-automation-workshop",
      title: "Industrial PLC & Grid Automation Masterclass",
      category: "Industry Workshop",
      priority: "medium",
      targetDepartmentIds: ["ee"],
      targetDepartmentNames: ["Electrical Engineering"],
      affectedStudentsCount: 68,
      timeframe: "Near Term (Weeks 4–7)",
      supportingEvidence: {
        skillOrCurriculumGap: "38% curriculum coverage in power automation, SCADA, and smart grid systems.",
        readinessScore: 46,
        funnelOrPlacementRisk: "Limited engagement with power systems corporate partners; student placement concentrated in lower salary bands.",
        targetRecruiterOrDrive: "Schneider Electric & Tata Power",
      },
      recommendedAction: "Host Schneider Electric engineers for a 3-day hands-on PLC programming and grid automation masterclass.",
      relevantPlacementImpact: "Prepares electrical graduates for core substation and industrial automation engineering drives.",
      operationalStatus: "Planned",
    },
    {
      id: "int-cloud-fdp",
      title: "Cloud DevOps & Microservices Faculty Industry Exposure (FDP)",
      category: "Faculty Industry Exposure",
      priority: "medium",
      targetDepartmentIds: ["cse", "it"],
      targetDepartmentNames: ["Computer Science", "Information Tech"],
      affectedStudentsCount: 12,
      timeframe: "Near Term (Week 5)",
      supportingEvidence: {
        skillOrCurriculumGap: "Academic faculty instructors need direct industry exposure to modern Kubernetes and cloud security practices.",
        readinessScore: 100,
        funnelOrPlacementRisk: "Course syllabi lag corporate practices by 2–3 years without direct faculty immersion in production codebases.",
        targetRecruiterOrDrive: "TechNova Systems",
      },
      recommendedAction: "Enroll 12 engineering faculty instructors in TechNova's certified Cloud Architecture Faculty Development Program.",
      relevantPlacementImpact: "Ensures sustainable in-house curriculum alignment for future graduating batches without perpetual external consulting.",
      operationalStatus: "Planned",
    },
  ];

  const departmentCoverageSummary = [
    {
      deptId: "cse",
      shortName: "CSE",
      interventionsCount: 3,
      highestPriority: "critical" as const,
      primaryFocus: "Cloud DevOps Bootcamp & Assessment Speed Drills",
    },
    {
      deptId: "it",
      shortName: "IT",
      interventionsCount: 3,
      highestPriority: "critical" as const,
      primaryFocus: "Containerization & Timed Technical Assessments",
    },
    {
      deptId: "ds",
      shortName: "DS & AI",
      interventionsCount: 1,
      highestPriority: "high" as const,
      primaryFocus: "Algorithmic Code Evaluation Drills",
    },
    {
      deptId: "ece",
      shortName: "ECE",
      interventionsCount: 2,
      highestPriority: "critical" as const,
      primaryFocus: "Robotics Hardware Labs & SystemVerilog Testbench",
    },
    {
      deptId: "me",
      shortName: "ME",
      interventionsCount: 2,
      highestPriority: "critical" as const,
      primaryFocus: "Robotics Workbench Upgrade & Parametric CAD Certification",
    },
    {
      deptId: "ee",
      shortName: "EE",
      interventionsCount: 3,
      highestPriority: "critical" as const,
      primaryFocus: "Embedded Control, Mechatronics & PLC Power Automation",
    },
  ];

  const resourceAllocationGuidance = [
    {
      category: "Technical Bootcamp" as const,
      count: 1,
      rationale: "Highest-yield intervention for high-volume CS/IT cohorts targeting Super Dream drives.",
      urgency: "Immediate" as const,
    },
    {
      category: "Laboratory / Resource Upgrade" as const,
      count: 1,
      rationale: "Critical capital upgrade to reverse severe ME/EE core engineering placement deficits.",
      urgency: "Immediate" as const,
    },
    {
      category: "Assessment Preparation" as const,
      count: 1,
      rationale: "Directly halts the 47.1% screening test attrition rate across all departments.",
      urgency: "Immediate" as const,
    },
    {
      category: "Drive-Specific Preparation" as const,
      count: 1,
      rationale: "Aligns mechanical students directly with Larsen & Toubro campus drive criteria.",
      urgency: "Near Term" as const,
    },
    {
      category: "Curriculum Revision" as const,
      count: 1,
      rationale: "Institutionalizes SystemVerilog into semester 7 ECE syllabus for sustainable VLSI hiring.",
      urgency: "Next Academic Term" as const,
    },
    {
      category: "Industry Workshop" as const,
      count: 1,
      rationale: "Sponsored 3-day practical training on PLC automation with Schneider Electric.",
      urgency: "Near Term" as const,
    },
    {
      category: "Faculty Industry Exposure" as const,
      count: 1,
      rationale: "Certified TechNova FDP for 12 faculty to modernize classroom instruction.",
      urgency: "Near Term" as const,
    },
  ];

  const criticalCount = planItems.filter((p) => p.priority === "critical").length;
  const highPriorityCount = planItems.filter((p) => p.priority === "high").length;
  const totalStudentsCovered = 565;

  return {
    totalInterventions: planItems.length,
    criticalCount,
    highPriorityCount,
    totalStudentsCovered,
    planItems,
    departmentCoverageSummary,
    resourceAllocationGuidance,
  };
}


