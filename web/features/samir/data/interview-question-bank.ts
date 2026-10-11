/**
 * Mock interview question bank.
 *
 * Questions are keyed by the AI service's canonical skill names (see ai/app/data/skills.json),
 * so the skills returned by /ai/skill-gap map straight onto questions here.
 * Each question lists the concepts a strong answer should touch; the evaluator
 * checks the transcript for any of a concept's terms.
 */

export type QuestionKind = "intro" | "technical" | "project" | "behavioral";
export type Difficulty = "easy" | "medium" | "hard";

export interface Concept {
  /** Shown to the student in feedback, e.g. "statelessness" */
  label: string;
  /** Any of these (lower-case) appearing in the answer counts as covering the concept */
  terms: string[];
}

export interface BankQuestion {
  id: string;
  kind: QuestionKind;
  skill?: string;
  difficulty: Difficulty;
  prompt: string;
  concepts: Concept[];
  /** Asked once if the first answer is too short */
  followUp?: string;
}

const c = (label: string, ...terms: string[]): Concept => ({ label, terms: [label.toLowerCase(), ...terms] });

export const TECHNICAL_BANK: Record<string, BankQuestion[]> = {
  python: [
    {
      id: "py-1", kind: "technical", skill: "Python", difficulty: "easy",
      prompt: "What is the difference between a list and a tuple in Python, and when would you use each?",
      concepts: [c("mutable", "mutability", "change"), c("immutable", "cannot be changed"), c("hashable", "dictionary key", "dict key"), c("performance", "faster", "memory")],
      followUp: "Can you give an example from your own code where you chose one over the other?",
    },
    {
      id: "py-2", kind: "technical", skill: "Python", difficulty: "medium",
      prompt: "Explain how decorators work in Python and describe a practical use case.",
      concepts: [c("function", "wraps"), c("higher-order", "takes a function", "returns a function"), c("logging", "timing", "authentication", "caching"), c("@ syntax", "at symbol", "@")],
      followUp: "How would you write a decorator that measures how long a function takes?",
    },
    {
      id: "py-3", kind: "technical", skill: "Python", difficulty: "hard",
      prompt: "How does the Global Interpreter Lock affect concurrency in Python, and how do you work around it?",
      concepts: [c("GIL", "global interpreter lock"), c("threads", "threading"), c("multiprocessing", "processes"), c("I/O bound", "io bound", "cpu bound"), c("asyncio", "async", "await")],
    },
  ],
  sql: [
    {
      id: "sql-1", kind: "technical", skill: "SQL", difficulty: "easy",
      prompt: "What is the difference between an INNER JOIN and a LEFT JOIN?",
      concepts: [c("matching rows", "both tables", "common"), c("all rows from the left", "left table", "all records"), c("null", "nulls")],
      followUp: "When would a LEFT JOIN be the right choice in a real report?",
    },
    {
      id: "sql-2", kind: "technical", skill: "SQL", difficulty: "medium",
      prompt: "How would you find and fix a slow SQL query?",
      concepts: [c("index", "indexes", "indexing"), c("explain", "query plan", "execution plan"), c("full table scan", "scan"), c("select only needed columns", "select *", "columns"), c("n+1", "joins")],
    },
    {
      id: "sql-3", kind: "technical", skill: "SQL", difficulty: "hard",
      prompt: "Explain transaction isolation levels and the problems they prevent.",
      concepts: [c("ACID", "atomic"), c("dirty read"), c("non-repeatable read", "repeatable read"), c("phantom", "serializable"), c("read committed")],
    },
  ],
  postgresql: [
    {
      id: "pg-1", kind: "technical", skill: "PostgreSQL", difficulty: "medium",
      prompt: "When would you add an index in PostgreSQL, and what does it cost you?",
      concepts: [c("faster reads", "lookup", "where clause", "search"), c("slower writes", "insert", "update"), c("storage", "disk", "space"), c("b-tree", "btree", "composite")],
    },
  ],
  "rest apis": [
    {
      id: "rest-1", kind: "technical", skill: "REST APIs", difficulty: "easy",
      prompt: "What makes an API RESTful? Walk me through the main HTTP methods.",
      concepts: [c("stateless", "statelessness"), c("resources", "resource", "endpoints"), c("GET", "get"), c("POST", "post"), c("PUT", "patch"), c("DELETE"), c("status codes", "200", "404")],
      followUp: "Which status code would you return when a resource is created, and why?",
    },
    {
      id: "rest-2", kind: "technical", skill: "REST APIs", difficulty: "medium",
      prompt: "How would you version and secure a public REST API?",
      concepts: [c("versioning", "/v1", "version"), c("authentication", "jwt", "oauth", "token", "api key"), c("rate limiting", "throttle"), c("https", "tls"), c("validation", "input")],
    },
  ],
  fastapi: [
    {
      id: "fa-1", kind: "technical", skill: "FastAPI", difficulty: "medium",
      prompt: "Why might you choose FastAPI for a backend, and how does it validate request data?",
      concepts: [c("pydantic", "models"), c("type hints", "types"), c("async", "asynchronous"), c("openapi", "swagger", "docs"), c("dependency injection", "depends")],
    },
  ],
  docker: [
    {
      id: "dk-1", kind: "technical", skill: "Docker", difficulty: "easy",
      prompt: "What is the difference between a Docker image and a container?",
      concepts: [c("image", "template", "blueprint"), c("container", "running instance", "instance"), c("layers", "layer"), c("Dockerfile")],
      followUp: "What would you put in a Dockerfile for a simple Python web app?",
    },
    {
      id: "dk-2", kind: "technical", skill: "Docker", difficulty: "medium",
      prompt: "How do you keep Docker images small and builds fast?",
      concepts: [c("multi-stage", "multi stage"), c("slim", "alpine", "base image"), c("layer caching", "cache"), c(".dockerignore", "dockerignore"), c("copy requirements first", "requirements")],
    },
  ],
  aws: [
    {
      id: "aws-1", kind: "technical", skill: "AWS", difficulty: "easy",
      prompt: "Which AWS services would you use to deploy a simple web application, and why?",
      concepts: [c("EC2", "ec2"), c("S3", "s3"), c("RDS", "database"), c("load balancer", "elb", "alb"), c("Lambda", "serverless"), c("IAM", "permissions")],
    },
  ],
  git: [
    {
      id: "git-1", kind: "technical", skill: "Git", difficulty: "easy",
      prompt: "What is the difference between git merge and git rebase?",
      concepts: [c("merge commit", "merge"), c("history", "linear"), c("rewrite", "rewrites history"), c("shared branches", "public branch", "team")],
    },
  ],
  "data structures & algorithms": [
    {
      id: "dsa-1", kind: "technical", skill: "Data Structures & Algorithms", difficulty: "easy",
      prompt: "When would you use a hash map instead of an array? What is the time complexity of lookups?",
      concepts: [c("key-value", "key value", "keys"), c("O(1)", "constant time", "o of one"), c("collision", "collisions"), c("O(n)", "linear")],
    },
    {
      id: "dsa-2", kind: "technical", skill: "Data Structures & Algorithms", difficulty: "medium",
      prompt: "How would you detect a cycle in a linked list?",
      concepts: [c("two pointers", "slow and fast", "fast and slow"), c("Floyd", "tortoise and hare"), c("O(1) space", "constant space"), c("hash set", "visited")],
    },
  ],
  react: [
    {
      id: "re-1", kind: "technical", skill: "React", difficulty: "medium",
      prompt: "Explain the difference between state and props in React, and when a component re-renders.",
      concepts: [c("props", "passed from parent"), c("state", "usestate"), c("immutable", "read-only"), c("re-render", "rerender", "render"), c("parent", "child")],
    },
  ],
  javascript: [
    {
      id: "js-1", kind: "technical", skill: "JavaScript", difficulty: "medium",
      prompt: "What is the event loop in JavaScript and how do promises fit into it?",
      concepts: [c("call stack", "stack"), c("callback queue", "task queue", "queue"), c("microtask", "microtasks"), c("non-blocking", "asynchronous", "async")],
    },
  ],
  java: [
    {
      id: "java-1", kind: "technical", skill: "Java", difficulty: "medium",
      prompt: "What is the difference between an abstract class and an interface in Java?",
      concepts: [c("multiple inheritance", "implement multiple"), c("abstract methods"), c("default methods", "default"), c("state", "fields", "constructor")],
    },
  ],
  linux: [
    {
      id: "lx-1", kind: "technical", skill: "Linux", difficulty: "easy",
      prompt: "How would you find which process is using the most memory on a Linux server and stop it?",
      concepts: [c("top", "htop"), c("ps"), c("kill", "pid"), c("free", "memory")],
    },
  ],
  networking: [
    {
      id: "net-1", kind: "technical", skill: "Networking", difficulty: "medium",
      prompt: "What happens, step by step, when you type a URL into a browser and press Enter?",
      concepts: [c("DNS"), c("TCP", "handshake"), c("TLS", "https", "ssl"), c("HTTP request", "request"), c("render", "html")],
    },
  ],
  pandas: [
    {
      id: "pd-1", kind: "technical", skill: "Pandas", difficulty: "easy",
      prompt: "How would you clean a dataset with missing values and duplicates in pandas?",
      concepts: [c("isnull", "isna", "missing"), c("fillna", "impute"), c("dropna", "drop"), c("drop_duplicates", "duplicates")],
    },
  ],
  "machine learning": [
    {
      id: "ml-1", kind: "technical", skill: "Machine Learning", difficulty: "medium",
      prompt: "What is overfitting and how do you prevent it?",
      concepts: [c("training data", "memorize"), c("validation", "test set"), c("regularization", "l1", "l2", "dropout"), c("cross-validation", "cross validation"), c("more data", "simpler model")],
    },
  ],
  mongodb: [
    {
      id: "mg-1", kind: "technical", skill: "MongoDB", difficulty: "medium",
      prompt: "When would you choose MongoDB over a relational database?",
      concepts: [c("schema", "flexible schema", "schemaless"), c("documents", "json"), c("horizontal scaling", "sharding"), c("joins", "relations", "transactions")],
    },
  ],
  "node.js": [
    {
      id: "node-1", kind: "technical", skill: "Node.js", difficulty: "medium",
      prompt: "Why is Node.js good for I/O-heavy servers but weaker for CPU-heavy work?",
      concepts: [c("single-threaded", "single thread"), c("event loop"), c("non-blocking", "asynchronous"), c("worker threads", "workers")],
    },
  ],
  cybersecurity: [
    {
      id: "sec-1", kind: "technical", skill: "Cybersecurity", difficulty: "medium",
      prompt: "How would you protect a web application from SQL injection and XSS?",
      concepts: [c("parameterized queries", "prepared statements", "orm"), c("input validation", "sanitize", "sanitization"), c("escape", "encoding"), c("content security policy", "csp")],
    },
  ],
};

