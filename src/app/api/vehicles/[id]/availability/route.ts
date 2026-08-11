import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function GET(_req: Request, ctx: RouteContext<"/api/vehicles/[id]/availability">) {
  return handleRoute(async () => {
    const { id } = await ctx.params;
    const blocks = await prisma.availabilityBlock.findMany({
      where: { vehicleId: id, endAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
    });
    return apiOk({ blocks });
  });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/vehicles/[id]/availability">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new HttpError("Vehicle not found", 404);
    if (vehicle.ownerId !== user.id) throw new HttpError("You don't own this vehicle", 403);

    const body = await req.json();
    const startAt = new Date(body.startAt);
    const endAt = new Date(body.endAt);
    if (!(endAt > startAt)) throw new HttpError("End date must be after start date", 422);

    const overlapping = await prisma.booking.findFirst({
      where: {
        vehicleId: id,
        status: { in: ["REQUESTED", "OWNER_ACCEPTED", "CONFIRMED", "HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING"] },
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    });
    if (overlapping) throw new HttpError("You have an existing booking in this window — resolve it before blocking these dates", 409);

    const block = await prisma.availabilityBlock.create({
      data: { vehicleId: id, startAt, endAt, reason: body.reason || "Blocked by owner" },
    });
    return apiOk({ block });
  });
}
