import { prisma } from "./prisma";

interface TokenRefreshResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * Refresh a GitLab access token using the refresh token
 */
export async function refreshGitLabToken(userId: string, accountId: string): Promise<TokenRefreshResult> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account || !account.refresh_token) {
    return {
      success: false,
      error: "No refresh token available. Please re-authenticate.",
    };
  }

  try {
    const response = await fetch("https://gitlab.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
        client_id: process.env.AUTH_GITLAB_ID!,
        client_secret: process.env.AUTH_GITLAB_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/auth/callback/gitlab`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error_description || "Token refresh failed",
      };
    }

    const data = await response.json();

    // Update the account with new tokens
    const expiresAt = data.created_at + data.expires_in;

    await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || account.refresh_token,
        expires_at: expiresAt,
      },
    });

    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      error: "Failed to refresh token. Please re-authenticate.",
    };
  }
}

/**
 * Check if a token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(expiresAt: number | null): boolean {
  if (!expiresAt) return false;
  // Consider expired if less than 5 minutes remaining
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutesFromNow = now + 300;
  return expiresAt < fiveMinutesFromNow;
}

/**
 * Get a valid access token for an account, refreshing if necessary
 */
export async function getValidAccessToken(
  userId: string,
  accountId: string,
  provider: string
): Promise<{ success: boolean; accessToken?: string; needsReauth?: boolean }> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    return { success: false, needsReauth: true };
  }

  // GitHub tokens typically don't expire (unless revoked)
  if (provider === "github" && account.access_token) {
    return { success: true, accessToken: account.access_token };
  }

  // GitLab tokens expire and need refresh
  if (provider === "gitlab") {
    if (!account.access_token) {
      return { success: false, needsReauth: true };
    }

    // Check if token is expired
    if (account.expires_at && isTokenExpired(account.expires_at)) {
      // Try to refresh the token
      const refreshResult = await refreshGitLabToken(userId, accountId);
      if (refreshResult.success && refreshResult.accessToken) {
        return { success: true, accessToken: refreshResult.accessToken };
      } else {
        // Token refresh failed, user needs to re-authenticate
        return { success: false, needsReauth: true };
      }
    }

    return { success: true, accessToken: account.access_token };
  }

  return { success: false, needsReauth: true };
}

/**
 * Error class for expired tokens - can be used to trigger re-authentication
 */
export class ExpiredTokenError extends Error {
  constructor(public provider: string) {
    super(`Token expired for provider: ${provider}`);
    this.name = "ExpiredTokenError";
  }
}

/**
 * Utility function to handle API calls with automatic token refresh
 * Throws ExpiredTokenError if re-authentication is needed
 */
export async function fetchWithTokenRefresh(
  userId: string,
  accountId: string,
  provider: string,
  url: string,
  options?: RequestInit
): Promise<Response> {
  const { success, accessToken, needsReauth } = await getValidAccessToken(userId, accountId, provider);

  if (!success || !accessToken) {
    throw new ExpiredTokenError(provider);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // If we get a 401, the token might be invalid - try to refresh
  if (response.status === 401 && provider === "gitlab") {
    const refreshResult = await refreshGitLabToken(userId, accountId);

    if (refreshResult.success && refreshResult.accessToken) {
      // Retry the request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${refreshResult.accessToken}`,
        },
      });
    }
  }

  return response;
}
