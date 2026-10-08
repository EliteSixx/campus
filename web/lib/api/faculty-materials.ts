import { facultyProfile } from "@/data/analytics";
import { getSubjectById, subjects, type Subject } from "@/data/curriculum";
import { unitsForCourse, type Unit } from "@/data/faculty-course-units";
import {
  materials,
  MATERIAL_TYPES,
  type Material,
  type MaterialType,
  type MaterialVisibility,
} from "@/data/faculty-materials";

// Course materials joined to the curriculum and the unit grouping, flattened so
// the client works from plain data and never pulls the data modules into the
// browser bundle.
//
// Pure type helpers (MATERIAL_TYPE_META, materialLevel, isValidHttpUrl,
// videoProvider) deliberately live in lib/api/faculty-materials-meta.ts, which
// imports no data and is therefore safe to use from a client component. This
// file is server-side only.
//
// Topic ids repeat across courses — cs301 has t1..t6 and the others t1..t5 —
// so every topic lookup below is keyed on (courseId, topicId).
//
// No clock is read here. "Latest" is decided by comparing stored ISO strings.

export interface MaterialCourseSummary {
  id: string;
  code: string;
  name: string;
  unitCount: number;
  topicCount: number;
  materialCount: number;
  countByType: Record<MaterialType, number>;
  // null when the course has no material at all.
  lastUpdated: string | null;
}

export interface TopicMaterials {
  topicId: string;
  topicName: string;
  materials: Material[];
}

export interface UnitNode {
  unit: Unit;
  unitMaterials: Material[];
  topics: TopicMaterials[];
  // Unit-level plus everything on its topics.
  totalMaterials: number;
}

export interface CourseMaterialTree {
  course: Subject;
  courseMaterials: Material[];
  units: UnitNode[];
}

export interface MaterialFilter {
  courseId?: string;
  unitId?: string;
  topicId?: string;
  type?: MaterialType;
  visibility?: MaterialVisibility;
  search?: string;
}

export interface ResolvedMaterial {
  material: Material;
  courseCode: string;
  courseName: string;
  // null for course-level material.
  unitTitle: string | null;
  // null for course- and unit-level material.
  topicName: string | null;
}

export interface MaterialsOverview {
  totalMaterials: number;
  publishedCount: number;
  hiddenCount: number;
  totalViews: number;
  totalDownloads: number;
  countByType: Record<MaterialType, number>;
  // Across all four courses.
  topicsWithoutMaterials: number;
}

export interface UnitCoverage {
  unitId: string;
  unitNumber: number;
  unitTitle: string;
  topicsWithMaterials: number;
  totalTopics: number;
  // Names, not ids, because this list is read by a person.
  topicsWithoutMaterials: string[];
}

function emptyTypeCount(): Record<MaterialType, number> {
  // Built from MATERIAL_TYPES so a new type can never be silently missed.
  const counts = {} as Record<MaterialType, number>;
  for (const type of MATERIAL_TYPES) counts[type] = 0;
  return counts;
}

function countByType(list: Material[]): Record<MaterialType, number> {
  const counts = emptyTypeCount();
  for (const material of list) counts[material.type] += 1;
  return counts;
}

// ISO strings compare correctly as text, so no Date is constructed.
function latestUploadedAt(list: Material[]): string | null {
  return list.reduce<string | null>(
    (latest, material) =>
      latest === null || material.uploadedAt > latest
        ? material.uploadedAt
        : latest,
    null,
  );
}

const newestFirst = (a: Material, b: Material) =>
  b.uploadedAt.localeCompare(a.uploadedAt);

function forCourse(courseId: string): Material[] {
  return materials.filter((material) => material.courseId === courseId);
}

// A topic id is ambiguous on its own, so the course is always part of the match.
function forTopic(courseId: string, topicId: string): Material[] {
  return materials
    .filter((m) => m.courseId === courseId && m.topicId === topicId)
    .sort(newestFirst);
}

// Who a new upload is attributed to — the same person the seed data credits.
// Kept here so the page never has to reach into a data module for one string.
export async function getMaterialsUploader(): Promise<string> {
  return facultyProfile.name;
}

export async function getMaterialCourses(): Promise<MaterialCourseSummary[]> {
  return subjects.map((subject) => {
    const mine = forCourse(subject.id);
    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      unitCount: unitsForCourse(subject.id).length,
      topicCount: subject.topics.length,
      materialCount: mine.length,
      countByType: countByType(mine),
      lastUpdated: latestUploadedAt(mine),
    };
  });
}

