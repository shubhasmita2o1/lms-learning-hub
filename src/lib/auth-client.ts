const ACCESS_TOKEN_KEY = "unisphere_access_token";
const REFRESH_TOKEN_KEY = "unisphere_refresh_token";

type LoginInput = {
  email: string;
  password: string;
  tenantId?: string;
};

type LoginResponse = {
  user: {
    id: string;
    email: string;
    roles?: string[];
    permissions?: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export class AuthApiError extends Error {
  code: string | undefined;
  details: { tenantIds?: string[] } | undefined;

  constructor(message: string, code?: string, details?: { tenantIds?: string[] }) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
    this.details = details;
  }
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const baseUrl = import.meta.env["VITE_API_BASE_URL"] || "/api/v1";
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => null)) as
    | {
        data?: LoginResponse;
        error?: { message?: string; code?: string; details?: { tenantIds?: string[] } };
        message?: string;
      }
    | null;

  if (!response.ok || !body?.data) {
    throw new AuthApiError(
      body?.error?.message || body?.message || "Authentication failed. Please verify your credentials.",
      body?.error?.code,
      body?.error?.details,
    );
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, body.data.tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, body.data.tokens.refreshToken);
  return body.data;
}

export function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value === "/login") {
    return "/dashboard";
  }
  return value;
}