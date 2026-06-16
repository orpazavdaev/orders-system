const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.message === "string") return body.message;
    if (typeof body.error === "string") return body.error;
  } catch {
    return `Request failed (${response.status})`;
  }
  return `Request failed (${response.status})`;
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Unable to reach the order service. Check that the backend is running.");
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}
