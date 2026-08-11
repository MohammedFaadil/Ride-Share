import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(_req: Request, ctx: RouteContext<"/api/bookings/[id]/accept">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const booking = await prisma.booking.findUnique({ where: { id }, include: { vehicle: true, renter: true } });
    if (!booking) throw new HttpError("Booking not found", 404);
    if (booking.vehicle.ownerId !== user.id) throw new HttpError("Only the vehicle owner can accept this request", 403);
    if (booking.status !== "REQUESTED") throw new HttpError("This booking can no longer be accepted", 409);

    await prisma.$transaction([
      prisma.booking.update({ where: { id }, data: { status: "OWNER_ACCEPTED" } }),
      prisma.notification.create({
        data: {
          userId: booking.renterId,
          type: "BOOKING_ACCEPTED",
          title: "Booking request accepted",
          body: `${booking.vehicle.brand} ${booking.vehicle.model} is reserved for you. Complete payment to confirm.`,
          link: `/booking/${id}`,
        },
      }),
    ]);

    return apiOk({ success: true });
  });
}