export async function getCourseMaterialTree(
  courseId: string,
): Promise<CourseMaterialTree | null> {
  const course = getSubjectById(courseId);
  if (!course) return null;

  const topicName = new Map(course.topics.map((t) => [t.id, t.name]));

  const units: UnitNode[] = unitsForCourse(courseId).map((unit) => {
    const unitMaterials = materials
      .filter(
        (m) =>
          m.courseId === courseId && m.unitId === unit.id && m.topicId === null,
      )
      .sort(newestFirst);

    // Topics stay in curriculum order, and a topic with nothing on it is kept
    // rather than dropped so the UI can show the gap.
    const topics: TopicMaterials[] = unit.topicIds.map((topicId) => ({
      topicId,
      topicName: topicName.get(topicId) ?? topicId,
      materials: forTopic(courseId, topicId),
    }));

    return {
      unit,
      unitMaterials,
      topics,
      totalMaterials:
        unitMaterials.length +
        topics.reduce((sum, topic) => sum + topic.materials.length, 0),
    };
  });

  return {
    course,
    courseMaterials: materials
      .filter(
        (m) => m.courseId === courseId && m.unitId === null && m.topicId === null,
      )
      .sort(newestFirst),
    units,
  };
}

export async function getMaterials(
  filter?: MaterialFilter,
): Promise<Material[]> {
  const search = filter?.search?.trim().toLowerCase() ?? "";

  return materials
    .filter((material) => {
      if (filter?.courseId && material.courseId !== filter.courseId) {
        return false;
      }
      if (filter?.unitId && material.unitId !== filter.unitId) return false;
      // Pass courseId alongside topicId: on its own a topic id matches the
      // same-numbered topic in every course.
      if (filter?.topicId && material.topicId !== filter.topicId) return false;
      if (filter?.type && material.type !== filter.type) return false;
      if (filter?.visibility && material.visibility !== filter.visibility) {
        return false;
      }
      if (search === "") return true;
      return (
        material.title.toLowerCase().includes(search) ||
        material.description.toLowerCase().includes(search) ||
        material.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    })
    .sort(newestFirst);
}

export async function getMaterialById(
  id: string,
): Promise<ResolvedMaterial | null> {
  const material = materials.find((m) => m.id === id);
  if (!material) return null;

  const course = getSubjectById(material.courseId);
  const unit = material.unitId
    ? unitsForCourse(material.courseId).find((u) => u.id === material.unitId)
    : undefined;
  const topic = material.topicId
    ? course?.topics.find((t) => t.id === material.topicId)
    : undefined;

  return {
    material,
    courseCode: course?.code ?? material.courseId,
    courseName: course?.name ?? material.courseId,
    unitTitle: unit ? `Unit ${unit.number}: ${unit.title}` : null,
    topicName: topic?.name ?? null,
  };
}

// Topics with nothing attached, counted across every course. Keyed per course
// because the same topic id exists in more than one.
function countTopicsWithoutMaterials(): number {
  return subjects.reduce((total, subject) => {
    const covered = new Set(
      materials
        .filter((m) => m.courseId === subject.id && m.topicId !== null)
        .map((m) => m.topicId),
    );
    return total + subject.topics.filter((t) => !covered.has(t.id)).length;
  }, 0);
}

export async function getMaterialsOverview(): Promise<MaterialsOverview> {
  return {
    totalMaterials: materials.length,
    publishedCount: materials.filter((m) => m.visibility === "published").length,
    hiddenCount: materials.filter((m) => m.visibility === "hidden").length,
    totalViews: materials.reduce((sum, m) => sum + m.views, 0),
    totalDownloads: materials.reduce((sum, m) => sum + m.downloads, 0),
    countByType: countByType(materials),
    topicsWithoutMaterials: countTopicsWithoutMaterials(),
  };
}

export async function getTopicCoverage(
  courseId: string,
): Promise<UnitCoverage[]> {
  const course = getSubjectById(courseId);
  if (!course) return [];

  const topicName = new Map(course.topics.map((t) => [t.id, t.name]));
  const covered = new Set(
    materials
      .filter((m) => m.courseId === courseId && m.topicId !== null)
      .map((m) => m.topicId),
  );

  return unitsForCourse(courseId).map((unit) => {
    const withMaterials = unit.topicIds.filter((id) => covered.has(id));
    return {
      unitId: unit.id,
      unitNumber: unit.number,
      unitTitle: unit.title,
      topicsWithMaterials: withMaterials.length,
      totalTopics: unit.topicIds.length,
      topicsWithoutMaterials: unit.topicIds
        .filter((id) => !covered.has(id))
        .map((id) => topicName.get(id) ?? id),
    };
  });
}
