/**
 * Career Intelligence Dataset
 * Strictly scoped within features/samir
 *
 * Dataset containing 10 major technology companies, the general student skill map,
 * and comprehensive preparation metadata.
 */

export interface TechCompany {
  id: string;
  name: string;
  ticker?: string;
  tagline: string;
  accentColor: string;
  industry: string[];
  majorProducts: string[];
  commonRoles: string[];
  importantSkills: string[];
  programmingLanguages: string[];
  cloudRequirements: string[];
  aiMlRequirements: string[];
  interviewDifficulty: "Medium" | "Medium-High" | "High" | "Very High";
  workStyle: string;
  howEmployeesWork: string;
  hiringFocus: string;
  bestPreparation: string;
  entryLevelOpportunities: string;
  careerGrowth: string;
  learningOpportunities: string;
  typicalProjectTypes: string[];
  recommendedStudentPrep: string[];
  interviewTopics: {
    coding: string[];
    systemDesign: string[];
    behavioral: string[];
  };
  sampleProjects: {
    title: string;
    description: string;
    skillsTargeted: string[];
  }[];
}

export interface StudentSkillCategory {
  category: string;
  iconName: string;
  description: string;
  skills: {
    name: string;
    importance: "Essential" | "High" | "Valuable";
    whyItMatters: string;
  }[];
}

export interface PreparationRoadmap {
  duration: "3-Month" | "6-Month" | "12-Month";
  focus: string;
  milestones: {
    phase: string;
    weeks: string;
    goals: string[];
    deliverables: string[];
  }[];
}

export const DISCLAIMER_TEXT =
  "IMPORTANT: Do NOT represent these skill lists as official mandatory requirements for every job at these companies. Requirements vary significantly by role, seniority level, country, business unit, and team.";

