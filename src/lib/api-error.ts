import { NextResponse } from "next/server";

export interface ApiErrorParams {
  code: string;
  message: string;
  statusCode?: number;
  details?: any;
}

export function apiError({ code, message, statusCode = 400, details }: ApiErrorParams) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status: statusCode }
  );
}

export const API_ERRORS = {
  EXPIRED_TOKEN: {
    code: "EXPIRED_TOKEN",
    message: "Your access token has expired. Please reconnect your account.",
    statusCode: 401,
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "You need to sign in to access this resource.",
    statusCode: 401,
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    message: "The requested resource was not found.",
    statusCode: 404,
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
    statusCode: 429,
  },
  PROVIDER_ERROR: {
    code: "PROVIDER_ERROR",
    message: "The provider returned an error. Please try again.",
    statusCode: 502,
  },
} as const;
