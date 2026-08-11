import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

const CANCELLABLE_STATUSES = ["REQUESTED", "OWNER_ACCEPTED", "CONFIRMED", "HANDOVER_PENDING"];

export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/cancel">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const booking = await prisma.booking.findUnique({ where: { id }, include: { vehicle: true, payments: true } });
    if (!booking) throw new HttpError("Booking not found", 404);

    const isRenter = booking.renterId === user.id;
    const isOwner = booking.vehicle.ownerId === user.id;
    if (!isRenter && !isOwner) throw new HttpError("You don't have access to this booking", 403);
    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new HttpError("This booking can no longer be cancelled", 409);
    }

    const newStatus = isRenter ? "CANCELLED_BY_RENTER" : "CANCELLED_BY_OWNER";
    const otherPartyId = isRenter ? booking.vehicle.ownerId : booking.renterId;

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: newStatus, cancelReason: body.reason ?? "Cancelled" },
      });

      const successfulPayments = booking.payments.filter((p) => p.status === "SUCCESS" && p.type !== "REFUND");
      for (const payment of successfulPayments) {
        await tx.payment.create({
          data: {
            bookingId: id,
            type: "REFUND",
            amount: payment.amount,
            status: "SUCCESS",
            method: "Demo Wallet",
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: otherPartyId,
          type: "GENERAL",
          title: "Booking cancelled",
          body: `The booking for ${booking.vehicle.brand} ${booking.vehicle.model} has been cancelled.`,
          link: `/booking/${id}`,
        },
      });
    });

    return apiOk({ success: true });
  });
}