export const TECH_COMPANIES: TechCompany[] = [
  {
    id: "google",
    name: "Google",
    ticker: "GOOGL",
    tagline: "Organizing the world's information and making it universally accessible",
    accentColor: "#4285F4",
    industry: ["Technology", "Search", "Cloud", "Artificial Intelligence", "Consumer Hardware"],
    majorProducts: ["Google Search", "YouTube", "Android", "Google Cloud (GCP)", "Gemini", "Google Maps", "Chrome"],
    commonRoles: [
      "Software Engineer (SWE)",
      "Data Scientist",
      "Machine Learning Engineer",
      "Cloud Engineer",
      "Product Manager (APM)",
      "UX Designer",
      "Security Engineer",
      "Site Reliability Engineer (SRE)"
    ],
    importantSkills: [
      "Data Structures and Algorithms",
      "Python",
      "Java",
      "C++",
      "JavaScript",
      "Machine Learning and AI",
      "SQL",
      "System Design",
      "Cloud Computing",
      "Problem Solving",
      "Communication"
    ],
    programmingLanguages: ["C++", "Java", "Python", "Go", "JavaScript/TypeScript"],
    cloudRequirements: ["Google Cloud Platform (GCP)", "Kubernetes (Borg/K8s)", "BigQuery", "Distributed Storage"],
    aiMlRequirements: ["Gemini APIs", "TensorFlow / PyTorch", "Large Language Models", "Model Optimization"],
    interviewDifficulty: "Very High",
    workStyle:
      "Cross-functional teams operating at planetary scale. Engineers collaborate with Product Managers, UX Designers, and Data Scientists, writing clean, tested, peer-reviewed code with high reliability standards.",
    howEmployeesWork:
      "Google generally operates through cross-functional teams. Engineers work on large-scale products, write and review code, analyze data, conduct design discussions, test systems, and collaborate with product managers and designers.",
    hiringFocus:
      "Strong problem solving, algorithms, coding, system design, technical depth and communication (Googleyness & leadership).",
    bestPreparation:
      "DSA + one strong programming language + projects + CS fundamentals + system design basics.",
    entryLevelOpportunities:
      "Google STEP Internship (1st/2nd years), Summer SWE Internship (penultimate year), and Campus New Grad Software Engineer roles.",
    careerGrowth:
      "Structured engineering ladder (L3 Entry to L8+ Principal), strong internal mobility across Search, Cloud, YouTube, and DeepMind.",
    learningOpportunities:
      "Access to Google's internal code search, engineering whitepapers, tech talks, and 20% project culture.",
    typicalProjectTypes: [
      "Distributed cache or key-value store with consensus algorithm",
      "Real-time indexing and search retrieval engine",
      "Multi-modal AI inference pipeline with latency telemetry",
      "Scalable REST/gRPC microservice with Kubernetes orchestration"
    ],
    recommendedStudentPrep: [
      "Solve 200+ DSA problems focusing on graphs, dynamic programming, and heaps",
      "Master one language (C++, Java, or Python) deeply including memory and concurrency",
      "Build a project demonstrating distributed storage or API concurrency",
      "Practice STAR-format behavioral responses emphasizing humble collaboration"
    ],
    interviewTopics: {
      coding: ["Graph algorithms (BFS/DFS, Topological Sort)", "Dynamic Programming", "Trie & Prefix trees", "Sliding Window / Two Pointers"],
      systemDesign: ["Scalable web crawlers", "YouTube video streaming architecture", "Distributed rate limiters", "Global key-value stores"],
      behavioral: ["Googleyness & culture fit", "Navigating ambiguity", "Peer collaboration and handling constructive critique"]
    },
    sampleProjects: [
      {
        title: "Mini-Search Engine with PageRank & TF-IDF",
        description: "A multithreaded web crawler and inverted index search engine that calculates document relevance scores.",
        skillsTargeted: ["Python/C++", "DSA", "Distributed Systems", "Concurrency"]
      },
      {
        title: "Distributed Rate Limiter & Token Bucket Service",
        description: "A gRPC microservice using Redis and Raft consensus to enforce sliding window rate limits across multi-region nodes.",
        skillsTargeted: ["Go/Java", "System Design", "Cloud", "GCP"]
      }
    ]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    ticker: "MSFT",
    tagline: "Empowering every person and organization on the planet to achieve more",
    accentColor: "#00A4EF",
    industry: ["Software", "Cloud", "Artificial Intelligence", "Gaming", "Productivity"],
    majorProducts: ["Windows", "Microsoft 365", "Azure", "GitHub", "Xbox", "Copilot", "LinkedIn"],
    commonRoles: [
      "Software Engineer",
      "Cloud Engineer",
      "AI Engineer",
      "Data Scientist",
      "Product Manager",
      "Security Engineer",
      "Hardware Engineer"
    ],
    importantSkills: [
      "C++",
      "C#",
      "Java",
      "Python",
      "Data Structures and Algorithms",
      "Azure",
      "Cloud Computing",
      "AI/ML",
      "Databases",
      "System Design",
      "Communication"
    ],
    programmingLanguages: ["C#", "C++", "TypeScript", "Python", "Java"],
    cloudRequirements: ["Microsoft Azure", "Azure DevOps / GitHub Actions", "Cosmos DB", "Serverless Functions"],
    aiMlRequirements: ["Azure OpenAI Service", "Copilot extensions", "RAG architectures", "PyTorch"],
    interviewDifficulty: "High",
    workStyle:
      "Collaborative engineering pods partnering developers, product managers, designers, and researchers with an emphasis on growth mindset and customer empathy.",
    howEmployeesWork:
      "Employees commonly work in engineering teams with developers, product managers, designers and researchers. Work involves planning features, coding, code reviews, testing, debugging, deployment and continuous improvement.",
    hiringFocus:
      "Coding ability, computer science fundamentals, problem solving, engineering judgment and teamwork.",
    bestPreparation:
      "DSA + OOP + databases + cloud fundamentals + software projects.",
    entryLevelOpportunities:
      "Explore Microsoft Internship (freshmen/sophomores), Summer University Internships, and Aspire New Grad Program.",
    careerGrowth:
      "Dual career track for individual contributors (up to Technical Fellow) and engineering management.",
    learningOpportunities:
      "Enterprise hackathons (global Microsoft //oneweek hackathon), Microsoft Learn certifications, open source contributions on GitHub.",
    typicalProjectTypes: [
      "Enterprise cloud web applications with role-based access control",
      "Generative AI Copilot extension with semantic search retrieval",
      "Cross-platform desktop application using .NET or Electron/TypeScript",
      "Automated CI/CD deployment pipeline with telemetry dashboard"
    ],
    recommendedStudentPrep: [
      "Deep understanding of Object-Oriented Design and SOLID principles",
      "Proficiency in C#/.NET or modern C++ or TypeScript/Node.js",
      "Deploy a full-stack project to Azure using CI/CD pipelines",
      "Practice clean coding with unit tests and modular architecture"
    ],
    interviewTopics: {
      coding: ["Binary Trees & Graphs", "String manipulation & Parsing", "Object-Oriented Design (Design Patterns)", "Linked Lists & Queues"],
      systemDesign: ["Cloud collaboration suite (like Google Docs/Word Online)", "Notification dispatch microservice", "Relational + NoSQL hybrid database architecture"],
      behavioral: ["Growth Mindset demonstrations", "Overcoming project roadblocks", "Teamwork across multidisciplinary colleagues"]
    },
    sampleProjects: [
      {
        title: "Enterprise Document Collaboration Suite",
        description: "Real-time collaborative markdown/document editor using WebSockets, Azure Cosmos DB, and JWT authentication.",
        skillsTargeted: ["C# / TypeScript", "Azure", "Databases", "OOP"]
      },
      {
        title: "AI Knowledge Base with Vector Search (Copilot Integration)",
        description: "RAG pipeline that ingests technical PDFs, generates vector embeddings, and answers queries using OpenAI/Azure models.",
        skillsTargeted: ["Python", "Azure OpenAI", "Vector DB", "System Design"]
      }
    ]
  },
  {
    id: "amazon",
    name: "Amazon",
    ticker: "AMZN",
    tagline: "Earth's most customer-centric company",
    accentColor: "#FF9900",
    industry: ["E-commerce", "Cloud Computing", "Technology", "Logistics", "Streaming"],
    majorProducts: ["Amazon Marketplace", "AWS (Amazon Web Services)", "Alexa", "Prime Video", "Logistics & Fulfillment", "Kindle"],
    commonRoles: [
      "Software Development Engineer (SDE I/II)",
      "Cloud Support Engineer",
      "Data Engineer",
      "Machine Learning Engineer",
      "Solutions Architect",
      "Technical Product Manager"
    ],
    importantSkills: [
      "Java",
      "Python",
      "C++",
      "DSA",
      "SQL",
      "AWS",
      "Distributed Systems",
      "Cloud Computing",
      "Data Engineering",
      "Problem Solving"
    ],
    programmingLanguages: ["Java", "Python", "C++", "Go", "SQL"],
    cloudRequirements: ["AWS (EC2, S3, Lambda, DynamoDB, SQS/SNS, ECS/EKS)", "CloudFormation / CDK"],
    aiMlRequirements: ["Amazon SageMaker", "Bedrock", "Predictive Demand Modeling", "NLP"],
    interviewDifficulty: "High",
    workStyle:
      "Two-Pizza teams with high ownership, operational rigor, high bar for availability, and decisions guided by 16 Leadership Principles.",
    howEmployeesWork:
      "Teams work on highly scalable systems and customer-focused products. Employees are expected to take ownership of problems, analyze data, build solutions, test them and measure their impact.",
    hiringFocus:
      "Coding, DSA, system design, technical fundamentals and behavioral/leadership skills (Ownership, Customer Obsession, Bias for Action).",
    bestPreparation:
      "DSA + Java/Python + SQL + AWS + scalable project development.",
    entryLevelOpportunities:
      "Amazon SDE Internships (Summer & 6-month Off-Campus), Amazon WOW (women in tech), and Campus SDE-1 placement drives.",
    careerGrowth:
      "Fast-paced meritocracy with clear metrics for SDE I to SDE II to Principal Engineer promotions.",
    learningOpportunities:
      "AWS internal certifications, deep architectural review bars, internal knowledge transfers.",
    typicalProjectTypes: [
      "High-throughput event-driven order processing engine with queuing",
      "Distributed inventory tracker with ACID vs eventual consistency guarantees",
      "Serverless REST API pipeline using AWS Lambda and DynamoDB",
      "Data analytics pipeline processing millions of clickstream logs"
    ],
    recommendedStudentPrep: [
      "Strong Java or Python fundamentals with OOP and design patterns",
      "Prepare 10+ behavioral STAR stories directly mapped to Amazon Leadership Principles",
      "Learn asynchronous messaging (SQS, Kafka) and caching (Redis)",
      "Practice timed LeetCode Medium problem solving"
    ],
    interviewTopics: {
      coding: ["Arrays & Hash Maps", "Binary Trees & BSTs", "Dynamic Programming", "Heap / Priority Queues"],
      systemDesign: ["Scalable e-commerce cart & checkout", "Flash sale ticket booking system", "Distributed logging & metric ingestion"],
      behavioral: ["Customer Obsession", "Ownership", "Invent & Simplify", "Deliver Results"]
    },
    sampleProjects: [
      {
        title: "High-Throughput E-Commerce Order Orchestrator",
        description: "Asynchronous microservice utilizing message queues (RabbitMQ/SQS), Redis cache, and Postgres to process peak spikes.",
        skillsTargeted: ["Java/Spring Boot", "AWS", "SQL", "Distributed Systems"]
      },
      {
        title: "Serverless Event Analytics Pipeline",
        description: "Event-driven telemetry ingestion using AWS Lambda, S3, and DynamoDB with automated schema validation.",
        skillsTargeted: ["Python", "AWS", "Cloud Computing", "Data Engineering"]
      }
    ]
  },
  {
    id: "meta",
    name: "Meta",
    ticker: "META",
    tagline: "Giving people the power to build community and bring the world closer together",
    accentColor: "#0668E1",
    industry: ["Social Media", "Artificial Intelligence", "Virtual Reality", "Digital Advertising"],
    majorProducts: ["Facebook", "Instagram", "WhatsApp", "Messenger", "Reality Labs (Quest)", "Llama Foundation Models", "Threads"],
    commonRoles: [
      "Software Engineer",
      "Machine Learning Engineer",
      "Data Scientist",
      "Product Manager",
      "Research Scientist (FAIR)",
      "Security Engineer"
    ],
    importantSkills: [
      "Python",
      "C++",
      "Java",
      "DSA",
      "Machine Learning",
      "Distributed Systems",
      "SQL",
      "System Design",
      "Data Analysis",
      "Communication"
    ],
    programmingLanguages: ["C++", "Python", "Rust", "Hack / PHP", "JavaScript / React"],
    cloudRequirements: ["Custom Meta Infrastructure (Bonsai, Tupperware)", "Large-scale edge caching", "PyTorch infrastructure"],
    aiMlRequirements: ["PyTorch Core", "Llama Fine-Tuning", "Recommendation Systems", "Computer Vision"],
    interviewDifficulty: "Very High",
    workStyle:
      "Move fast and build with impact. High developer autonomy, rapid A/B testing, data-informed experimentation, and continuous deployment.",
    howEmployeesWork:
      "Teams typically work in fast-moving product environments. Engineers collaborate closely with product and research teams and focus heavily on experimentation, performance, reliability and user impact.",
    hiringFocus:
      "Strong coding, algorithms, system design, technical depth and ability to solve ambiguous problems.",
    bestPreparation:
      "Advanced DSA + system design + ML fundamentals + strong projects.",
    entryLevelOpportunities:
      "Meta University (freshman/sophomore tech immersion), Meta SWE Summer Internships, and New Grad Rotational SWE roles.",
    careerGrowth:
      "Engineering-driven organization with high internal mobility, Bootcamp engineering onboarding, and rapid progression based on impact.",
    learningOpportunities:
      "FAIR (Fundamental AI Research) papers, open source culture (React, PyTorch, Llama), internal hackathons.",
    typicalProjectTypes: [
      "Personalized recommendation feed algorithm with vector embeddings",
      "Real-time chat and video communication server using WebRTC and WebSockets",
      "High-concurrency distributed graph database query engine",
      "Scalable image/media optimization pipeline with edge caching"
    ],
    recommendedStudentPrep: [
      "Solve LeetCode Medium/Hard problems under strict 20-minute speed limits",
      "Master distributed system concepts: Sharding, Consistent Hashing, Replication",
      "Build full-stack applications with React and high-performance backend APIs",
      "Demonstrate ability to scope ambiguous problems and prioritize trade-offs"
    ],
    interviewTopics: {
      coding: ["Graph algorithms (Shortest Path, Connected Components)", "Intervals & Matrix traversals", "Binary Search variations", "Bit manipulation & Math"],
      systemDesign: ["Instagram Feed with ranking", "WhatsApp message delivery & encryption", "Distributed live commenting system", "Newsfeed cache invalidation"],
      behavioral: ["Driving impact autonomously", "Resolving technical disagreements", "Debugging production outages under pressure"]
    },
    sampleProjects: [
      {
        title: "Real-Time Social Graph & Activity Feed Engine",
        description: "Graph-based feed ranking system calculating friend affinity scores and caching dynamic newsfeeds with Redis and Neo4j.",
        skillsTargeted: ["C++ / Python", "DSA", "Distributed Systems", "SQL"]
      },
      {
        title: "Distributed Peer-to-Peer Chat Engine",
        description: "End-to-end encrypted messaging service with offline message queuing, WebSockets, and distributed pub/sub architecture.",
        skillsTargeted: ["Python / React", "System Design", "Networking", "Security"]
      }
    ]
  },
  {
    id: "apple",
    name: "Apple",
    ticker: "AAPL",
    tagline: "Think Different — designing products at the intersection of technology and the liberal arts",
    accentColor: "#A2AAAD",
    industry: ["Consumer Electronics", "Software", "Hardware", "Digital Services", "Semiconductors"],
    majorProducts: ["iPhone", "Mac & Apple Silicon (M-series)", "iPad", "Apple Watch", "iOS / macOS / visionOS", "Apple Services (Music, iCloud, Pay)"],
    commonRoles: [
      "Software Engineer",
      "iOS Developer",
      "Hardware Engineer",
      "Embedded Systems Engineer",
      "Machine Learning Engineer (CoreML)",
      "Product Designer"
    ],
    importantSkills: [
      "Swift",
      "Objective-C",
      "C/C++",
      "iOS development",
      "Embedded systems",
      "Hardware fundamentals",
      "Algorithms",
      "UI/UX",
      "Problem Solving"
    ],
    programmingLanguages: ["Swift", "C", "C++", "Objective-C", "Python"],
    cloudRequirements: ["iCloud Services", "Kubernetes", "High-performance low-latency cloud backends"],
    aiMlRequirements: ["CoreML", "On-Device Neural Engine Optimization", "Computer Vision", "Natural Language Processing"],
    interviewDifficulty: "Very High",
    workStyle:
      "Deep focus on craftsmanship, secrecy, exceptional user experience, performance, privacy, and tight hardware-software integration.",
    howEmployeesWork:
      "Apple teams are strongly focused on product quality, performance, design, privacy and user experience. Hardware and software teams frequently collaborate to create tightly integrated products.",
    hiringFocus:
      "Technical expertise, attention to detail, problem solving, engineering fundamentals and product thinking.",
    bestPreparation:
      "Choose a specialization such as iOS, embedded systems, hardware or software engineering and build deep expertise.",
    entryLevelOpportunities:
      "Apple Hardware & Software Internships, Apple Developer Academy graduates, and campus specialized hiring.",
    careerGrowth:
      "Functional organizational structure where experts manage experts, enabling deep technical mastery without administrative drift.",
    learningOpportunities:
      "Collaboration with world-class industrial designers, silicon architects, and operating system kernels pioneers.",
    typicalProjectTypes: [
      "Native iOS app utilizing CoreML and Metal graphics pipeline",
      "Low-level memory-efficient kernel module or hardware driver in C",
      "Secure on-device data sync with end-to-end cryptographic proofs",
      "Embedded micro-controller system with real-time sensor processing"
    ],
    recommendedStudentPrep: [
      "Choose a clear specialization: iOS/macOS, Systems/C++, or Hardware/Silicon",
      "Build a polished, native iOS app adhering to Apple Human Interface Guidelines",
      "Master low-level CS: memory management, pointers, cache locality, and threading",
      "Demonstrate intense attention to detail and user privacy safeguards"
    ],
    interviewTopics: {
      coding: ["Memory allocation & pointers", "Multi-threading & concurrency (Grand Central Dispatch / Pthreads)", "Tree & Graph traversals", "Bitwise operations"],
      systemDesign: ["On-device telemetry vs privacy protection", "Global photo sync architecture", "Real-time biometric validation pipeline"],
      behavioral: ["Obsession with product quality", "Handling tight functional constraints", "Collaboration across hardware and software teams"]
    },
    sampleProjects: [
      {
        title: "On-Device Vision AI iOS Application",
        description: "Native SwiftUI and CoreML app that runs edge object detection at 60 FPS with zero cloud data transmission for total privacy.",
        skillsTargeted: ["Swift", "iOS Development", "CoreML", "UI/UX"]
      },
      {
        title: "Embedded RTOS Sensor Fusion Controller",
        description: "Bare-metal C/C++ firmware coordinating multi-sensor inputs with low power consumption and microsecond interrupt latency.",
        skillsTargeted: ["C/C++", "Embedded Systems", "Hardware Fundamentals", "Algorithms"]
      }
    ]
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    ticker: "NVDA",
    tagline: "Pioneering accelerated computing to tackle challenges no one else can solve",
    accentColor: "#76B900",
    industry: ["Semiconductors", "Artificial Intelligence", "Computer Graphics", "High-Performance Computing"],
    majorProducts: ["GPUs (GeForce, Hopper, Blackwell)", "CUDA Parallel Computing Platform", "AI Infrastructure & DGX Superpods", "Omniverse", "Autonomous Vehicles (DRIVE)"],
    commonRoles: [
      "AI Engineer",
      "Machine Learning Engineer",
      "GPU Software Engineer",
      "CUDA Developer",
      "Hardware Engineer (ASIC/VLSI)",
      "Research Scientist"
    ],
    importantSkills: [
      "C++",
      "Python",
      "CUDA",
      "Machine Learning",
      "Deep Learning",
      "Computer Architecture",
      "Parallel Computing",
      "Linux",
      "Mathematics"
    ],
    programmingLanguages: ["C++", "CUDA C/C++", "Python", "Rust", "Assembly"],
    cloudRequirements: ["NVIDIA Cloud, DGX Cloud, Slurm clusters, InfiniBand networking"],
    aiMlRequirements: ["TensorRT", "CUDA Deep Neural Network (cuDNN)", "Triton Inference Server", "Transformer Optimization"],
    interviewDifficulty: "Very High",
    workStyle:
      "Deep technical focus combining hardware architecture, performance optimization, and scientific mathematics. Intense, high-speed execution with flat organizational hierarchy.",
    howEmployeesWork:
      "Employees work on highly technical problems involving GPUs, AI, accelerated computing, hardware and software. Work often involves research, experimentation, optimization and performance engineering.",
    hiringFocus:
      "Deep technical knowledge, mathematics, programming, computer architecture and AI/ML.",
    bestPreparation:
      "C++ + Python + ML + CUDA + computer architecture + Linux.",
    entryLevelOpportunities:
      "NVIDIA University Internship Program (Systems, Deep Learning, ASIC), Co-op programs, and New College Graduate (NCG) hiring.",
    careerGrowth:
      "Exceptional technical growth at the forefront of the global AI revolution, with exposure to cutting-edge silicon and algorithms.",
    learningOpportunities:
      "NVIDIA Deep Learning Institute (DLI), direct access to bleeding-edge GPU clusters, publications at NeurIPS/SIGGRAPH.",
    typicalProjectTypes: [
      "Custom CUDA kernel for accelerated matrix multiplication or convolution",
      "Multi-GPU distributed training pipeline using PyTorch DDP or Megatron-LM",
      "Simulated ray-tracing engine using Vulkan or DirectX Raytracing",
      "High-performance computer vision pipeline using TensorRT quantization"
    ],
    recommendedStudentPrep: [
      "Master modern C++ (C++17/20), templates, memory models, and cache efficiency",
      "Learn GPU programming with CUDA: threads, warps, blocks, and shared memory",
      "Understand computer architecture: pipelining, SIMD/SIMT, memory hierarchy, cache coherency",
      "Strengthen linear algebra, multivariable calculus, and numerical computing"
    ],
    interviewTopics: {
      coding: ["Parallel algorithm design", "Bitwise manipulation & memory alignment", "Graph & matrix algorithms in C++", "Custom data structures with pointer arithmetic"],
      systemDesign: ["High-throughput model serving architecture", "Distributed GPU cluster interconnect topology", "Low-latency streaming video transcode pipeline"],
      behavioral: ["Handling high-intensity deliverables", "Self-driven problem investigation", "Passion for computing innovation"]
    },
    sampleProjects: [
      {
        title: "CUDA Accelerated Fast Fourier Transform / Matrix Engine",
        description: "Parallel CUDA kernel outperforming naive CPU computation by 45x through shared memory tiling and warp-level primitives.",
        skillsTargeted: ["C++", "CUDA", "Parallel Computing", "Computer Architecture"]
      },
      {
        title: "TensorRT Optimized Deep Learning Inference Server",
        description: "FP16 quantized model deployment running high-throughput batch inferences on Linux GPU instances with Triton.",
        skillsTargeted: ["Python", "Machine Learning", "TensorRT", "Linux"]
      }
    ]
  },
  {
    id: "adobe",
    name: "Adobe",
    ticker: "ADBE",
    tagline: "Changing the world through digital experiences",
    accentColor: "#FF0000",
    industry: ["Creative Software", "Digital Experience", "Cloud SaaS", "Artificial Intelligence"],
    majorProducts: ["Photoshop", "Illustrator", "Acrobat / PDF", "Premiere Pro", "Adobe Experience Cloud", "Adobe Firefly Generative AI", "Figma integration"],
    commonRoles: [
      "Software Engineer",
      "ML Engineer (Generative Media)",
      "Product Manager",
      "UX Designer",
      "Data Scientist",
      "Product Designer"
    ],
    importantSkills: [
      "Java",
      "C++",
      "JavaScript",
      "Python",
      "Machine Learning",
      "Cloud",
      "UI/UX",
      "Databases"
    ],
    programmingLanguages: ["C++", "JavaScript/TypeScript", "Java", "Python", "WebAssembly"],
    cloudRequirements: ["AWS", "Azure", "Microservices architecture", "CDN asset streaming"],
    aiMlRequirements: ["Diffusion models (Firefly)", "Generative media synthesis", "Computer vision", "Vector graphics ML"],
    interviewDifficulty: "Medium-High",
    workStyle:
      "Harmonious blend of creative engineering, design thinking, and robust cloud services. Teams prioritize user experience, performance, and accessibility.",
    howEmployeesWork:
      "Teams build creative and business software used by millions of users. Employees combine engineering, design, product management and data analysis to improve digital experiences.",
    hiringFocus:
      "Software engineering, problem solving, product thinking, design and technical fundamentals.",
    bestPreparation:
      "Build software projects with strong user interfaces and learn modern software development practices.",
    entryLevelOpportunities:
      "Adobe India & Global Internship Programs, Adobe Research Fellowships, and University Graduate Associate Engineers.",
    careerGrowth:
      "Culture of work-life balance, cross-team mobility between Creative Cloud and Experience Cloud, patents and invention incentive programs.",
    learningOpportunities:
      "Adobe Tech Summits, Design Systems libraries (Spectrum), Generative AI research labs.",
    typicalProjectTypes: [
      "Interactive canvas graphics tool with WebGL or WebAssembly acceleration",
      "Cloud-based document processing microservice with PDF manipulation",
      "Generative image inpainting or prompt styling model integration",
      "Design token sync engine across collaborative Figma-like workspaces"
    ],
    recommendedStudentPrep: [
      "Build rich, responsive web applications with state-of-the-art UI/UX and animations",
      "Learn C++ or WebAssembly for high-performance client rendering",
      "Master modern frontend frameworks (React/TypeScript) alongside backend APIs",
      "Study digital image representation (color spaces, pixels, rasterization, bezier curves)"
    ],
    interviewTopics: {
      coding: ["String and Array manipulations", "Trees & Recursion", "Object-Oriented Design (Canvas / Document Model)", "Dynamic Programming"],
      systemDesign: ["Collaborative whiteboard / canvas sync engine", "Cloud asset storage & rendering pipeline", "Multi-tenant digital asset management (DAM)"],
      behavioral: ["Product intuition and design appreciation", "Cross-functional team alignment", "Customer feedback responsiveness"]
    },
    sampleProjects: [
      {
        title: "Browser Vector Drawing & SVG Editor",
        description: "Interactive canvas web app supporting bezier curves, layer management, undo/redo stacks, and SVG export.",
        skillsTargeted: ["JavaScript/TypeScript", "UI/UX", "Data Structures", "WebAssembly"]
      },
      {
        title: "Cloud PDF & Asset Annotation Microservice",
        description: "Scalable backend service providing PDF text parsing, digital signing, and metadata extraction.",
        skillsTargeted: ["Java/C++", "Cloud", "Databases", "APIs"]
      }
    ]
  },
  {
    id: "salesforce",
    name: "Salesforce",
    ticker: "CRM",
    tagline: "Connecting companies and customers from anywhere with the #1 AI CRM",
    accentColor: "#00A1E0",
    industry: ["Cloud Software", "CRM", "Enterprise Technology", "Artificial Intelligence"],
    majorProducts: ["Salesforce CRM", "Sales Cloud", "Service Cloud", "Marketing Cloud", "Data Cloud", "Einstein AI", "Slack", "MuleSoft", "Tableau"],
    commonRoles: [
      "Software Engineer",
      "Salesforce Developer",
      "Cloud Engineer",
      "Data Engineer",
      "Solution Engineer",
      "Product Manager"
    ],
    importantSkills: [
      "Java",
      "JavaScript",
      "SQL",
      "Apex",
      "Cloud Computing",
      "APIs",
      "Databases",
      "AI",
      "Communication"
    ],
    programmingLanguages: ["Java", "JavaScript/TypeScript", "Apex", "Python", "SQL"],
    cloudRequirements: ["Salesforce Hyperforce", "AWS", "Distributed Multi-Tenant Architecture"],
    aiMlRequirements: ["Einstein 1 AI Platform", "Enterprise LLM Guardrails", "Predictive CRM Analytics"],
    interviewDifficulty: "Medium-High",
    workStyle:
      "Enterprise software at massive scale. Strong Ohana culture emphasizing trust, customer success, innovation, equality, and sustainability.",
    howEmployeesWork:
      "Employees build cloud-based enterprise software and frequently work with customers and business teams. Engineers collaborate across development, product, sales and customer-success teams.",
    hiringFocus:
      "Programming, databases, cloud technologies, problem solving and communication.",
    bestPreparation:
      "Learn Java + SQL + APIs + cloud fundamentals and understand how enterprise software solves business problems.",
    entryLevelOpportunities:
      "Futureforce Internship Program, Futureforce New Grad program, and Trailhead fellowship tracks.",
    careerGrowth:
      "Structured engineering progression, mentorship programs, volunteer time off (VTO) leadership, and leadership academies.",
    learningOpportunities:
      "Trailhead gamified learning platform, Slack internal engineering symposiums, customer co-innovation labs.",
    typicalProjectTypes: [
      "Multi-tenant SaaS application with relational schema isolation",
      "Enterprise CRM workflow automation with webhook integrations",
      "Unified customer data platform aggregating event streams",
      "Slack bot integration providing intelligent enterprise search"
    ],
    recommendedStudentPrep: [
      "Strong Java backend foundation with Spring Boot and relational database modeling",
      "Build projects with RESTful and GraphQL APIs with robust error handling",
      "Understand multi-tenancy, database sharding, and ACID transactions",
      "Learn fundamental CRM concepts and how enterprise businesses manage leads and support"
    ],
    interviewTopics: {
      coding: ["Hash maps & Two Pointers", "Trees & Graph traversals", "Object-Oriented System Design", "SQL schema query optimization"],
      systemDesign: ["Multi-tenant notification dispatch system", "Scalable CRM pipeline tracking millions of leads", "Distributed API gateway with rate limiting"],
      behavioral: ["Customer-first mindset", "Collaboration with non-technical business partners", "Values-driven decision making (Trust & Equality)"]
    },
    sampleProjects: [
      {
        title: "Multi-Tenant Enterprise Helpdesk & Ticketing System",
        description: "Full-stack SaaS with tenant isolation, custom SLA workflow engine, automated email notifications, and analytics dashboard.",
        skillsTargeted: ["Java", "SQL", "APIs", "Cloud Computing"]
      },
      {
        title: "Smart Slack CRM Integration Bot",
        description: "Event-driven bot that queries customer data, updates deal stages via natural language, and posts alert cards.",
        skillsTargeted: ["JavaScript", "APIs", "Communication", "AI"]
      }
    ]
  },
  {
    id: "ibm",
    name: "IBM",
    ticker: "IBM",
    tagline: "Leading the era of hybrid cloud and artificial intelligence",
    accentColor: "#054ADA",
    industry: ["Enterprise Technology", "Cloud", "Artificial Intelligence", "Consulting", "Quantum Computing"],
    majorProducts: ["IBM Cloud", "watsonx AI Platform", "Red Hat OpenShift", "IBM Z Mainframe", "Cybersecurity Suite", "IBM Consulting"],
    commonRoles: [
      "Software Engineer",
      "Data Scientist",
      "AI Engineer",
      "Cloud Engineer",
      "Cybersecurity Analyst",
      "Technology Consultant"
    ],
    importantSkills: [
      "Java",
      "Python",
      "SQL",
      "Cloud Computing",
      "AI/ML",
      "Cybersecurity",
      "Linux",
      "Problem Solving",
      "Communication"
    ],
    programmingLanguages: ["Java", "Python", "C/C++", "Go", "SQL", "COBOL / Assembly (Systems)"],
    cloudRequirements: ["Red Hat OpenShift", "IBM Cloud", "Hybrid multi-cloud architectures"],
    aiMlRequirements: ["watsonx.ai", "Foundation Models for Code", "AI Governance & Compliance"],
    interviewDifficulty: "Medium",
    workStyle:
      "Enterprise consulting and mission-critical engineering. Employees balance software innovation with enterprise compliance, reliability, and client delivery.",
    howEmployeesWork:
      "IBM employees frequently work on enterprise technology and consulting projects. Teams solve business problems using software, cloud, AI, data and cybersecurity technologies.",
    hiringFocus:
      "Technical skills combined with communication, business understanding and problem solving.",
    bestPreparation:
      "Build strong programming and database fundamentals, then specialize in cloud, AI, cybersecurity or consulting.",
    entryLevelOpportunities:
      "IBM University Internship, IBM Entry-Level Software Developer roles, IBM Consulting Associate tracks.",
    careerGrowth:
      "IBM Fellow designation, technical consulting career tracks, global project assignments.",
    learningOpportunities:
      "Your Learning internal enterprise university, Red Hat certifications, IBM Quantum Computing network.",
    typicalProjectTypes: [
      "Hybrid cloud microservice deployed on Red Hat OpenShift/Kubernetes",
      "Enterprise AI governance framework verifying training data integrity",
      "Secure data tokenization and encryption proxy for financial compliance",
      "End-to-end data pipeline feeding business intelligence dashboards"
    ],
    recommendedStudentPrep: [
      "Solidify Java and Python core skills along with relational databases (DB2/PostgreSQL)",
      "Learn container fundamentals (Docker, Kubernetes, OpenShift)",
      "Understand enterprise security: authentication, encryption, role-based controls",
      "Hone presentation and client communication skills for technical problem solving"
    ],
    interviewTopics: {
      coding: ["Core DSA (Arrays, Strings, Stacks/Queues)", "OOP concepts and inheritance", "SQL queries and joins", "Basic algorithms and sorting"],
      systemDesign: ["Hybrid cloud deployment architecture", "Enterprise authentication gateway", "Secure banking transaction audit ledger"],
      behavioral: ["Client problem solving", "Team collaboration in large organizations", "Continuous learning and adaptability"]
    },
    sampleProjects: [
      {
        title: "Hybrid Cloud Containerized Microservices Platform",
        description: "Resilient containerized app deployed with Docker and Kubernetes featuring health probes, auto-scaling, and telemetry.",
        skillsTargeted: ["Java/Python", "Cloud Computing", "Linux", "Kubernetes"]
      },
      {
        title: "AI Compliance & Bias Detection Dashboard",
        description: "Auditing toolkit checking algorithmic fairness, training drift, and data lineage for ML classification models.",
        skillsTargeted: ["Python", "AI/ML", "SQL", "Problem Solving"]
      }
    ]
  },
  {
    id: "accenture",
    name: "Accenture",
    ticker: "ACN",
    tagline: "Let there be change — delivering 360° value through technology and human ingenuity",
    accentColor: "#A100FF",
    industry: ["IT Services", "Consulting", "Digital Transformation", "Cloud Migration"],
    majorProducts: ["Cloud Transformation Services", "Applied Intelligence & AI", "Cybersecurity Services", "Digital Engineering & Industry X", "Enterprise ERP Deployments (SAP, Salesforce)"],
    commonRoles: [
      "Software Engineer",
      "Data Analyst",
      "Cloud Engineer",
      "AI/ML Engineer",
      "Business Analyst",
      "Technology Consultant"
    ],
    importantSkills: [
      "SQL",
      "Java",
      "Python",
      "Cloud Computing",
      "Data Analysis",
      "Excel",
      "AI",
      "Project Management",
      "Communication"
    ],
    programmingLanguages: ["Java", "Python", "JavaScript", "SQL", "C#"],
    cloudRequirements: ["Multi-cloud (AWS, Azure, GCP)", "Cloud migration frameworks", "DevOps"],
    aiMlRequirements: ["Generative AI business use cases", "Prompt engineering", "Analytics dashboards"],
    interviewDifficulty: "Medium",
    workStyle:
      "Client-facing, consulting-driven, and agile project delivery. Cross-functional teams work on high-stakes modernization projects for Global 2000 clients.",
    howEmployeesWork:
      "Accenture employees frequently work in client-facing project teams. They analyze business problems, design technology solutions, implement systems, communicate with clients and manage project deliverables.",
    hiringFocus:
      "Technical fundamentals, communication, analytical thinking, teamwork and ability to understand business requirements.",
    bestPreparation:
      "SQL + Java/Python + communication + project management + practical business-oriented projects.",
    entryLevelOpportunities:
      "Associate Software Engineer (ASE) & Advanced Associate Software Engineer (AASE) campus placement drives, Innovation Challenges.",
    careerGrowth:
      "Clear promotional ladder from Associate to Analyst, Consultant, Manager, and Managing Director.",
    learningOpportunities:
      "Accenture Connected Learning, enterprise partnerships with MIT/Coursera, rapid tech stack exposure across diverse client industries.",
    typicalProjectTypes: [
      "Legacy mainframe to cloud migration assessment and API bridging",
      "Enterprise analytics dashboard visualizing supply chain metrics",
      "Automated testing and continuous delivery pipeline for banking apps",
      "Customer portal modernization using responsive web frameworks"
    ],
    recommendedStudentPrep: [
      "Master SQL queries, aggregation, joins, and database design",
      "Learn one object-oriented programming language (Java or Python)",
      "Develop strong communication, presentation, and case study skills",
      "Familiarize yourself with Agile/Scrum methodologies and project delivery workflows"
    ],
    interviewTopics: {
      coding: ["Arrays and Strings", "Basic Data Structures (Stacks, Queues, Lists)", "SQL querying & data manipulation", "Object-Oriented Programming principles"],
      systemDesign: ["High-level enterprise architecture migration", "Cloud database replication for reporting", "E-commerce order tracking dashboard"],
      behavioral: ["Client management and handling feedback", "Teamwork under tight deadlines", "Flexibility across varied tech stacks"]
    },
    sampleProjects: [
      {
        title: "Enterprise Supply Chain Analytics & Reporting Dashboard",
        description: "Full-stack business analytics dashboard with SQL database, automated CSV data ingestion, and interactive metric charts.",
        skillsTargeted: ["SQL", "Python", "Data Analysis", "Excel"]
      },
      {
        title: "Legacy REST API Modernization Wrapper",
        description: "Modern Java Spring Boot facade wrapping legacy data services with JSON endpoints, validation, and Docker containerization.",
        skillsTargeted: ["Java", "Cloud Computing", "Project Management", "Communication"]
      }
    ]
  }
];

