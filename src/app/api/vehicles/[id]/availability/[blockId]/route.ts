import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/vehicles/[id]/availability/[blockId]">
) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const { id, blockId } = await ctx.params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new HttpError("Vehicle not found", 404);
    if (vehicle.ownerId !== user.id) throw new HttpError("You don't own this vehicle", 403);

    await prisma.availabilityBlock.delete({ where: { id: blockId } });
    return apiOk({ success: true });
  });
}
