import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function handleRoute(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HttpError) return apiError(err.message, err.status);
    console.error(err);
    return apiError("Something went wrong. Please try again.", 500);
  }
}
