import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/damage/respond">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const body = await req.json();
    const action = body.action as "ACCEPT" | "DISPUTE";
    const response = typeof body.response === "string" ? body.response : "";

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true, damageClaims: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!booking) throw new HttpError("Booking not found", 404);
    if (booking.renterId !== user.id) throw new HttpError("Only the renter can respond to this claim", 403);

    const claim = booking.damageClaims[0];
    if (!claim || claim.status !== "RENTER_NOTIFIED") {
      throw new HttpError("There is no pending damage claim to respond to", 409);
    }

    await prisma.$transaction(async (tx) => {
      await tx.damageClaim.update({
        where: { id: claim.id },
        data: {
          status: action === "ACCEPT" ? "ACCEPTED" : "DISPUTED",
          renterResponse: response || null,
        },
      });
      await tx.dispute.update({
        where: { bookingId: id },
        data: { status: action === "ACCEPT" ? "RESOLVED" : "UNDER_REVIEW" },
      });
      if (action === "ACCEPT") {
        await tx.payment.create({
          data: {
            bookingId: id,
            type: "EXTRA_CHARGE",
            amount: claim.estimatedCost,
            status: "SUCCESS",
            method: "Demo Wallet",
          },
        });
        await tx.booking.update({ where: { id }, data: { status: "COMPLETED" } });
      }
      await tx.notification.create({
        data: {
          userId: booking.vehicle.ownerId,
          type: "DISPUTE_UPDATE",
          title: action === "ACCEPT" ? "Damage claim accepted" : "Damage claim disputed",
          body:
            action === "ACCEPT"
              ? "The renter accepted the damage claim and the charge has been processed."
              : "The renter disputed the damage claim. Our team will review the evidence.",
          link: `/booking/${id}/damage`,
        },
      });
    });

    return apiOk({ success: true });
  });
}
