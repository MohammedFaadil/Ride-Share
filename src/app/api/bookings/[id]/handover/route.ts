import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/handover">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true, handover: true },
    });
    if (!booking) throw new HttpError("Booking not found", 404);

    const isRenter = booking.renterId === user.id;
    const isOwner = booking.vehicle.ownerId === user.id;
    if (!isRenter && !isOwner) throw new HttpError("You don't have access to this booking", 403);
    if (!["HANDOVER_PENDING"].includes(booking.status)) {
      throw new HttpError("This booking is not ready for handover", 409);
    }

    const existing = booking.handover;
    const roleField: "ownerConfirmed" | "renterConfirmed" = isOwner ? "ownerConfirmed" : "renterConfirmed";

    const handover = await prisma.handoverInspection.upsert({
      where: { bookingId: id },
      create: {
        bookingId: id,
        odometerKm: body.odometerKm ?? booking.vehicle.odometerKm,
        fuelLevelPct: body.fuelLevelPct ?? 100,
        photos: JSON.stringify(body.photos ?? []),
        notes: body.notes ?? null,
        [roleField]: true,
      },
      update: {
        ...(body.odometerKm !== undefined ? { odometerKm: body.odometerKm } : {}),
        ...(body.fuelLevelPct !== undefined ? { fuelLevelPct: body.fuelLevelPct } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        [roleField]: true,
      },
    });

    if (handover.ownerConfirmed && handover.renterConfirmed && !existing?.confirmedAt) {
      await prisma.handoverInspection.update({ where: { bookingId: id }, data: { confirmedAt: new Date() } });
      await prisma.booking.update({ where: { id }, data: { status: "ACTIVE" } });
      await prisma.notification.create({
        data: {
          userId: isOwner ? booking.renterId : booking.vehicle.ownerId,
          type: "RENTAL_STARTING",
          title: "Rental started",
          body: `Handover complete for ${booking.vehicle.brand} ${booking.vehicle.model}. Enjoy your rental!`,
          link: `/booking/${id}`,
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: isOwner ? booking.renterId : booking.vehicle.ownerId,
          type: "GENERAL",
          title: "Handover checklist updated",
          body: `${user.name} completed their part of the vehicle handover. Confirm your side to start the rental.`,
          link: `/booking/${id}/handover`,
        },
      });
    }

    return apiOk({ success: true });
  });
}
