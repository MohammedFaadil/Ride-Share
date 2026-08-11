import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

/**
 * Demo e-signature: records a timestamped "I agree" click. Not a legally binding
 * digital signature — replace with a compliant e-sign provider before production use.
 */
export async function POST(_req: Request, ctx: RouteContext<"/api/bookings/[id]/sign">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true, agreement: true },
    });
    if (!booking) throw new HttpError("Booking not found", 404);
    if (!booking.agreement) throw new HttpError("Agreement not yet generated for this booking", 409);

    const isRenter = booking.renterId === user.id;
    const isOwner = booking.vehicle.ownerId === user.id;
    if (!isRenter && !isOwner) throw new HttpError("You don't have access to this booking", 403);

    const updated = await prisma.rentalAgreement.update({
      where: { bookingId: id },
      data: isRenter ? { renterSignedAt: new Date() } : { ownerSignedAt: new Date() },
    });

    if (updated.renterSignedAt && updated.ownerSignedAt && booking.status === "CONFIRMED") {
      await prisma.booking.update({ where: { id }, data: { status: "HANDOVER_PENDING" } });
    }

    return apiOk({ success: true, agreement: updated });
  });
}
