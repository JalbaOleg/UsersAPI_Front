import { CONFIG } from "../config";

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]> | null;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };

  let res: Response;
  try {
    res = await fetch(CONFIG.apiBase + path, {
      ...init,
      headers,
      credentials: CONFIG.apiBase ? "include" : "same-origin",
    });
  } catch {
    throw new ApiError(
      0,
      "Serverul nu răspunde. Verifică dacă API-ul rulează.",
    );
  }

  if (res.status === 204) return undefined as T;

  const isJson = (res.headers.get("content-type") ?? "").includes("json");
  const data = isJson
    ? ((await res.json().catch(() => null)) as unknown)
    : null;

  if (!res.ok) {
    const problem = (data ?? {}) as ProblemDetails;
    const fieldErrors = problem.errors
      ? Object.fromEntries(
          Object.entries(problem.errors).map(([k, v]) => [lowerFirst(k), v]),
        )
      : null;
    throw new ApiError(
      res.status,
      problem.title ?? problem.detail ?? `Eroare ${res.status}`,
      fieldErrors,
    );
  }
  return data as T;
}
