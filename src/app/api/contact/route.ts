import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { contactSchema } from "@/lib/validators";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }
    const { name, email, phone, category, subject, message } = parsed.data;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user?.id ?? null,
        name,
        email,
        phone: phone || null,
        category,
        subject,
        message,
      },
    });

    return apiOk({ id: ticket.id });
  });
}
