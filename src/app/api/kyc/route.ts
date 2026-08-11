import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

const DOC_TO_FIELD: Record<string, "identityVerified" | "licenceVerified"> = {
  AADHAAR: "identityVerified",
  PAN: "identityVerified",
  DRIVING_LICENCE: "licenceVerified",
};

/**
 * Demo KYC submission — records that a document was submitted and marks it PENDING
 * for admin review. No real identity-verification provider is called; nothing here
 * should be presented to users as a completed government verification.
 */
export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const body = await req.json();
    const type = body.type as string;
    if (!DOC_TO_FIELD[type]) throw new HttpError("Unsupported document type", 422);

    const field = DOC_TO_FIELD[type];

    await prisma.$transaction([
      prisma.document.create({
        data: {
          userId: user.id,
          type: type as never,
          fileUrl: `/demo/kyc/${type.toLowerCase()}-${user.id}.jpg`,
          status: "PENDING",
        },
      }),
      prisma.user.update({ where: { id: user.id }, data: { [field]: "PENDING" } }),
    ]);

    return apiOk({ success: true });
  });
}
