import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function GET(_req: Request, ctx: RouteContext<"/api/bookings/[id]">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicle: { include: { owner: true, images: true } },
        renter: true,
        agreement: true,
        payments: true,
        handover: true,
        returnInspection: true,
        damageClaims: true,
        dispute: true,
        reviews: true,
      },
    });

    if (!booking) throw new HttpError("Booking not found", 404);
    const isParty =
      booking.renterId === user.id || booking.vehicle.ownerId === user.id || user.role === "ADMIN";
    if (!isParty) throw new HttpError("You don't have access to this booking", 403);

    return apiOk({ booking });
  });
}
