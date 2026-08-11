import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const city = typeof body.city === "string" ? body.city.trim() : undefined;
    const bio = typeof body.bio === "string" ? body.bio.trim() : undefined;

    if (name !== undefined && name.length < 2) throw new HttpError("Name must be at least 2 characters", 422);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(bio !== undefined ? { bio } : {}),
      },
    });

    return apiOk({ success: true });
  });
}
