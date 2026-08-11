import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { bookingCreateSchema } from "@/lib/validators";
import { computeBookingPrice } from "@/lib/pricing";
import { apiOk, handleRoute, HttpError } from "@/lib/api";

// Active/blocking booking statuses that prevent overlapping bookings on the same vehicle
const BLOCKING_STATUSES = [
  "REQUESTED",
  "OWNER_ACCEPTED",
  "CONFIRMED",
  "HANDOVER_PENDING",
  "ACTIVE",
  "RETURN_PENDING",
] as const;

export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in to book a vehicle", 401);

    const body = await req.json();
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }
    const { vehicleId, startAt, endAt } = parsed.data;
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
      throw new HttpError("Pickup time cannot be in the past", 422);
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || vehicle.status !== "ACTIVE") {
      throw new HttpError("This vehicle is not available for booking", 404);
    }
    if (vehicle.ownerId === user.id) {
      throw new HttpError("You can't book your own vehicle", 400);
    }

    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 3600000));
    if (hours < vehicle.minRentalHours) {
      throw new HttpError(`Minimum rental duration is ${vehicle.minRentalHours} hours`, 422);
    }
    if (hours > vehicle.maxRentalDays * 24) {
      throw new HttpError(`Maximum rental duration is ${vehicle.maxRentalDays} days`, 422);
    }

    // Prevent double-booking: check for overlapping active/blocking bookings on this vehicle,
    // using a transaction so the check-then-create is atomic under concurrent requests.
    const booking = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.booking.findFirst({
        where: {
          vehicleId,
          status: { in: [...BLOCKING_STATUSES] },
          AND: [{ startAt: { lt: end } }, { endAt: { gt: start } }],
        },
      });
      if (overlapping) {
        throw new HttpError("This vehicle is already booked for the selected time window", 409);
      }

      const blocked = await tx.availabilityBlock.findFirst({
        where: {
          vehicleId,
          AND: [{ startAt: { lt: end } }, { endAt: { gt: start } }],
        },
      });
      if (blocked) {
        throw new HttpError("The owner has blocked this vehicle for the selected dates", 409);
      }

      const price = computeBookingPrice(vehicle, start, end);

      const created = await tx.booking.create({
        data: {
          vehicleId,
          renterId: user.id,
          startAt: start,
          endAt: end,
          rentalUnit: price.rentalUnit,
          baseFare: price.baseFare,
          platformFee: price.platformFee,
          taxes: price.taxes,
          securityDeposit: price.securityDeposit,
          totalPayable: price.totalPayable,
          includedKm: price.includedKm,
          extraKmCharge: price.extraKmCharge,
          status: "REQUESTED",
        },
      });

      await tx.notification.create({
        data: {
          userId: vehicle.ownerId,
          type: "BOOKING_REQUEST",
          title: "New booking request",
          body: `${user.name} requested to book your ${vehicle.brand} ${vehicle.model}.`,
          link: `/booking/${created.id}`,
        },
      });

      return created;
    });

    return apiOk({ id: booking.id });
  });
}

export async function GET() {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) throw new HttpError("Please log in", 401);

    const bookings = await prisma.booking.findMany({
      where: { renterId: user.id },
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });

    return apiOk({ bookings });
  });
}
