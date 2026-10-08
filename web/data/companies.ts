export interface Company {
  id: string;
  name: string;
  industry: string;
  initials: string;
  hq: string;
}

export const companies: Company[] = [
  { id: "c1", name: "TechNova", industry: "Cloud Infrastructure", initials: "TN", hq: "Bengaluru" },
  { id: "c2", name: "Finlytics", industry: "Fintech", initials: "FL", hq: "Mumbai" },
  { id: "c3", name: "Cybergrid Labs", industry: "Cybersecurity", initials: "CG", hq: "Pune" },
  { id: "c4", name: "DataForge", industry: "Data Engineering", initials: "DF", hq: "Hyderabad" },
  { id: "c5", name: "Northwind Systems", industry: "Enterprise Software", initials: "NS", hq: "Gurugram" },
  { id: "c6", name: "Pixel Foundry", industry: "Product Design", initials: "PF", hq: "Remote" },
  { id: "c7", name: "Orbital Cloud", industry: "Cloud Platforms", initials: "OC", hq: "Bengaluru" },
  { id: "c8", name: "Meridian Health Tech", industry: "HealthTech", initials: "MH", hq: "Chennai" },
  { id: "c9", name: "Vertex Robotics", industry: "Robotics", initials: "VR", hq: "Pune" },
  { id: "c10", name: "Ledgerline", industry: "Blockchain", initials: "LL", hq: "Remote" },
];

export function getCompanyById(id: string) {
  return companies.find((c) => c.id === id);
}
