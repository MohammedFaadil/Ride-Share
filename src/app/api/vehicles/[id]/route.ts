import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

const OWNER_EDITABLE_STATUSES = ["ACTIVE", "SUSPENDED"];

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/vehicles/[id]">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new HttpError("Vehicle not found", 404);
    if (vehicle.ownerId !== user.id) throw new HttpError("You don't own this vehicle", 403);

    const body = await req.json();
    const data: Record<string, unknown> = {};

    for (const key of [
      "pricePerHour",
      "pricePerDay",
      "pricePerWeek",
      "securityDeposit",
      "includedKmPerDay",
      "extraKmCharge",
      "minRentalHours",
      "maxRentalDays",
      "lateFeePerHour",
      "odometerKm",
    ] as const) {
      if (body[key] !== undefined) {
        const num = Number(body[key]);
        if (Number.isNaN(num) || num < 0) throw new HttpError(`Invalid value for ${key}`, 422);
        data[key] = num;
      }
    }
    if (body.description !== undefined) data.description = String(body.description).slice(0, 2000);
    if (body.fuelPolicy !== undefined) data.fuelPolicy = String(body.fuelPolicy).slice(0, 300);
    if (Array.isArray(body.features)) data.features = JSON.stringify(body.features);
    if (body.status !== undefined) {
      if (!OWNER_EDITABLE_STATUSES.includes(body.status)) {
        throw new HttpError("You can only activate or pause your listing — other status changes require admin review", 422);
      }
      data.status = body.status;
    }

    const updated = await prisma.vehicle.update({ where: { id }, data });
    return apiOk({ vehicle: updated });
  });
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/vehicles/[id]">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new HttpError("Vehicle not found", 404);
    if (vehicle.ownerId !== user.id) throw new HttpError("You don't own this vehicle", 403);

    const activeBooking = await prisma.booking.findFirst({
      where: {
        vehicleId: id,
        status: { in: ["REQUESTED", "OWNER_ACCEPTED", "CONFIRMED", "HANDOVER_PENDING", "ACTIVE", "RETURN_PENDING"] },
      },
    });
    if (activeBooking) throw new HttpError("Can't delete a vehicle with active or pending bookings", 409);

    await prisma.vehicle.delete({ where: { id } });
    return apiOk({ success: true });
  });
}
