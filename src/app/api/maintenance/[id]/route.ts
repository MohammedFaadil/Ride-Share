import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function PATCH(_req: Request, ctx: RouteContext<"/api/maintenance/[id]">) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id } = await ctx.params;
    const log = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!log || log.vehicle.ownerId !== user.id) throw new HttpError("Not found", 404);

    const updated = await prisma.maintenanceLog.update({ where: { id }, data: { completedAt: new Date() } });
    return apiOk({ log: updated });
  });
}
