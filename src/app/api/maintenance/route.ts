import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const body = await req.json();
    const vehicle = await prisma.vehicle.findUnique({ where: { id: body.vehicleId } });
    if (!vehicle || vehicle.ownerId !== user.id) throw new HttpError("Vehicle not found", 404);
    if (!body.type) throw new HttpError("Maintenance type is required", 422);

    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicle.id,
        type: body.type,
        note: body.note || null,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
      },
    });

    return apiOk({ log });
  });
}