export function genericTechnicalQuestion(skill: string): BankQuestion {
  return {
    id: `gen-${skill.toLowerCase().replace(/\W+/g, "-")}`,
    kind: "technical",
    skill,
    difficulty: "easy",
    prompt: `Explain what ${skill} is used for, and describe a time you used it or how you would start learning it.`,
    concepts: [
      c(skill.toLowerCase()),
      c("use case", "used for", "example"),
      c("project", "built", "practice"),
    ],
    followUp: `What is one concept in ${skill} you find hardest, and how would you get better at it?`,
  };
}

export const INTRO_QUESTION = (role: string): BankQuestion => ({
  id: "intro-1",
  kind: "intro",
  difficulty: "easy",
  prompt: `Let's start. Tell me about yourself and why you're interested in a ${role} role.`,
  concepts: [
    c("education", "student", "studying", "degree", "b.tech", "year"),
    c("skills", "experience", "worked with"),
    c("project", "built", "internship"),
    c("motivation", "interested", "passion", "enjoy", "want to"),
  ],
});

export const PROJECT_QUESTION = (title: string, tech: string[]): BankQuestion => ({
  id: "project-1",
  kind: "project",
  difficulty: "medium",
  prompt: `Walk me through your project "${title}". What was your role, why did you choose ${
    tech.slice(0, 3).join(", ") || "that stack"
  }, and what was the hardest problem you solved?`,
  concepts: [
    c("my role", "i was responsible", "i built", "i designed", "i led"),
    ...tech.slice(0, 3).map((t) => c(t.toLowerCase())),
    c("challenge", "problem", "difficult", "hardest", "issue"),
    c("result", "outcome", "improved", "reduced", "users", "%"),
  ],
  followUp: "If you rebuilt it today, what would you do differently?",
});

