"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Plus,
  Search,
  Target,
  Upload,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Material, MaterialType } from "@/lib/api/faculty-materials-meta";
import { MATERIAL_TYPE_META } from "@/lib/api/faculty-materials-meta";
import { cn } from "@/lib/utils";
import { MaterialRow } from "./MaterialRow";
import { MaterialDetailPanel } from "./MaterialDetailPanel";
import { UploadMaterial, type UploadPreselect } from "./UploadMaterial";
import { useMaterialsStore } from "./useMaterialsStore";
import {
  newestFirst,
  pathLabel,
  topicKey,
  type CourseOption,
  type UnitOption,
} from "./utils";

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

export function CourseTreeClient({
  course,
  units,
  serverMaterials,
  courseOptions,
  uploadedBy,
}: {
  course: { id: string; code: string; name: string };
  units: UnitOption[];
  // Every seed material for this course, flat. The tree is rebuilt here so
  // local uploads land in the right place.
  serverMaterials: Material[];
  courseOptions: CourseOption[];
  uploadedBy: string;
}) {
  const { materials, toggleVisibility, addLocal, deleteLocal } =
    useMaterialsStore(serverMaterials);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MaterialType | "all">("all");
  const [showHidden, setShowHidden] = useState(true);
  // Unit 1 open to begin with; the rest are closed.
  const [expanded, setExpanded] = useState<string[]>(() =>
    units[0] ? [units[0].id] : [],
  );

  const [selected, setSelected] = useState<Material | null>(null);
  const [uploadPreselect, setUploadPreselect] =
    useState<UploadPreselect | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (material: Material) => {
      if (!showHidden && material.visibility === "hidden") return false;
      if (typeFilter !== "all" && material.type !== typeFilter) return false;
      if (q === "") return true;
      return (
        material.title.toLowerCase().includes(q) ||
        material.description.toLowerCase().includes(q) ||
        material.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    };
  }, [query, typeFilter, showHidden]);

  const filtersActive =
    query.trim() !== "" || typeFilter !== "all" || !showHidden;

  const mine = useMemo(
    () => materials.filter((m) => m.courseId === course.id),
    [materials, course.id],
  );

  const typeCounts = useMemo(() => {
    const counts = {} as Record<MaterialType, number>;
    for (const type of TYPE_ORDER) counts[type] = 0;
    for (const material of mine) counts[material.type] += 1;
    return counts;
  }, [mine]);

  // Course-level material, with past papers grouped by year, newest first.
  const courseLevel = useMemo(
    () => mine.filter((m) => m.unitId === null && m.topicId === null).filter(matches),
    [mine, matches],
  );

  const pyqYears = useMemo(() => {
    const byYear = new Map<number, Material[]>();
    for (const material of courseLevel) {
      if (!material.pyq) continue;
      const list = byYear.get(material.pyq.year) ?? [];
      list.push(material);
      byYear.set(material.pyq.year, list);
    }
    return [...byYear.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, list]) => ({ year, materials: list.sort(newestFirst) }));
  }, [courseLevel]);

  const otherCourseLevel = useMemo(
    () => courseLevel.filter((m) => !m.pyq).sort(newestFirst),
    [courseLevel],
  );

  // The tree, rebuilt from the merged list. Topics are matched on courseId plus
  // topicId, never topicId alone.
  const tree = useMemo(() => {
    return units.map((unit) => {
      const unitMaterials = mine
        .filter((m) => m.unitId === unit.id && m.topicId === null)
        .filter(matches)
        .sort(newestFirst);

      const topics = unit.topics.map((topic) => ({
        topic,
        materials: mine
          .filter((m) => m.topicId === topic.id && m.unitId === unit.id)
          .filter(matches)
          .sort(newestFirst),
        // Coverage counts everything on the topic, filters or not.
        hasAny: mine.some(
          (m) => m.topicId === topic.id && m.unitId === unit.id,
        ),
      }));

      const visibleCount =
        unitMaterials.length +
        topics.reduce((sum, t) => sum + t.materials.length, 0);

      return {
        unit,
        unitMaterials,
        topics,
        visibleCount,
        coveredTopics: topics.filter((t) => t.hasAny).length,
      };
    });
  }, [units, mine, matches]);

  // With filters on, only units holding a match are shown, and they open
  // themselves so the result is not hidden behind a collapsed header.
  const visibleUnits = filtersActive
    ? tree.filter((node) => node.visibleCount > 0)
    : tree;

  const isOpen = (unitId: string) =>
    filtersActive ? true : expanded.includes(unitId);

  const nothingMatches =
    filtersActive && visibleUnits.length === 0 && courseLevel.length === 0;

  function toggleUnit(unitId: string) {
    setExpanded((current) =>
      current.includes(unitId)
        ? current.filter((id) => id !== unitId)
        : [...current, unitId],
    );
  }

  function openUpload(preselect: UploadPreselect) {
    setUploadPreselect(preselect);
    setUploadOpen(true);
  }

  function handleUploaded(material: Material, message: string) {
    addLocal(material);
    setFlash(message);
    setUploadOpen(false);
    // Make sure the unit it landed in is open.
    if (material.unitId && !expanded.includes(material.unitId)) {
      setExpanded((current) => [...current, material.unitId as string]);
    }
  }

  const labelFor = (material: Material): string => {
    const unit = units.find((u) => u.id === material.unitId);
    const topic = material.topicId
      ? unit?.topics.find((t) => t.id === material.topicId)
      : undefined;
    return pathLabel({
      courseCode: course.code,
      unitNumber: unit?.number ?? null,
      unitTitle: unit?.title ?? null,
      topicName: topic?.name ?? null,
    });
  };

  return (
    <>
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <FolderOpen className="h-5 w-5 text-accent" />
              <Badge tone="neutral" className="font-mono">
                {course.code}
              </Badge>
              <h2 className="text-xl font-bold text-ink">{course.name}</h2>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              <span className="font-mono tabular text-ink">{mine.length}</span>{" "}
              materials across{" "}
              <span className="font-mono tabular text-ink">{units.length}</span>{" "}
              units.
            </p>
            <Link
              href={`/faculty/subjects/${course.id}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <Target className="h-3.5 w-3.5" />
              View curriculum analysis
            </Link>
          </div>
          <Button size="sm" onClick={() => openUpload({ courseId: course.id })}>
            <Upload className="h-3.5 w-3.5" />
            Upload material
          </Button>
        </div>
      </Card>

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

      {/* Filters */}
      <Card className="mt-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
          <label htmlFor="course-material-search" className="sr-only">
            Search materials in this course
          </label>
          <Input
            id="course-material-search"
            placeholder="Search title, description or tags..."
            className="pl-9 text-xs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-pressed={typeFilter === "all"}
            onClick={() => setTypeFilter("all")}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              typeFilter === "all"
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:bg-surface-raised hover:text-ink",
            )}
          >
            All {mine.length}
          </button>
          {TYPE_ORDER.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={typeFilter === type}
              onClick={() => setTypeFilter(type)}
              disabled={typeCounts[type] === 0}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold transition-all disabled:opacity-40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                typeFilter === type
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-muted hover:bg-surface-raised hover:text-ink",
              )}
            >
              {MATERIAL_TYPE_META[type].label} {typeCounts[type]}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-violet-600"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            Show hidden
          </label>

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={filtersActive}
              onClick={() => setExpanded(units.map((u) => u.id))}
            >
              Expand all
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={filtersActive}
              onClick={() => setExpanded([])}
            >
              Collapse all
            </Button>
          </div>
        </div>
        {filtersActive && (
          <p className="mt-2 text-[11px] text-ink-muted">
            Filters are on, so units with matches are open and the rest are
            hidden.
          </p>
        )}
      </Card>

      {nothingMatches && (
        <Card className="mt-4 p-8 text-center">
          <FolderOpen className="mx-auto h-6 w-6 text-ink-faint" />
          <p className="mt-2 text-sm font-semibold text-ink">
            No materials match
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Try a different search or type.
          </p>
        </Card>
      )}

      {/* Course-level */}
      {(courseLevel.length > 0 || !filtersActive) && (
        <Card className="mt-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold tracking-tight text-ink">
              Course-level materials
              <span className="ml-2 font-mono text-[11px] tabular text-ink-muted">
                {courseLevel.length}
              </span>
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openUpload({ courseId: course.id })}
              aria-label="Upload material for the whole course"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            Past papers, question banks and manuals for the whole course.
          </p>

          {pyqYears.map((group) => (
            <div key={group.year} className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                {group.year}
                {group.materials[0]?.pyq && (
                  <>
                    {" • "}
                    {group.materials
                      .map((m) =>
                        m.pyq?.examType === "mid-sem"
                          ? "Mid-sem"
                          : m.pyq?.examType === "end-sem"
                            ? "End-sem"
                            : "Quiz",
                      )
                      .join(", ")}
                  </>
                )}
              </p>
              <div className="mt-1.5 space-y-2">
                {group.materials.map((material) => (
                  <MaterialRow
                    key={material.id}
                    material={material}
                    onOpen={setSelected}
                  />
                ))}
              </div>
            </div>
          ))}

          {otherCourseLevel.length > 0 && (
            <div className="mt-4 space-y-2">
              {otherCourseLevel.map((material) => (
                <MaterialRow
                  key={material.id}
                  material={material}
                  onOpen={setSelected}
                />
              ))}
            </div>
          )}

          {courseLevel.length === 0 && (
            <p className="mt-3 rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-ink-muted">
              Nothing at course level yet.
            </p>
          )}
        </Card>
      )}

      {/* Units */}
      <div className="mt-4 space-y-3">
        {visibleUnits.map((node) => {
          const open = isOpen(node.unit.id);
          const panelId = `unit-panel-${node.unit.id}`;

          return (
            <Card key={node.unit.id} className="overflow-hidden p-0">
              <div className="flex items-center gap-2 p-4">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleUnit(node.unit.id)}
                  disabled={filtersActive}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {open ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink">
                      Unit {node.unit.number} • {node.unit.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">
                      <span className="font-mono tabular">
                        {node.coveredTopics} of {node.topics.length}
                      </span>{" "}
                      topics covered
                    </span>
                  </span>
                </button>

                <Badge tone="neutral" className="shrink-0 px-1.5 py-0 text-[9px]">
                  {node.visibleCount}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() =>
                    openUpload({ courseId: course.id, unitId: node.unit.id })
                  }
                  aria-label={`Upload material for Unit ${node.unit.number}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {open && (
                <div
                  id={panelId}
                  className="space-y-3 border-t border-border p-4"
                >
                  {node.unitMaterials.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        Unit-level
                      </p>
                      {node.unitMaterials.map((material) => (
                        <MaterialRow
                          key={material.id}
                          material={material}
                          onOpen={setSelected}
                        />
                      ))}
                    </div>
                  )}

                  {node.topics
                    .filter(
                      (entry) => !filtersActive || entry.materials.length > 0,
                    )
                    .map((entry) => (
                      // Keyed on course + topic: the same topic id exists in
                      // every course.
                      <div
                        key={topicKey(course.id, entry.topic.id)}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                            {entry.topic.name}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              openUpload({
                                courseId: course.id,
                                unitId: node.unit.id,
                                topicId: entry.topic.id,
                              })
                            }
                            aria-label={`Upload material for ${entry.topic.name}`}
                            className="shrink-0 rounded p-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {entry.materials.length > 0 ? (
                          entry.materials.map((material) => (
                            <MaterialRow
                              key={material.id}
                              material={material}
                              onOpen={setSelected}
                            />
                          ))
                        ) : (
                          <div className="rounded-lg border border-dashed border-border px-3 py-3 text-center">
                            <p className="text-[11px] text-ink-muted">
                              No materials yet
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() =>
                                openUpload({
                                  courseId: course.id,
                                  unitId: node.unit.id,
                                  topicId: entry.topic.id,
                                })
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Upload for this topic
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {selected && (
        <MaterialDetailPanel
          material={selected}
          pathLabel={labelFor(selected)}
          onClose={() => setSelected(null)}
          onToggleVisibility={(material) => {
            toggleVisibility(material);
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
