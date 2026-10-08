import { getCourseMaterialTree, getMaterialCourses } from "@/lib/api/faculty-materials";
import type { CourseOption } from "@/components/faculty/materials/utils";

// The plain course → unit → topic structure the upload panel's selects need,
// flattened on the server so the client never touches a data module.
//
// Built from getCourseMaterialTree, which already resolves topic names and
// keeps units in teaching order and topics in curriculum order.
export async function buildCourseOptions(): Promise<CourseOption[]> {
  const courses = await getMaterialCourses();

  const trees = await Promise.all(
    courses.map((course) => getCourseMaterialTree(course.id)),
  );

  return trees.flatMap((tree) => {
    if (!tree) return [];
    return [
      {
        id: tree.course.id,
        code: tree.course.code,
        name: tree.course.name,
        units: tree.units.map((node) => ({
          id: node.unit.id,
          number: node.unit.number,
          title: node.unit.title,
          topics: node.topics.map((topic) => ({
            id: topic.topicId,
            name: topic.topicName,
          })),
        })),
      },
    ];
  });
}
