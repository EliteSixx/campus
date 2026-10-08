export interface SkillSyllabus {
  skillId: string;
  topics: string[];
}

export const skillSyllabi: SkillSyllabus[] = [
  {
    skillId: "python",
    topics: [
      "Syntax, data types and control flow",
      "Functions, modules and packages",
      "File handling and exceptions",
      "OOP in Python",
      "Standard library and virtual environments",
      "Testing with pytest",
    ],
  },
  {
    skillId: "java",
    topics: [
      "Syntax and OOP fundamentals",
      "Collections framework",
      "Exception handling",
      "Streams and lambdas",
      "Concurrency basics",
      "Build tools and packaging",
    ],
  },
  {
    skillId: "dsa",
    topics: [
      "Arrays, strings and complexity analysis",
      "Linked lists, stacks and queues",
      "Trees and binary search trees",
      "Hashing and heaps",
      "Graphs and traversals",
      "Dynamic programming",
    ],
  },
  {
    skillId: "react",
    topics: [
      "JSX and component basics",
      "Props, state and events",
      "Hooks: useState and useEffect",
      "Lists, keys and conditional rendering",
      "Context and state management",
      "Performance and memoisation",
    ],
  },
  {
    skillId: "nodejs",
    topics: [
      "Node runtime and modules",
      "Express routing and middleware",
      "Async patterns and promises",
      "Working with databases",
      "Authentication and sessions",
      "Error handling and logging",
    ],
  },
  {
    skillId: "rest-apis",
    topics: [
      "HTTP methods and status codes",
      "Resource design and URL structure",
      "Request validation",
      "Authentication tokens",
      "Pagination and filtering",
      "Versioning and documentation",
    ],
  },
  {
    skillId: "typescript",
    topics: [
      "Basic types and inference",
      "Interfaces and type aliases",
      "Generics",
      "Union and narrowing",
      "Utility types",
      "Configuring tsconfig",
    ],
  },
  {
    skillId: "nextjs",
    topics: [
      "App Router and file-based routing",
      "Server and client components",
      "Data fetching patterns",
      "Layouts and metadata",
      "API routes",
      "Deployment",
    ],
  },
  {
    skillId: "html-css",
    topics: [
      "Semantic HTML",
      "CSS box model and selectors",
      "Flexbox",
      "Grid",
      "Responsive design and media queries",
      "Accessibility basics",
    ],
  },
  {
    skillId: "sql",
    topics: [
      "SELECT, WHERE and ORDER BY",
      "Joins",
      "Aggregation and GROUP BY",
      "Subqueries",
      "Indexes and query plans",
      "Transactions",
    ],
  },
  {
    skillId: "postgresql",
    topics: [
      "Installation and psql basics",
      "Schema design and constraints",
      "Indexing strategies",
      "Query optimisation and EXPLAIN",
      "Backup and restore",
      "Extensions",
    ],
  },
  {
    skillId: "mongodb",
    topics: [
      "Documents and collections",
      "CRUD operations",
      "Aggregation pipeline",
      "Indexing in MongoDB",
      "Schema design patterns",
      "Replication basics",
    ],
  },
  {
    skillId: "redis",
    topics: [
      "Key-value basics",
      "Data structures in Redis",
      "Caching strategies",
      "Expiry and eviction",
      "Pub/sub",
      "Persistence options",
    ],
  },
  {
    skillId: "docker",
    topics: [
      "Images and containers",
      "Writing a Dockerfile",
      "Volumes and networking",
      "Docker Compose",
      "Multi-stage builds",
      "Registry and image hygiene",
    ],
  },
  {
    skillId: "kubernetes",
    topics: [
      "Pods and deployments",
      "Services and networking",
      "ConfigMaps and secrets",
      "Scaling and rollouts",
      "Persistent volumes",
      "Troubleshooting workloads",
    ],
  },
  {
    skillId: "aws",
    topics: [
      "IAM and account basics",
      "EC2 and networking",
      "S3 and storage classes",
      "RDS and managed databases",
      "Lambda and serverless",
      "Cost and monitoring",
    ],
  },
  {
    skillId: "cloud-computing",
    topics: [
      "Service models: IaaS, PaaS, SaaS",
      "Virtualisation fundamentals",
      "Scaling and load balancing",
      "Cloud storage models",
      "Availability and fault tolerance",
      "Cloud security basics",
    ],
  },
  {
    skillId: "ci-cd",
    topics: [
      "Version control workflows",
      "Build pipelines",
      "Automated testing in CI",
      "Artifact management",
      "Deployment strategies",
      "Pipeline monitoring",
    ],
  },
  {
    skillId: "linux",
    topics: [
      "Shell and filesystem navigation",
      "Permissions and users",
      "Processes and signals",
      "Package management",
      "Shell scripting",
      "Systemd and services",
    ],
  },
  {
    skillId: "networking",
    topics: [
      "OSI and TCP/IP models",
      "IP addressing and subnetting",
      "Routing fundamentals",
      "TCP vs UDP",
      "DNS and HTTP",
      "Network troubleshooting tools",
    ],
  },
  {
    skillId: "cybersecurity",
    topics: [
      "CIA triad and threat models",
      "Authentication and access control",
      "Common web vulnerabilities",
      "Network attacks and defences",
      "Secure coding practices",
      "Incident response basics",
    ],
  },
  {
    skillId: "pen-testing",
    topics: [
      "Reconnaissance",
      "Scanning and enumeration",
      "Exploitation basics",
      "Privilege escalation",
      "Reporting findings",
      "Legal and ethical boundaries",
    ],
  },
  {
    skillId: "cryptography",
    topics: [
      "Symmetric encryption",
      "Asymmetric encryption",
      "Hashing and integrity",
      "Digital signatures",
      "TLS and certificates",
      "Key management",
    ],
  },
  {
    skillId: "git",
    topics: [
      "Repositories, commits and branches",
      "Merging and rebasing",
      "Remote workflows",
      "Resolving conflicts",
      "Pull requests and review",
      "Tags and releases",
    ],
  },
  {
    skillId: "problem-solving",
    topics: [
      "Breaking down problems",
      "Pattern recognition",
      "Complexity trade-offs",
      "Debugging methodically",
      "Edge case analysis",
      "Communicating a solution",
    ],
  },
  {
    skillId: "fastapi",
    topics: [
      "Routing and path operations",
      "Pydantic models",
      "Dependency injection",
      "Async endpoints",
      "Auth and middleware",
      "Automatic docs and testing",
    ],
  },
  {
    skillId: "cpp",
    topics: [
      "Syntax and memory model",
      "Pointers and references",
      "Classes and RAII",
      "STL containers",
      "Templates",
      "Modern C++ features",
    ],
  },
  {
    skillId: "go",
    topics: [
      "Syntax and types",
      "Goroutines and channels",
      "Interfaces",
      "Error handling",
      "Standard library",
      "Modules and testing",
    ],
  },
  {
    skillId: "communication",
    topics: [
      "Structuring a message",
      "Written clarity",
      "Presenting to a group",
      "Active listening",
      "Giving and taking feedback",
      "Stakeholder updates",
    ],
  },
  {
    skillId: "teamwork",
    topics: [
      "Working agreements",
      "Task ownership",
      "Constructive disagreement",
      "Code review etiquette",
      "Cross-functional collaboration",
      "Handling blockers",
    ],
  },
  {
    skillId: "project-management",
    topics: [
      "Scoping and requirements",
      "Estimation",
      "Task breakdown and tracking",
      "Risk management",
      "Stakeholder communication",
      "Retrospectives",
    ],
  },
];

export function getSkillSyllabus(skillId: string) {
  return skillSyllabi.find((s) => s.skillId === skillId);
}
export function topicsCovered(score: number, total: number): number {
  return Math.max(0, Math.min(total, Math.floor((score / 100) * total)));
}
