/**
 * Career Opportunities Bridge for The Plug Student Platform
 * Bridges Samir's Career Intelligence & Analyzer with Curated Opportunities and Companies
 * Strictly scoped within features/samir
 */

import { opportunities as rawOpportunities, Opportunity } from "@/data/opportunities";
import { companies as rawCompanies } from "@/data/companies";
import { TECH_COMPANIES } from "../data/career-intelligence";
import { rudy, getStudentById } from "@/data/students";
import { getSkillById } from "@/data/skills";
import { computeSkillMatch } from "../data/current-student";
import { getOpportunityStatus, OpportunityStatus } from "@/lib/api/opportunities";

export interface EnrichedOpportunity extends Opportunity {
  companyName: string;
  companyInitials: string;
  companyIndustry: string;
  companyTier: "Tier 1 Tech" | "High-Growth Unicorn" | "Enterprise Tech" | "Startup";
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  readinessCategory: "High Fit" | "Moderate Fit" | "Developing Fit";
  estimatedWeeksToBridge: number;
  benchmarkRoadmapSnippet?: string;
  status?: OpportunityStatus;
}

export interface CompanyWithOpportunities {
  companyId: string;
  companyName: string;
  industry: string;
  benchmarkTier: string;
  openOpportunities: EnrichedOpportunity[];
  averageMatchScore: number;
}

export class CareerOpportunitiesBridge {

  /**
   * Resolve company name and initials from either data/companies or TECH_COMPANIES
   */
  public resolveCompanyMeta(companyIdOrName: string): {
    name: string;
    initials: string;
    industry: string;
    tier: EnrichedOpportunity["companyTier"];
  } {
    const rawComp = rawCompanies.find(
      (c) => c.id.toLowerCase() === companyIdOrName.toLowerCase() || c.name.toLowerCase() === companyIdOrName.toLowerCase()
    );
    if (rawComp) {
      return {
        name: rawComp.name,
        initials: rawComp.initials,
        industry: rawComp.industry,
        tier: rawComp.industry.includes("Cloud") || rawComp.industry.includes("Cyber")
          ? "Tier 1 Tech"
          : "Enterprise Tech",
      };
    }

    const techComp = TECH_COMPANIES.find(
      (tc) => tc.id.toLowerCase() === companyIdOrName.toLowerCase() || tc.name.toLowerCase().includes(companyIdOrName.toLowerCase())
    );
    if (techComp) {
      return {
        name: techComp.name,
        initials: techComp.name.slice(0, 2).toUpperCase(),
        industry: techComp.industry?.[0] || "Software Engineering",
        tier: "Tier 1 Tech",
      };
    }

    return {
      name: companyIdOrName,
      initials: companyIdOrName.slice(0, 2).toUpperCase(),
      industry: "Technology",
      tier: "Enterprise Tech",
    };
  }

  /**
   * Get student skills for calculating fit
   */
  public getStudentSkills(studentId: string = "s1"): Map<string, number> {
    const skillMap = new Map<string, number>();
    const student = getStudentById(studentId) ?? rudy;
    const skills = student?.skills || [];

    skills.forEach((s) => {
      skillMap.set(s.skillId.toLowerCase(), s.score);
      const meta = getSkillById(s.skillId);
      if (meta?.name) {
        skillMap.set(meta.name.toLowerCase(), s.score);
      }
    });

    return skillMap;
  }

  /**
   * Enrich opportunities with match scores, status, and skill gap roadmaps
   */
  public getEnrichedOpportunities(studentId: string = "s1"): EnrichedOpportunity[] {
    const student = getStudentById(studentId) ?? rudy;

    return rawOpportunities.map((opp) => {
      const companyMeta = this.resolveCompanyMeta(opp.companyId);
      const status = getOpportunityStatus(opp.deadline);

      // Same formula as the Opportunities pages so a role never shows two different scores.
      const { matchScore, matchingSkills, missingSkills } = computeSkillMatch(opp.requiredSkills, student.skills);

      const readinessCategory: EnrichedOpportunity["readinessCategory"] =
        matchScore >= 75 ? "High Fit" : matchScore >= 45 ? "Moderate Fit" : "Developing Fit";

      const estimatedWeeksToBridge = Math.max(1, missingSkills.length * 2);

      return {
        ...opp,
        companyName: companyMeta.name,
        companyInitials: companyMeta.initials,
        companyIndustry: companyMeta.industry,
        companyTier: companyMeta.tier,
        matchScore,
        matchingSkills,
        missingSkills,
        readinessCategory,
        estimatedWeeksToBridge,
        status,
        benchmarkRoadmapSnippet:
          missingSkills.length > 0
            ? `Recommended focus on: ${missingSkills.join(", ")} (~${estimatedWeeksToBridge} weeks)`
            : "Direct Profile Match: Ready to apply immediately",
      };
    });
  }

  /**
   * Get all curated opportunities matching a specific benchmark company
   */
  public getOpportunitiesForCompany(companyIdOrName: string, studentId: string = "s1"): EnrichedOpportunity[] {
    const all = this.getEnrichedOpportunities(studentId);
    const target = companyIdOrName.toLowerCase();

    return all.filter(
      (opp) =>
        opp.companyId.toLowerCase() === target ||
        opp.companyName.toLowerCase().includes(target) ||
        (target === "google" && opp.companyId === "c1") // bridge Google to top tech role
    );
  }

  /**
   * Get Top Match Opportunities
   */
  public getTopMatchedOpportunities(studentId: string = "s1", limit: number = 4): EnrichedOpportunity[] {
    const all = this.getEnrichedOpportunities(studentId);
    return all.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  }
}

export const careerOpportunitiesBridge = new CareerOpportunitiesBridge();
