import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

type Action = "approve" | "reject" | "suspend" | "reactivate";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/vehicles/[id]">) {
  return handleRoute(async () => {
    const admin = await getCurrentUser();
    if (!admin) throw new HttpError("Please log in", 401);
    if (admin.role !== "ADMIN") throw new HttpError("Admins only", 403);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const action = body.action as Action;
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new HttpError("Vehicle not found", 404);

    switch (action) {
      case "approve": {
        await prisma.vehicle.update({ where: { id }, data: { status: "ACTIVE", verified: true } });
        await prisma.notification.create({
          data: {
            userId: vehicle.ownerId,
            type: "GENERAL",
            title: "Listing approved",
            body: `Your listing for ${vehicle.brand} ${vehicle.model} is now live on Roamly.`,
            link: `/owner/vehicles/${vehicle.id}`,
          },
        });
        break;
      }
      case "reject": {
        await prisma.vehicle.update({ where: { id }, data: { status: "REJECTED", verified: false } });
        await prisma.notification.create({
          data: {
            userId: vehicle.ownerId,
            type: "GENERAL",
            title: "Listing rejected",
            body: reason
              ? `Your listing for ${vehicle.brand} ${vehicle.model} was rejected. Reason: ${reason}`
              : `Your listing for ${vehicle.brand} ${vehicle.model} was rejected by our review team.`,
            link: `/owner/vehicles/${vehicle.id}`,
          },
        });
        break;
      }
      case "suspend": {
        await prisma.vehicle.update({ where: { id }, data: { status: "SUSPENDED" } });
        await prisma.notification.create({
          data: {
            userId: vehicle.ownerId,
            type: "GENERAL",
            title: "Listing suspended",
            body: reason
              ? `Your listing for ${vehicle.brand} ${vehicle.model} has been suspended. Reason: ${reason}`
              : `Your listing for ${vehicle.brand} ${vehicle.model} has been suspended by our review team.`,
            link: `/owner/vehicles/${vehicle.id}`,
          },
        });
        break;
      }
      case "reactivate": {
        await prisma.vehicle.update({ where: { id }, data: { status: "ACTIVE" } });
        break;
      }
      default:
        throw new HttpError("Unsupported action", 422);
    }

    return apiOk({ success: true });
  });
}
