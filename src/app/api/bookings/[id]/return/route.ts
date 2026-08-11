import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/return">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true, handover: true, returnInspection: true, payments: true },
    });
    if (!booking) throw new HttpError("Booking not found", 404);

    const isRenter = booking.renterId === user.id;
    const isOwner = booking.vehicle.ownerId === user.id;
    if (!isRenter && !isOwner) throw new HttpError("You don't have access to this booking", 403);
    if (!["ACTIVE", "RETURN_PENDING"].includes(booking.status)) {
      throw new HttpError("This booking is not ready for return", 409);
    }

    if (booking.status === "ACTIVE") {
      await prisma.booking.update({ where: { id }, data: { status: "RETURN_PENDING" } });
    }

    const roleField: "ownerConfirmed" | "renterConfirmed" = isOwner ? "ownerConfirmed" : "renterConfirmed";
    const startOdometer = booking.handover?.odometerKm ?? booking.vehicle.odometerKm;
    const endOdometer = body.odometerKm ?? startOdometer;
    const distanceUsed = Math.max(0, endOdometer - startOdometer);
    const extraKmUsed = Math.max(0, distanceUsed - booking.includedKm);
    const extraKmFee = Math.round(extraKmUsed * booking.extraKmCharge);

    const now = new Date();
    const lateMs = now.getTime() - new Date(booking.endAt).getTime();
    const graceMs = 30 * 60 * 1000;
    const lateHours = lateMs > graceMs ? Math.ceil((lateMs - graceMs) / 3600000) : 0;
    const lateFee = Math.round(lateHours * booking.vehicle.lateFeePerHour);

    const existing = booking.returnInspection;
    const inspection = await prisma.returnInspection.upsert({
      where: { bookingId: id },
      create: {
        bookingId: id,
        odometerKm: endOdometer,
        fuelLevelPct: body.fuelLevelPct ?? 100,
        photos: JSON.stringify(body.photos ?? []),
        notes: body.notes ?? null,
        extraKmUsed,
        extraKmFee,
        lateHours,
        lateFee,
        [roleField]: true,
      },
      update: {
        ...(body.odometerKm !== undefined ? { odometerKm: endOdometer, extraKmUsed, extraKmFee } : {}),
        ...(body.fuelLevelPct !== undefined ? { fuelLevelPct: body.fuelLevelPct } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        lateHours,
        lateFee,
        [roleField]: true,
      },
    });

    if (inspection.ownerConfirmed && inspection.renterConfirmed && !existing?.confirmedAt) {
      await prisma.$transaction(async (tx) => {
        await tx.returnInspection.update({ where: { bookingId: id }, data: { confirmedAt: new Date() } });
        await tx.booking.update({ where: { id }, data: { status: "COMPLETED" } });

        const totalDue = inspection.extraKmFee + inspection.lateFee;
        if (totalDue > 0) {
          await tx.payment.create({
            data: { bookingId: id, type: "EXTRA_CHARGE", amount: totalDue, status: "SUCCESS", method: "Demo Wallet" },
          });
        }
        const depositRefund = Math.max(0, booking.securityDeposit - totalDue);
        if (depositRefund > 0) {
          await tx.payment.create({
            data: { bookingId: id, type: "REFUND", amount: depositRefund, status: "SUCCESS", method: "Demo Wallet" },
          });
        }

        await tx.notification.createMany({
          data: [
            {
              userId: booking.renterId,
              type: "REVIEW_REQUEST",
              title: "Rental completed",
              body: "Your rental is complete. Share a quick review of your experience.",
              link: `/booking/${id}`,
            },
            {
              userId: booking.vehicle.ownerId,
              type: "REVIEW_REQUEST",
              title: "Rental completed",
              body: "The rental has ended. Rate the renter and check your earnings.",
              link: `/booking/${id}`,
            },
          ],
        });
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: isOwner ? booking.renterId : booking.vehicle.ownerId,
          type: "GENERAL",
          title: "Return checklist updated",
          body: `${user.name} completed their part of the return inspection. Confirm your side to finish.`,
          link: `/booking/${id}/return`,
        },
      });
    }

    return apiOk({ success: true });
  });
}
