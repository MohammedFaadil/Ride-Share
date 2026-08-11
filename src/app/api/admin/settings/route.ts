import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function GET() {
  return handleRoute(async () => {
    const admin = await getCurrentUser();
    if (!admin) throw new HttpError("Please log in", 401);
    if (admin.role !== "ADMIN") throw new HttpError("Admins only", 403);

    const settings = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
    return apiOk({ settings });
  });
}

export async function PATCH(req: NextRequest) {
  return handleRoute(async () => {
    const admin = await getCurrentUser();
    if (!admin) throw new HttpError("Please log in", 401);
    if (admin.role !== "ADMIN") throw new HttpError("Admins only", 403);

    const body = await req.json().catch(() => ({}));
    const settings = body.settings as Record<string, string> | undefined;
    if (!settings || typeof settings !== "object") throw new HttpError("Missing settings object", 422);

    const existing = await prisma.platformSetting.findMany();
    const knownKeys = new Set(existing.map((s) => s.key));

    const entries = Object.entries(settings).filter(([key]) => knownKeys.has(key));
    if (entries.length === 0) throw new HttpError("No valid setting keys provided", 422);

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.platformSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    return apiOk({ success: true });
  });
}
