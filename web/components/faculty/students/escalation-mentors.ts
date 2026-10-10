// DEMO DATA. The four mentors below are made up for the hackathon demo. They
// are not real people and are not read from any service or from web/data/demo.
// Replace this list with the real mentor directory when one exists.

export interface DemoMentor {
  mentor_id: string;
  name: string;
  department: string;
  is_synthetic: true;
}

export const DEMO_MENTORS: DemoMentor[] = [
  { mentor_id: "MN001", name: "Dr. Ananya Mohanty", department: "CSE", is_synthetic: true },
  { mentor_id: "MN002", name: "Prof. Rakesh Sahoo", department: "ECE", is_synthetic: true },
  { mentor_id: "MN003", name: "Dr. Priyanka Das", department: "ME", is_synthetic: true },
  { mentor_id: "MN004", name: "Prof. Sourav Patnaik", department: "Training and Placement", is_synthetic: true },
];
