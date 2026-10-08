import { FolderOpen } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import {
  getMaterialCourses,
  getMaterials,
  getMaterialsOverview,
  getMaterialsUploader,
} from "@/lib/api/faculty-materials";
import {
  MaterialsLibraryClient,
  type CourseFacts,
} from "@/components/faculty/materials/MaterialsLibraryClient";
import { buildCourseOptions } from "./course-options";

export default async function FacultyMaterialsPage() {
  const [courses, overview, materials, courseOptions, uploadedBy] =
    await Promise.all([
      getMaterialCourses(),
      getMaterialsOverview(),
      getMaterials(),
      buildCourseOptions(),
      getMaterialsUploader(),
    ]);

  // Unit and topic counts cannot change from the browser, so they come from
  // the server summary. Everything that a local upload does move — material
  // counts, coverage, views — is recomputed in the client from the merged list.
  const courseFacts: CourseFacts[] = courses.map((course) => ({
    id: course.id,
    code: course.code,
    name: course.name,
    unitCount: course.unitCount,
    topicCount: course.topicCount,
  }));

  return (
    <DashboardShell title="Course Materials">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Course Materials" },
        ]}
      />

      <Card className="p-6">
        <div className="flex items-center gap-2.5">
          <FolderOpen className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold text-ink">Course Materials</h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Upload and organise materials by course, unit and topic.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          The {overview.totalMaterials} materials below are the committed set.
          Anything you upload here is saved in this browser only — no file
          leaves your machine, and it will not follow you to another device.
        </p>
      </Card>

      <MaterialsLibraryClient
        courseFacts={courseFacts}
        serverMaterials={materials}
        courseOptions={courseOptions}
        uploadedBy={uploadedBy}
      />
    </DashboardShell>
  );
}
