import type { components } from "./types";

export type ReadinessRequest = components["schemas"]["ReadinessRequest"];
export type ReadinessResponse = components["schemas"]["ReadinessResponse"];
export type SkillGapRequest = components["schemas"]["SkillGapRequest"];
export type SkillGapResponse = components["schemas"]["SkillGapResponse"];
export type ParseJobRequest = components["schemas"]["ParseJobRequest"];
export type ParseJobResponse = components["schemas"]["ParseJobResponse"];
export type MatchRequest = components["schemas"]["MatchRequest"];
export type MatchResponse = components["schemas"]["MatchResponse"];
export type RankRequest = components["schemas"]["RankRequest"];
export type RankResponse = components["schemas"]["RankResponse"];
export type PredictPlacementRequest = components["schemas"]["PredictPlacementRequest"];
export type PredictPlacementResponse = components["schemas"]["PredictPlacementResponse"];

export class AiError extends Error {
  readonly code: string;
  readonly field: string | null;
  readonly status: number | null;

  constructor(code: string, message: string, field: string | null, status: number | null) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.field = field;
    this.status = status;
  }
}

const configuredBaseUrl = process.env.NEXT_PUBLIC_AI_BASE_URL ?? "http://localhost:8000";
const baseUrl = configuredBaseUrl.replace(/\/+$/, "");

function isErrorResponse(value: unknown): value is components["schemas"]["ErrorResponse"] {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;

  const error = value.error;
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string" &&
    (!("field" in error) || error.field === null || typeof error.field === "string")
  );
}

async function post<Request, Response>(path: string, request: Request): Promise<Response> {
  let response: globalThis.Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach the AI service";
    throw new AiError("NETWORK_ERROR", message, null, null);
  }

  if (response.ok) return (await response.json()) as Response;

  if (response.status === 422) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (isErrorResponse(body)) {
      throw new AiError(
        body.error.code,
        body.error.message,
        body.error.field ?? null,
        response.status,
      );
    }
  }

  throw new AiError(
    "HTTP_ERROR",
    response.statusText || `AI service request failed with status ${response.status}`,
    null,
    response.status,
  );
}

export const readiness = (request: ReadinessRequest) =>
  post<ReadinessRequest, ReadinessResponse>("/ai/readiness", request);

export const skillGap = (request: SkillGapRequest) =>
  post<SkillGapRequest, SkillGapResponse>("/ai/skill-gap", request);

export const parseJob = (request: ParseJobRequest) =>
  post<ParseJobRequest, ParseJobResponse>("/ai/parse-job", request);

export const match = (request: MatchRequest) =>
  post<MatchRequest, MatchResponse>("/ai/match", request);

export const rank = (request: RankRequest) => post<RankRequest, RankResponse>("/ai/rank", request);

export const predictPlacement = (request: PredictPlacementRequest) =>
  post<PredictPlacementRequest, PredictPlacementResponse>("/ai/predict-placement", request);
