"use server";

import { careerOpportunitiesBridge } from "../integrations/career-opportunities-bridge";

export async function getEnrichedOpportunitiesAction(studentId: string = "s1") {
    try {
        const opportunities =
            careerOpportunitiesBridge.getEnrichedOpportunities(studentId);

        return { success: true, opportunities };
    } catch (err: any) {
        return {
            success: false,
            error: err.message || "Failed to load enriched opportunities.",
        };
    }
}