export const STUDENT_SKILL_MAP: StudentSkillCategory[] = [
  {
    category: "Programming",
    iconName: "Code2",
    description: "The primary languages used to build software, algorithms, and systems.",
    skills: [
      { name: "Java", importance: "Essential", whyItMatters: "Enterprise backends, Android, big data systems (Amazon, Google, Salesforce)." },
      { name: "Python", importance: "Essential", whyItMatters: "AI/ML, data science, automation, backend APIs (Google, Meta, NVIDIA)." },
      { name: "C++", importance: "High", whyItMatters: "Systems programming, graphics, game engines, low-latency finance (NVIDIA, Apple, Meta)." },
      { name: "JavaScript / TypeScript", importance: "High", whyItMatters: "Full-stack web applications, frontend UI/UX, tooling (Microsoft, Adobe, Meta)." }
    ]
  },
  {
    category: "Computer Science Fundamentals",
    iconName: "Binary",
    description: "Core academic principles evaluated in technical interviews.",
    skills: [
      { name: "Data Structures", importance: "Essential", whyItMatters: "Arrays, Trees, Graphs, Hash Maps, Queues, Heaps used in all coding interviews." },
      { name: "Algorithms", importance: "Essential", whyItMatters: "Sorting, Searching, Dynamic Programming, Graph Traversal, Greedy approaches." },
      { name: "Object-Oriented Programming (OOP)", importance: "Essential", whyItMatters: "SOLID principles, design patterns, maintainable code architectures." },
      { name: "Operating Systems", importance: "High", whyItMatters: "Processes, threads, concurrency, virtual memory, scheduling, IPC." },
      { name: "Computer Networks", importance: "High", whyItMatters: "TCP/IP, HTTP/HTTPS, DNS, WebSockets, network latency and routing." },
      { name: "DBMS & Databases", importance: "Essential", whyItMatters: "Relational modeling, indexing, ACID transactions, NoSQL trade-offs." },
      { name: "Software Engineering", importance: "High", whyItMatters: "Testing, CI/CD, modular architecture, code review standards." }
    ]
  },
  {
    category: "Development & Infrastructure",
    iconName: "Cpu",
    description: "Tools and practices required to ship production-ready software.",
    skills: [
      { name: "Git & GitHub", importance: "Essential", whyItMatters: "Version control, pull requests, branch workflows, open source collaboration." },
      { name: "APIs (REST & gRPC)", importance: "Essential", whyItMatters: "Inter-service communication, payload contracts, authentication, rate limits." },
      { name: "Databases (SQL & NoSQL)", importance: "Essential", whyItMatters: "Query optimization, schema design, Redis caching, Postgres/MongoDB." },
      { name: "Testing & Debugging", importance: "High", whyItMatters: "Unit testing, integration testing, memory profiling, log telemetry." },
      { name: "Cloud Computing", importance: "High", whyItMatters: "AWS, Azure, GCP primitives: compute, serverless, storage, networking." },
      { name: "System Design", importance: "High", whyItMatters: "Scalability, load balancing, caching, consensus, partition tolerance." }
    ]
  },
  {
    category: "Artificial Intelligence & ML",
    iconName: "Sparkles",
    description: "Modern data and intelligence competencies transforming every tech sector.",
    skills: [
      { name: "Python for Data Science", importance: "Essential", whyItMatters: "NumPy, Pandas, Matplotlib for data manipulation and insights." },
      { name: "Statistics & Probability", importance: "High", whyItMatters: "Hypothesis testing, distributions, regression, loss functions." },
      { name: "Machine Learning Core", importance: "High", whyItMatters: "Supervised and unsupervised models, scikit-learn, feature engineering." },
      { name: "Deep Learning & Neural Networks", importance: "High", whyItMatters: "PyTorch, TensorFlow, CNNs, Transformers, optimization techniques." },
      { name: "Generative AI & LLMs", importance: "High", whyItMatters: "Prompt engineering, RAG pipelines, fine-tuning, embeddings, vector databases." },
      { name: "Model Deployment (MLOps)", importance: "Valuable", whyItMatters: "Serving models with FastAPI/Triton, monitoring drift, quantization." }
    ]
  },
  {
    category: "Professional & Behavioral Skills",
    iconName: "Users",
    description: "Interpersonal attributes that define engineering leadership and impact.",
    skills: [
      { name: "Communication", importance: "Essential", whyItMatters: "Articulating technical trade-offs, documentation, explaining complex ideas." },
      { name: "Teamwork & Empathy", importance: "Essential", whyItMatters: "Collaborating across cross-functional roles, code review empathy." },
      { name: "Problem Solving", importance: "Essential", whyItMatters: "Structuring ambiguous problems, root cause analysis, analytical rigor." },
      { name: "Leadership & Ownership", importance: "High", whyItMatters: "Taking end-to-end accountability, initiative, unblocking peers." },
      { name: "Time Management", importance: "High", whyItMatters: "Sprint prioritization, managing scope, balancing studies and projects." },
      { name: "Analytical Thinking", importance: "High", whyItMatters: "Data-driven decisions, trade-off evaluation, benchmarking." }
    ]
  },
  {
    category: "Career Preparation Checklist",
    iconName: "CheckCircle2",
    description: "Concrete student milestones before applying for high-impact roles.",
    skills: [
      { name: "Build 2–4 Strong Projects", importance: "Essential", whyItMatters: "End-to-end deployed projects demonstrating backend, frontend, or ML depth." },
      { name: "Active GitHub Profile", importance: "Essential", whyItMatters: "Clean commits, detailed READMEs, architecture diagrams, live demo links." },
      { name: "Regular DSA Practice", importance: "Essential", whyItMatters: "Consistent practice solving LeetCode/HackerRank problems with time limits." },
      { name: "Master One Primary Language", importance: "Essential", whyItMatters: "Deep fluency in memory model, standard library, and idiomatic practices." },
      { name: "Hackathons & Internships", importance: "High", whyItMatters: "Proves execution under deadlines and practical cross-functional team skills." },
      { name: "Technical Mock Interviews", importance: "High", whyItMatters: "Verbalizing thought process while coding on whiteboards or collaborative pads." },
      { name: "Professional ATS Resume", importance: "Essential", whyItMatters: "Quantified bullet points (impact, metrics, technologies used)." },
      { name: "Product & Company Research", importance: "Essential", whyItMatters: "Understanding the company's business model and tech challenges before interviews." }
    ]
  }
];

