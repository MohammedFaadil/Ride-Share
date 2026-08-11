import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { damageClaimSchema } from "@/lib/validators";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]/damage">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = damageClaimSchema.safeParse({ ...body, bookingId: id });
    if (!parsed.success) throw new HttpError(parsed.error.issues[0]?.message ?? "Invalid input", 422);

    const booking = await prisma.booking.findUnique({ where: { id }, include: { vehicle: true } });
    if (!booking) throw new HttpError("Booking not found", 404);
    if (booking.vehicle.ownerId !== user.id) throw new HttpError("Only the vehicle owner can report damage", 403);
    if (!["ACTIVE", "RETURN_PENDING", "COMPLETED"].includes(booking.status)) {
      throw new HttpError("Damage can only be reported after the rental has started", 409);
    }

    const claim = await prisma.$transaction(async (tx) => {
      const created = await tx.damageClaim.create({
        data: {
          bookingId: id,
          description: parsed.data.description,
          estimatedCost: parsed.data.estimatedCost,
          evidenceUrls: JSON.stringify(parsed.data.evidenceUrls),
          status: "RENTER_NOTIFIED",
        },
      });
      await tx.booking.update({ where: { id }, data: { status: "DISPUTED" } });
      await tx.dispute.upsert({
        where: { bookingId: id },
        create: {
          bookingId: id,
          category: "Vehicle damage",
          description: parsed.data.description,
          status: "WAITING_ON_RENTER",
        },
        update: { status: "WAITING_ON_RENTER" },
      });
      await tx.notification.create({
        data: {
          userId: booking.renterId,
          type: "DAMAGE_CLAIM",
          title: "Damage reported on your rental",
          body: `The owner reported damage on ${booking.vehicle.brand} ${booking.vehicle.model}. Review the claim and respond.`,
          link: `/booking/${id}/damage`,
        },
      });
      return created;
    });

    return apiOk({ id: claim.id });
  });
}
