import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

type Action = "verify_identity" | "verify_licence" | "suspend" | "unsuspend";

// Document types that back each verification field — mirrors src/app/api/kyc/route.ts
const IDENTITY_DOC_TYPES = ["AADHAAR", "PAN"] as const;
const LICENCE_DOC_TYPES = ["DRIVING_LICENCE"] as const;

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/users/[id]">) {
  return handleRoute(async () => {
    const admin = await getCurrentUser();
    if (!admin) throw new HttpError("Please log in", 401);
    if (admin.role !== "ADMIN") throw new HttpError("Admins only", 403);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const action = body.action as Action;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) throw new HttpError("User not found", 404);

    switch (action) {
      case "verify_identity": {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({ where: { id }, data: { identityVerified: "VERIFIED" } });
          const doc = await tx.document.findFirst({
            where: { userId: id, type: { in: [...IDENTITY_DOC_TYPES] }, status: "PENDING" },
            orderBy: { createdAt: "desc" },
          });
          if (doc) await tx.document.update({ where: { id: doc.id }, data: { status: "VERIFIED" } });
          await tx.notification.create({
            data: {
              userId: id,
              type: "KYC_UPDATE",
              title: "Identity verified",
              body: "Your identity documents have been verified by our team.",
              link: "/dashboard/profile",
            },
          });
        });
        break;
      }
      case "verify_licence": {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({ where: { id }, data: { licenceVerified: "VERIFIED" } });
          const doc = await tx.document.findFirst({
            where: { userId: id, type: { in: [...LICENCE_DOC_TYPES] }, status: "PENDING" },
            orderBy: { createdAt: "desc" },
          });
          if (doc) await tx.document.update({ where: { id: doc.id }, data: { status: "VERIFIED" } });
          await tx.notification.create({
            data: {
              userId: id,
              type: "KYC_UPDATE",
              title: "Driving licence verified",
              body: "Your driving licence has been verified by our team.",
              link: "/dashboard/profile",
            },
          });
        });
        break;
      }
      case "suspend": {
        if (target.role === "ADMIN") throw new HttpError("Cannot suspend another admin", 400);
        await prisma.user.update({ where: { id }, data: { suspended: true } });
        break;
      }
      case "unsuspend": {
        await prisma.user.update({ where: { id }, data: { suspended: false } });
        break;
      }
      default:
        throw new HttpError("Unsupported action", 422);
    }

    return apiOk({ success: true });
  });
}
