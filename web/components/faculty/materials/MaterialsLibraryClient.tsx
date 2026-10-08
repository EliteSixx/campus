"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  FolderOpen,
  Layers,
  Search,
  Upload,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MetricCard } from "@/components/shared/metric-card";
import type { Material, MaterialType } from "@/lib/api/faculty-materials-meta";
import { MATERIAL_TYPE_META } from "@/lib/api/faculty-materials-meta";
import { formatDateTime } from "@/components/faculty/announcements/utils";
import { MaterialRow } from "./MaterialRow";
import { MaterialDetailPanel } from "./MaterialDetailPanel";
import { UploadMaterial, type UploadPreselect } from "./UploadMaterial";
import { useMaterialsStore } from "./useMaterialsStore";
import {
  newestFirst,
  pathLabel,
  topicKey,
  type CourseOption,
} from "./utils";

const ALL = "all";

const TYPE_ORDER: MaterialType[] = [
  "pdf",
  "ppt",
  "notes",
  "pyq",
  "lab-manual",
  "question-bank",
  "link",
  "video",
];

export interface CourseFacts {
  id: string;
  code: string;
  name: string;
  unitCount: number;
  topicCount: number;
}

export function MaterialsLibraryClient({
  courseFacts,
  serverMaterials,
  courseOptions,
  uploadedBy,
}: {
  // Static facts a local upload cannot change.
  courseFacts: CourseFacts[];
  serverMaterials: Material[];
  courseOptions: CourseOption[];
  uploadedBy: string;
}) {
  const { materials, toggleVisibility, addLocal, deleteLocal } =
    useMaterialsStore(serverMaterials);

  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>(ALL);
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [visibilityFilter, setVisibilityFilter] = useState<string>(ALL);

  const [selected, setSelected] = useState<Material | null>(null);
  const [uploadPreselect, setUploadPreselect] =
    useState<UploadPreselect | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  // Labels for a material's path. Topics are keyed on courseId + topicId,
  // because the same topic id exists in every course.
  const labelFor = useMemo(() => {
    const courseById = new Map(courseOptions.map((c) => [c.id, c]));
    const unitById = new Map(
      courseOptions.flatMap((c) => c.units.map((u) => [u.id, u] as const)),
    );
    const topicByKey = new Map(
      courseOptions.flatMap((c) =>
        c.units.flatMap((u) =>
          u.topics.map((t) => [topicKey(c.id, t.id), t] as const),
        ),
      ),
    );

    return (material: Material): string => {
      const course = courseById.get(material.courseId);
      const unit = material.unitId ? unitById.get(material.unitId) : undefined;
      const topic = material.topicId
        ? topicByKey.get(topicKey(material.courseId, material.topicId))
        : undefined;
      return pathLabel({
        courseCode: course?.code ?? material.courseId,
        unitNumber: unit?.number ?? null,
        unitTitle: unit?.title ?? null,
        topicName: topic?.name ?? null,
      });
    };
  }, [courseOptions]);

  // Recomputed from the merged list, so local uploads and local visibility
  // changes are counted rather than the seed baseline being shown.
  const overview = useMemo(() => {
    const covered = new Set(
      materials
        .filter((m) => m.topicId !== null)
        .map((m) => topicKey(m.courseId, m.topicId as string)),
    );
    const totalTopics = courseOptions.reduce(
      (sum, course) =>
        sum + course.units.reduce((n, unit) => n + unit.topics.length, 0),
      0,
    );
    const coveredCount = courseOptions.reduce(
      (sum, course) =>
        sum +
        course.units.reduce(
          (n, unit) =>
            n +
            unit.topics.filter((t) => covered.has(topicKey(course.id, t.id)))
              .length,
          0,
        ),
      0,
    );

    return {
      total: materials.length,
      published: materials.filter((m) => m.visibility === "published").length,
      hidden: materials.filter((m) => m.visibility === "hidden").length,
      views: materials.reduce((sum, m) => sum + m.views, 0),
      downloads: materials.reduce((sum, m) => sum + m.downloads, 0),
      topicsWithout: totalTopics - coveredCount,
      totalTopics,
      coveredCount,
    };
  }, [materials, courseOptions]);

  // Per-course figures, also from the merged list.
  const courseCards = useMemo(() => {
    return courseFacts.map((facts) => {
      const mine = materials.filter((m) => m.courseId === facts.id);
      const option = courseOptions.find((c) => c.id === facts.id);
      const topics = option?.units.flatMap((u) => u.topics) ?? [];
      const covered = new Set(
        mine
          .filter((m) => m.topicId !== null)
          .map((m) => topicKey(facts.id, m.topicId as string)),
      );
      const coveredCount = topics.filter((t) =>
        covered.has(topicKey(facts.id, t.id)),
      ).length;

      const counts = TYPE_ORDER.map((type) => ({
        type,
        count: mine.filter((m) => m.type === type).length,
      })).filter((entry) => entry.count > 0);

      const lastUpdated = mine.reduce<string | null>(
        (latest, m) =>
          latest === null || m.uploadedAt > latest ? m.uploadedAt : latest,
        null,
      );

      return {
        ...facts,
        materialCount: mine.length,
        counts,
        lastUpdated,
        coveredCount,
        topicTotal: topics.length,
      };
    });
  }, [courseFacts, materials, courseOptions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials
      .filter((material) => {
        if (courseFilter !== ALL && material.courseId !== courseFilter) {
          return false;
        }
        if (typeFilter !== ALL && material.type !== typeFilter) return false;
        if (
          visibilityFilter !== ALL &&
          material.visibility !== visibilityFilter
        ) {
          return false;
        }
        if (q === "") return true;
        return (
          material.title.toLowerCase().includes(q) ||
          material.description.toLowerCase().includes(q) ||
          material.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      })
      .sort(newestFirst);
  }, [materials, query, courseFilter, typeFilter, visibilityFilter]);

  const filtersActive =
    query.trim() !== "" ||
    courseFilter !== ALL ||
    typeFilter !== ALL ||
    visibilityFilter !== ALL;

  function openUpload(preselect: UploadPreselect | null) {
    setUploadPreselect(preselect);
    setUploadOpen(true);
  }

  function handleUploaded(material: Material, message: string) {
    addLocal(material);
    setFlash(message);
    setUploadOpen(false);
  }

  return (
    <>
      <div className="mt-5 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold tracking-tight text-ink">Library</h3>
        <Button size="sm" onClick={() => openUpload(null)}>
          <Upload className="h-3.5 w-3.5" />
          Upload material
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total materials"
          value={String(overview.total)}
          icon={FolderOpen}
          tone="accent"
        />
        <MetricCard
          label="Published / Hidden"
          value={`${overview.published} / ${overview.hidden}`}
          icon={Eye}
          trend="Hidden items are not shown to students"
        />
        <MetricCard
          label="Views / Downloads"
          value={`${overview.views} / ${overview.downloads}`}
          icon={Layers}
        />
        <MetricCard
          label="Topics without materials"
          value={String(overview.topicsWithout)}
          icon={Search}
          tone={overview.topicsWithout > 0 ? "warning" : "success"}
          trend={`${overview.coveredCount} of ${overview.totalTopics} topics covered`}
        />
      </div>

      {flash && (
        <Card className="mt-4 flex items-center justify-between gap-3 border-success/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {flash}
          </p>
          <button
            type="button"
            onClick={() => setFlash(null)}
            aria-label="Dismiss message"
            className="rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}

      {/* Course cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {courseCards.map((course) => (
          <Link
            key={course.id}
            href={`/faculty/materials/${course.id}`}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Card className="h-full p-5 hover:border-accent/40">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral" className="font-mono">
                  {course.code}
                </Badge>
                <h3 className="text-sm font-bold text-ink">{course.name}</h3>
              </div>

              <p className="mt-1.5 text-xs text-ink-muted">
                <span className="font-mono tabular text-ink">
                  {course.unitCount}
                </span>{" "}
                units ·{" "}
                <span className="font-mono tabular text-ink">
                  {course.topicCount}
                </span>{" "}
                topics ·{" "}
                <span className="font-mono tabular text-ink">
                  {course.materialCount}
                </span>{" "}
                materials
              </p>

              {course.counts.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {course.counts.map((entry) => (
                    <Badge
                      key={entry.type}
                      tone="neutral"
                      className="px-1.5 py-0 text-[9px]"
                    >
                      {MATERIAL_TYPE_META[entry.type].label} {entry.count}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[11px] text-ink-muted">
                  <span className="font-mono tabular text-ink">
                    {course.coveredCount} of {course.topicTotal}
                  </span>{" "}
                  topics covered
                </p>
                <div className="mt-1.5">
                  <Progress
                    value={
                      course.topicTotal
                        ? (course.coveredCount / course.topicTotal) * 100
                        : 0
                    }
                  />
                </div>
                {course.lastUpdated && (
                  <p className="mt-2 font-mono text-[10px] tabular text-ink-muted">
                    Last updated {formatDateTime(course.lastUpdated)}
                  </p>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* All materials */}
      <h3 className="mt-6 text-sm font-bold tracking-tight text-ink">
        All materials
      </h3>

      <Card className="mt-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <label htmlFor="material-search" className="sr-only">
              Search materials
            </label>
            <Input
              id="material-search"
              placeholder="Search title, description or tags..."
              className="pl-9 text-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-40">
            <label htmlFor="material-course-filter" className="sr-only">
              Filter by course
            </label>
            <Select
              id="material-course-filter"
              className="text-xs"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value={ALL}>All courses</option>
              {courseFacts.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <label htmlFor="material-type-filter" className="sr-only">
              Filter by type
            </label>
            <Select
              id="material-type-filter"
              className="text-xs"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value={ALL}>All types</option>
              {TYPE_ORDER.map((type) => (
                <option key={type} value={type}>
                  {MATERIAL_TYPE_META[type].label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-36">
            <label htmlFor="material-visibility-filter" className="sr-only">
              Filter by visibility
            </label>
            <Select
              id="material-visibility-filter"
              className="text-xs"
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
            >
              <option value={ALL}>All</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </Select>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!filtersActive}
            onClick={() => {
              setQuery("");
              setCourseFilter(ALL);
              setTypeFilter(ALL);
              setVisibilityFilter(ALL);
            }}
          >
            Clear
          </Button>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <FolderOpen className="mx-auto h-6 w-6 text-ink-faint" />
          <p className="mt-2 text-sm font-semibold text-ink">
            No materials match these filters
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Try a different search, course, type or visibility.
          </p>
        </Card>
      ) : (
        <div className="mt-4 space-y-2">
          {filtered.map((material) => (
            <MaterialRow
              key={material.id}
              material={material}
              pathLabel={labelFor(material)}
              onOpen={setSelected}
            />
          ))}
        </div>
      )}

      {selected && (
        <MaterialDetailPanel
          material={selected}
          pathLabel={labelFor(selected)}
          onClose={() => setSelected(null)}
          onToggleVisibility={(material) => {
            toggleVisibility(material);
            // Keep the panel showing the new state rather than the stale one.
            setSelected({
              ...material,
              visibility:
                material.visibility === "published" ? "hidden" : "published",
            });
          }}
          onDelete={(material) => {
            deleteLocal(material);
            setSelected(null);
          }}
        />
      )}

      {uploadOpen && (
        <UploadMaterial
          courses={courseOptions}
          uploadedBy={uploadedBy}
          preselect={uploadPreselect}
          onClose={() => setUploadOpen(false)}
          onUploaded={handleUploaded}
        />
      )}
    </>
  );
}