const STAR: Concept[] = [
  c("situation", "when", "during", "at the time"),
  c("task", "goal", "needed to", "responsible"),
  c("action", "i decided", "i did", "i took", "so i"),
  c("result", "as a result", "outcome", "in the end", "learned"),
];

export const BEHAVIORAL_BANK: BankQuestion[] = [
  {
    id: "beh-1", kind: "behavioral", difficulty: "medium",
    prompt: "Tell me about a time you disagreed with a teammate. How did you handle it?",
    concepts: STAR,
    followUp: "What did you learn from that situation?",
  },
  {
    id: "beh-2", kind: "behavioral", difficulty: "medium",
    prompt: "Describe a time you had to learn something new quickly to meet a deadline.",
    concepts: STAR,
    followUp: "How do you usually approach learning an unfamiliar technology?",
  },
  {
    id: "beh-3", kind: "behavioral", difficulty: "medium",
    prompt: "Tell me about a mistake you made on a project and what you did about it.",
    concepts: STAR,
  },
];

export const CLOSING_QUESTION: BankQuestion = {
  id: "close-1",
  kind: "behavioral",
  difficulty: "easy",
  prompt: "Where do you see yourself in two years, and how does this role help you get there?",
  concepts: [c("growth", "grow", "learn"), c("goal", "aim", "want to become"), c("this role", "this team", "company")],
};

// AI service canonical names (ai/app/data/skills.json) that map onto a bank entry with a different key.
const SKILL_ALIASES: Record<string, string> = {
  "data structures and algorithms": "data structures & algorithms",
  "data structures": "data structures & algorithms",
  algorithms: "data structures & algorithms",
  dsa: "data structures & algorithms",
  "rest api": "rest apis",
  "computer networks": "networking",
  "tcp/ip": "networking",
  "linux administration": "linux",
  "amazon ec2": "aws",
  "amazon s3": "aws",
  "aws lambda": "aws",
  nodejs: "node.js",
  "docker compose": "docker",
  mysql: "sql",
  "sql server": "sql",
  "application security": "cybersecurity",
};

export function questionsForSkill(skill: string): BankQuestion[] {
  const key = skill.trim().toLowerCase();
  return TECHNICAL_BANK[SKILL_ALIASES[key] ?? key] ?? [genericTechnicalQuestion(skill)];
}
