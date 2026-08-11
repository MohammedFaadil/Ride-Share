import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validators";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/review">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = reviewSchema.safeParse({ ...body, bookingId: id });
    if (!parsed.success) throw new HttpError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const booking = await prisma.booking.findUnique({ where: { id }, include: { vehicle: true } });
    if (!booking) throw new HttpError("Booking not found", 404);
    if (!["COMPLETED", "DISPUTED"].includes(booking.status)) {
      throw new HttpError("Reviews can only be submitted after the rental is complete", 409);
    }

    const isRenter = booking.renterId === user.id;
    const isOwner = booking.vehicle.ownerId === user.id;
    if (!isRenter && !isOwner) throw new HttpError("You don't have access to this booking", 403);

    const type = isRenter ? "RENTER_TO_OWNER" : "OWNER_TO_RENTER";
    const targetUserId = isRenter ? booking.vehicle.ownerId : booking.renterId;

    const existing = await prisma.review.findFirst({ where: { bookingId: id, authorId: user.id, type } });
    if (existing) throw new HttpError("You've already reviewed this rental", 409);

    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          bookingId: id,
          authorId: user.id,
          targetUserId,
          vehicleId: isRenter ? booking.vehicleId : undefined,
          type,
          rating: parsed.data.rating,
          comment: parsed.data.comment,
        },
      });

      if (isRenter) {
        const agg = await tx.review.aggregate({
          where: { vehicleId: booking.vehicleId, type: "RENTER_TO_OWNER" },
          _avg: { rating: true },
          _count: true,
        });
        await tx.vehicle.update({
          where: { id: booking.vehicleId },
          data: { ratingAvg: agg._avg.rating ?? parsed.data.rating, ratingCount: agg._count },
        });
      }

      await tx.notification.create({
        data: {
          userId: targetUserId,
          type: "GENERAL",
          title: "You received a new review",
          body: `${user.name} left you a ${parsed.data.rating}-star review.`,
          link: `/booking/${id}`,
        },
      });
    });

    return apiOk({ success: true });
  });
}
