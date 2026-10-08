import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import {
  getCourseMaterialTree,
  getMaterials,
  getMaterialsUploader,
} from "@/lib/api/faculty-materials";
import { CourseTreeClient } from "@/components/faculty/materials/CourseTreeClient";
import type { UnitOption } from "@/components/faculty/materials/utils";
import { buildCourseOptions } from "../course-options";

export default async function FacultyCourseMaterialsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const tree = await getCourseMaterialTree(courseId);
  if (!tree) notFound();

  const [materials, courseOptions, uploadedBy] = await Promise.all([
    getMaterials({ courseId }),
    buildCourseOptions(),
    getMaterialsUploader(),
  ]);

  // Only the structure is taken from the tree. The materials go down flat and
  // the client regroups them, so an upload made in this browser lands in the
  // right unit and topic instead of being stuck outside the server's tree.
  const units: UnitOption[] = tree.units.map((node) => ({
    id: node.unit.id,
    number: node.unit.number,
    title: node.unit.title,
    topics: node.topics.map((topic) => ({
      id: topic.topicId,
      name: topic.topicName,
    })),
  }));

  return (
    <DashboardShell title="Course Materials">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Course Materials", href: "/faculty/materials" },
          { label: `${tree.course.code} ${tree.course.name}` },
        ]}
      />

      <CourseTreeClient
        course={{
          id: tree.course.id,
          code: tree.course.code,
          name: tree.course.name,
        }}
        units={units}
        serverMaterials={materials}
        courseOptions={courseOptions}
        uploadedBy={uploadedBy}
      />
    </DashboardShell>
  );
}
