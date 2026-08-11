import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }
    const { password } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError("Invalid email or password", 401);
    if (user.suspended) throw new HttpError("This account has been suspended. Contact support.", 403);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new HttpError("Invalid email or password", 401);

    await setSessionCookie(user.id);

    return apiOk({ id: user.id, name: user.name, email: user.email, role: user.role });
  });
}
