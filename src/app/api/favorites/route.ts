import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in to save favorites", 401);

    const { vehicleId } = await req.json();
    if (!vehicleId) throw new HttpError("vehicleId is required", 422);

    const existing = await prisma.favorite.findUnique({
      where: { userId_vehicleId: { userId: user.id, vehicleId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return apiOk({ favorited: false });
    }

    await prisma.favorite.create({ data: { userId: user.id, vehicleId } });
    return apiOk({ favorited: true });
  });
}

export async function GET() {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });
    return apiOk({ favorites });
  });
}
