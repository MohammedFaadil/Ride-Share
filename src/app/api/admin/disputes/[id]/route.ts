import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

const VALID_STATUSES = ["OPEN", "UNDER_REVIEW", "WAITING_ON_OWNER", "WAITING_ON_RENTER", "RESOLVED", "ESCALATED"];
const TERMINAL_CANCELLED = ["CANCELLED_BY_RENTER", "CANCELLED_BY_OWNER"];

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/disputes/[id]">) {
  return handleRoute(async () => {
    const admin = await getCurrentUser();
    if (!admin) throw new HttpError("Please log in", 401);
    if (admin.role !== "ADMIN") throw new HttpError("Admins only", 403);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const status = body.status as string;
    const resolution = typeof body.resolution === "string" ? body.resolution.trim() : undefined;

    if (!VALID_STATUSES.includes(status)) throw new HttpError("Invalid status", 422);

    const dispute = await prisma.dispute.findUnique({ where: { id }, include: { booking: true } });
    if (!dispute) throw new HttpError("Dispute not found", 404);

    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id },
        data: {
          status: status as never,
          ...(resolution !== undefined ? { resolution } : {}),
        },
      });

      if (status === "RESOLVED" && !TERMINAL_CANCELLED.includes(dispute.booking.status)) {
        await tx.booking.update({ where: { id: dispute.bookingId }, data: { status: "COMPLETED" } });
      }

      await tx.notification.createMany({
        data: [
          {
            userId: dispute.booking.renterId,
            type: "DISPUTE_UPDATE",
            title: "Dispute update",
            body: `Your dispute status is now "${status.replace(/_/g, " ").toLowerCase()}".`,
            link: `/booking/${dispute.bookingId}`,
          },
        ],
      });
    });

    return apiOk({ success: true });
  });
}
