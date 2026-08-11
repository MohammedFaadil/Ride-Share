import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  city: z.string().min(2, "Select your city"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const vehicleCreateSchema = z.object({
  type: z.enum(["CAR", "BIKE"]),
  category: z.string(),
  brand: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().optional(),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  fuelType: z.enum(["PETROL", "DIESEL", "CNG", "ELECTRIC", "HYBRID"]),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]),
  seats: z.coerce.number().int().min(1).max(10).optional(),
  engineCapacityCc: z.coerce.number().int().optional(),
  registrationNo: z.string().min(4),
  odometerKm: z.coerce.number().int().min(0),
  description: z.string().max(2000).optional(),
  features: z.array(z.string()).default([]),
  pricePerHour: z.coerce.number().positive(),
  pricePerDay: z.coerce.number().positive(),
  pricePerWeek: z.coerce.number().positive(),
  securityDeposit: z.coerce.number().min(0),
  includedKmPerDay: z.coerce.number().int().min(0),
  extraKmCharge: z.coerce.number().min(0),
  minRentalHours: z.coerce.number().int().min(1),
  maxRentalDays: z.coerce.number().int().min(1),
  city: z.string().min(2),
  area: z.string().optional(),
  address: z.string().optional(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  images: z.array(z.string()).default([]),
});

export const bookingCreateSchema = z
  .object({
    vehicleId: z.string(),
    startAt: z.string(),
    endAt: z.string(),
  })
  .refine((d) => new Date(d.endAt) > new Date(d.startAt), {
    message: "Return time must be after pickup time",
    path: ["endAt"],
  });

export const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const damageClaimSchema = z.object({
  bookingId: z.string(),
  description: z.string().min(10, "Please describe the damage in more detail"),
  estimatedCost: z.coerce.number().min(0),
  evidenceUrls: z.array(z.string()).default([]),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.string(),
  subject: z.string().min(3),
  message: z.string().min(10),
});
