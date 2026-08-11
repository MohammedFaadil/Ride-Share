import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

/**
 * Demo payment endpoint — simulates a successful payment instantly. Replace with a real
 * payment gateway (e.g. Razorpay order + webhook confirmation) before accepting real money.
 */
export async function POST(_req: Request, ctx: RouteContext<"/api/bookings/[id]/pay">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const booking = await prisma.booking.findUnique({ where: { id }, include: { vehicle: true } });
    if (!booking) throw new HttpError("Booking not found", 404);
    if (booking.renterId !== user.id) throw new HttpError("Only the renter can pay for this booking", 403);
    if (booking.status !== "OWNER_ACCEPTED") throw new HttpError("This booking is not ready for payment", 409);

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          bookingId: id,
          type: "RENTAL",
          amount: booking.baseFare + booking.platformFee + booking.taxes,
          status: "SUCCESS",
          method: "Demo UPI",
        },
      });
      await tx.payment.create({
        data: {
          bookingId: id,
          type: "DEPOSIT",
          amount: booking.securityDeposit,
          status: "SUCCESS",
          method: "Demo Wallet",
        },
      });
      await tx.rentalAgreement.create({
        data: {
          bookingId: id,
          termsSnapshot: JSON.stringify({
            includedKmPerDay: booking.vehicle.includedKmPerDay,
            includedKmTotal: booking.includedKm,
            extraKmCharge: booking.vehicle.extraKmCharge,
            fuelPolicy: booking.vehicle.fuelPolicy,
            lateFeePerHour: booking.vehicle.lateFeePerHour,
            securityDeposit: booking.securityDeposit,
            minRentalHours: booking.vehicle.minRentalHours,
          }),
        },
      });
      await tx.booking.update({ where: { id }, data: { status: "CONFIRMED" } });
      await tx.notification.createMany({
        data: [
          {
            userId: booking.renterId,
            type: "PAYMENT_SUCCESS",
            title: "Payment successful",
            body: "Your booking is confirmed. Review and sign the rental agreement before pickup.",
            link: `/booking/${id}/agreement`,
          },
          {
            userId: booking.vehicle.ownerId,
            type: "AGREEMENT_READY",
            title: "Booking confirmed",
            body: "Payment received. The rental agreement is ready for signatures.",
            link: `/booking/${id}/agreement`,
          },
        ],
      });
    });

    return apiOk({ success: true });
  });
}