export const PREPARATION_ROADMAPS: PreparationRoadmap[] = [
  {
    duration: "3-Month",
    focus: "Sprint: Foundations, Core DSA, and MVP Portfolio Project",
    milestones: [
      {
        phase: "Month 1: Fundamentals & Primary Language Fluency",
        weeks: "Weeks 1–4",
        goals: [
          "Choose primary language (Java, C++, or Python) and master standard collections/memory",
          "Complete fundamental DSA: Arrays, Strings, Hash Maps, Stacks, and Queues",
          "Set up Git, GitHub, and professional markdown documentation habits"
        ],
        deliverables: [
          "50 solved LeetCode Easy/Medium problems",
          "Configured GitHub profile with clean commit history"
        ]
      },
      {
        phase: "Month 2: Algorithms & Core Portfolio Project",
        weeks: "Weeks 5–8",
        goals: [
          "Tackle Binary Trees, Recursion, Binary Search, and Two Pointers",
          "Build and deploy a full-stack CRUD application with database indexing",
          "Implement automated unit tests and Docker containerization"
        ],
        deliverables: [
          "Deployed web app with live URL, README architecture diagram, and tests",
          "40 additional DSA problems covering trees and sorting"
        ]
      },
      {
        phase: "Month 3: Interview Readiness & Targeted Applications",
        weeks: "Weeks 9–12",
        goals: [
          "Practice timed coding interviews (45-minute limit)",
          "Draft 1-page ATS-optimized resume emphasizing project metrics",
          "Prepare 5 behavioral STAR stories highlighting problem ownership"
        ],
        deliverables: [
          "Finished ATS resume reviewed by mentors or peers",
          "5 completed peer mock interviews"
        ]
      }
    ]
  },
  {
    duration: "6-Month",
    focus: "Intensive: Advanced Algorithms, Cloud Deployment, and Specialized Domain Project",
    milestones: [
      {
        phase: "Months 1–2: Deep CS Fundamentals & Algorithmic Rigor",
        weeks: "Weeks 1–8",
        goals: [
          "Master Graphs (BFS/DFS, Dijkstra, Topological Sort) and Dynamic Programming",
          "Study Operating Systems (processes, threads, deadlocks) and Computer Networks",
          "Practice writing clean, bug-free code under 25 minutes per problem"
        ],
        deliverables: [
          "120+ DSA problems solved across medium/hard categories",
          "Notes on OS concurrency and network protocols"
        ]
      },
      {
        phase: "Months 3–4: Scalable Architecture & Cloud Specialization",
        weeks: "Weeks 9–16",
        goals: [
          "Build a high-throughput distributed system (event queue, caching layer, rate limiter)",
          "Deploy to AWS or Azure with automated CI/CD GitHub Actions",
          "Learn system design fundamentals: load balancers, CDN, sharding, caching"
        ],
        deliverables: [
          "Live distributed project with benchmark telemetry (throughput, latency)",
          "First cloud certification (e.g. AWS Cloud Practitioner or Azure Fundamentals)"
        ]
      },
      {
        phase: "Months 5–6: Domain Specialization & Comprehensive Interview Sprint",
        weeks: "Weeks 17–24",
        goals: [
          "Specialize in AI/ML (PyTorch/RAG), Systems (C++/CUDA), or Cloud/Distributed Systems",
          "Participate in 1–2 national hackathons or open source repositories",
          "Complete 10+ mock technical interviews with experienced mentors"
        ],
        deliverables: [
          "Specialized domain project with documented production trade-offs",
          "Targeted job applications across preferred tech companies"
        ]
      }
    ]
  },
  {
    duration: "12-Month",
    focus: "Comprehensive: Engineering Mastery, High-Impact Open Source, Internships & Tier-1 Prep",
    milestones: [
      {
        phase: "Quarter 1 (Months 1–3): Foundations, Fluency & First Capstone",
        weeks: "Weeks 1–12",
        goals: [
          "Build deep fluency in 2 languages (e.g. C++ for systems/DSA and Python/TypeScript for apps)",
          "Solve 100 fundamental DSA problems",
          "Deliver first robust portfolio project with full test coverage"
        ],
        deliverables: [
          "100 solved problems",
          "1 production-grade full stack project"
        ]
      },
      {
        phase: "Quarter 2 (Months 4–6): Advanced Systems, Cloud & Hackathon Wins",
        weeks: "Weeks 13–24",
        goals: [
          "Advanced DSA: Segment trees, Trie, Bitmask DP, Graph flows",
          "Study System Design (Designing Data-Intensive Applications)",
          "Compete in university & national hackathons"
        ],
        deliverables: [
          "1 Hackathon submission / award",
          "A distributed systems project demonstrating consensus or streaming"
        ]
      },
      {
        phase: "Quarter 3 (Months 7–9): Open Source Contributions & Research / Specialization",
        weeks: "Weeks 25–36",
        goals: [
          "Contribute to well-known open source projects or conduct lab research",
          "Target internships (Summer / Winter) with verified credentials",
          "Learn specialized stacks (CUDA/TensorRT, Kubernetes operators, iOS CoreML)"
        ],
        deliverables: [
          "Merged pull requests in open source repositories",
          "Secured internship or research fellowship"
        ]
      },
      {
        phase: "Quarter 4 (Months 10–12): High-Bar Technical & Behavioral Mastery",
        weeks: "Weeks 37–48",
        goals: [
          "Conduct 15+ peer and mentor mock interviews with experienced engineers",
          "Master system design scalability trade-offs (CAP theorem, Paxos/Raft, cache invalidation)",
          "Company-specific interview research (Googleyness, Amazon LPs, Meta speed, Apple privacy)"
        ],
        deliverables: [
          "Offer-ready interview performance across coding, architecture, and culture fit",
          "Comprehensive portfolio with verified evidence credentials"
        ]
      }
    ]
  }
];

export function getCompanyById(id: string): TechCompany | undefined {
  return TECH_COMPANIES.find((c) => c.id === id);
}
