import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }
    const { name, phone, password, city } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      throw new HttpError("An account with this email or phone already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, city },
    });

    await setSessionCookie(user.id);

    return apiOk({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  });
}
