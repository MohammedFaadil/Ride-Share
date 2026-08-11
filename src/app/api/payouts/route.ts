import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";
import { OWNER_COMMISSION_RATE } from "@/lib/constants";

/**
 * Demo payout endpoint — instantly "pays out" the owner's available balance to a
 * simulated bank account. Replace with a real payout rail (e.g. Razorpay Route)
 * before handling real money.
 */
export async function POST() {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const vehicleIds = (await prisma.vehicle.findMany({ where: { ownerId: user.id }, select: { id: true } })).map((v) => v.id);

    const [earnings, payouts] = await Promise.all([
      prisma.payment.aggregate({
        where: { booking: { vehicleId: { in: vehicleIds } }, type: { in: ["RENTAL", "EXTRA_CHARGE"] }, status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.payout.aggregate({ where: { ownerId: user.id }, _sum: { amount: true } }),
    ]);

    const netEarnings = Math.round((earnings._sum.amount ?? 0) * (1 - OWNER_COMMISSION_RATE));
    const alreadyPaidOut = payouts._sum.amount ?? 0;
    const available = netEarnings - alreadyPaidOut;

    if (available <= 0) throw new HttpError("No available balance to withdraw", 400);

    const payout = await prisma.payout.create({
      data: { ownerId: user.id, amount: available, status: "COMPLETED" },
    });

    return apiOk({ payout });
  });
}
