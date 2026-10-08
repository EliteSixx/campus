import {
  facultyPrograms,
  FacultyProgram,
  ProgramType,
} from "@/data/faculty-programs";
import {
  getAllSubjectAnalyses,
  getSkillDemandCount,
} from "@/lib/api/curriculum";
import { getSkillById } from "@/data/skills";
import { subjects } from "@/data/curriculum";
import { opportunities } from "@/data/opportunities";
import { getFacultyProfile } from "@/lib/api/analytics";
import { getStudentsWorkspace } from "@/lib/api/faculty-students-workspace";
import {
  isFunding,
  parseStartsIn,
  startsSoon,
  type ProgramRow,
  type ProgramsWorkspace,
} from "@/lib/api/faculty-programs-meta";

// Ranks faculty development and research opportunities by how much each one
// would close the gaps already identified in the subjects this faculty teaches.

export interface ProgramGapSkill {
  skillId: string;
  name: string;
  demandCount: number;
  // Every subject of mine whose syllabus is missing this skill.
  subjectCodes: string[];
}

export interface ProgramWithImpact extends FacultyProgram {
  gapSkills: ProgramGapSkill[];
  gapImpact: number;
  skillNames: string[];
}

// Display order for the type filter, independent of the data's own order.
const PROGRAM_TYPE_ORDER: ProgramType[] = [
  "FDP",
  "Certification",
  "Workshop",
  "Research Grant",
  "Consultancy",
];

function skillName(skillId: string): string {
  return getSkillById(skillId)?.name ?? skillId;
}

export async function getProgramsWithImpact(): Promise<ProgramWithImpact[]> {
  const analyses = await getAllSubjectAnalyses();

  // skillId -> the subject codes that skill is missing from. A skill can be
  // missing from more than one subject, so the codes accumulate.
  const missingFrom = new Map<string, string[]>();
  for (const analysis of analyses) {
    for (const missing of analysis.missingSkills) {
      const codes = missingFrom.get(missing.skillId) ?? [];
      codes.push(analysis.subject.code);
      missingFrom.set(missing.skillId, codes);
    }
  }

  // The data's own order is the tiebreak, so remember it before sorting.
  const dataOrder = new Map(facultyPrograms.map((p, i) => [p.id, i]));

  const withImpact: ProgramWithImpact[] = facultyPrograms.map((program) => {
    const gapSkills: ProgramGapSkill[] = program.skillIds
      .filter((skillId) => missingFrom.has(skillId))
      .map((skillId) => ({
        skillId,
        name: skillName(skillId),
        demandCount: getSkillDemandCount(skillId),
        subjectCodes: missingFrom.get(skillId) ?? [],
      }));

    return {
      ...program,
      gapSkills,
      gapImpact: gapSkills.reduce((sum, s) => sum + s.demandCount, 0),
      skillNames: program.skillIds.map(skillName),
    };
  });

  return withImpact.sort(
    (a, b) =>
      b.gapImpact - a.gapImpact ||
      (dataOrder.get(a.id) ?? 0) - (dataOrder.get(b.id) ?? 0),
  );
}

export function getProgramTypes(): ProgramType[] {
  const present = new Set(facultyPrograms.map((p) => p.type));
  return PROGRAM_TYPE_ORDER.filter((type) => present.has(type));
}

// ---------------------------------------------------------------------------
// Workspace for the redesigned /faculty/programs page. Added alongside the
// functions above, which the faculty dashboard and the curriculum pages still
// use unchanged.
//
// Gap data comes from getProgramsWithImpact() (so from the same subject
// analyses as the curriculum pages), student impact from the My Students
// workspace's weakestSkills, and posting counts from the same live postings and
// the same "required or preferred" rule as lib/api/curriculum.ts. No clock is
// read here.

export async function getProgramsWorkspace(): Promise<ProgramsWorkspace> {
  const [programs, profile, students] = await Promise.all([
    getProgramsWithImpact(),
    getFacultyProfile(),
    getStudentsWorkspace(),
  ]);

  const subjectIdByCode = new Map(subjects.map((s) => [s.code, s.id]));
  const weakest = students.weakestSkills;

  const rows: ProgramRow[] = programs.map((program, index) => {
    const gaps = program.gapSkills.map((gap) => ({
      skillId: gap.skillId,
      name: gap.name,
      demandCount: gap.demandCount,
      subjects: gap.subjectCodes.flatMap((code) => {
        const id = subjectIdByCode.get(code);
        return id ? [{ id, code }] : [];
      }),
    }));
    const gapSkillIds = gaps.map((g) => g.skillId);

    const postingsCount = opportunities.filter((o) =>
      gapSkillIds.some(
        (id) => o.requiredSkills.includes(id) || o.preferredSkills.includes(id),
      ),
    ).length;

    // weakestSkills is weakest first, so the first match is the weakest.
    const weak = weakest.find((w) => program.skillIds.includes(w.skillId));

    return {
      id: program.id,
      title: program.title,
      provider: program.provider,
      type: program.type,
      mode: program.mode,
      durationWeeks: program.durationWeeks,
      costText: program.funding,
      eligibility: program.eligibility,
      description: program.description,
      skillIds: [...program.skillIds],
      skillNames: [...program.skillNames],
      seatsLeft: program.seatsLeft,
      startText: program.startsIn,
      timing: parseStartsIn(program.startsIn),
      gaps,
      gapSkillIds,
      gapSubjectCodes: [
        ...new Set(gaps.flatMap((g) => g.subjects.map((s) => s.code))),
      ],
      gapDemand: program.gapImpact,
      postingsCount,
      studentImpact:
        weak && !isFunding(program.type)
          ? { skillName: weak.name, cohortAverage: weak.cohortAverage }
          : null,
      impactRank: index,
    };
  });

  return {
    faculty: { name: profile.name, department: profile.department },
    totalPostings: opportunities.length,
    rows,
    totals: {
      open: rows.length,
      matchedToGaps: rows.filter((r) => r.gapDemand > 0).length,
      gapSkillsCovered: new Set(rows.flatMap((r) => r.gapSkillIds)).size,
      startingSoon: rows.filter(startsSoon).length,
    },
  };
}
