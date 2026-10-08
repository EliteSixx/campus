import { institutionAnalytics, industryAnalytics, facultyProfile } from "@/data/analytics";

export async function getInstitutionAnalytics() {
  return institutionAnalytics;
}

export async function getIndustrySkillDemand() {
  return industryAnalytics;
}

export async function getFacultyProfile() {
  return facultyProfile;
}

export async function simulateIntervention(params: {
  baselineReadiness: number;
  targetStudents: number;
  durationWeeks: number;
}) {
  // Simple deterministic model standing in for a future backend simulation.
  const durationFactor = Math.min(1.6, params.durationWeeks / 6);
  const scaleFactor = Math.min(1.3, params.targetStudents / 143);
  const increase = Math.round(16 * durationFactor * (0.7 + 0.3 * scaleFactor));
  const after = Math.min(95, params.baselineReadiness + increase);
  const studentsImproved = Math.round(params.targetStudents * (increase / 100) * 4.2);
  return {
    before: params.baselineReadiness,
    after,
    increase: after - params.baselineReadiness,
    studentsImproved: Math.min(params.targetStudents, Math.max(0, studentsImproved)),
  };
}
