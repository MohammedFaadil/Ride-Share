import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "roamly_session";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not set. Sessions cannot be signed securely — set it in your environment " +
      "before starting the app (Render: render.yaml already generates one automatically)."
  );
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "roamly_dev_secret_do_not_use_in_prod"
);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

async function getUserIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const userId = await getUserIdFromCookie();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.suspended) return null;
  return user;
}

export type SafeUser = Awaited<ReturnType<typeof getCurrentUser>>;
