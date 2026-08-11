import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/reject">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const booking = await prisma.booking.findUnique({ where: { id }, include: { vehicle: true } });
    if (!booking) throw new HttpError("Booking not found", 404);
    if (booking.vehicle.ownerId !== user.id) throw new HttpError("Only the vehicle owner can reject this request", 403);
    if (booking.status !== "REQUESTED") throw new HttpError("This booking can no longer be rejected", 409);

    await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: { status: "OWNER_REJECTED", cancelReason: body.reason ?? "Declined by owner" },
      }),
      prisma.notification.create({
        data: {
          userId: booking.renterId,
          type: "BOOKING_REJECTED",
          title: "Booking request declined",
          body: `Your request for ${booking.vehicle.brand} ${booking.vehicle.model} was declined by the owner.`,
          link: `/booking/${id}`,
        },
      }),
    ]);

    return apiOk({ success: true });
  });
}
