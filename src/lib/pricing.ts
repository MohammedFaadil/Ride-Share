import { PLATFORM_FEE_RATE, GST_RATE, FUEL_PRICE_ESTIMATE } from "@/lib/constants";

export type VehicleForPricing = {
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  securityDeposit: number;
  includedKmPerDay: number;
  extraKmCharge: number;
};

export interface BookingPriceBreakdown {
  hours: number;
  days: number;
  rentalUnit: "HOUR" | "DAY" | "WEEK";
  baseFare: number;
  platformFee: number;
  taxes: number;
  securityDeposit: number;
  totalPayable: number;
  includedKm: number;
  extraKmCharge: number;
}

/**
 * Computes the rental price for a given vehicle and time window.
 * Picks the cheapest applicable rate: weekly > daily > hourly, based on duration,
 * mirroring how real rental marketplaces discount longer bookings.
 */
export function computeBookingPrice(
  vehicle: VehicleForPricing,
  startAt: Date,
  endAt: Date
): BookingPriceBreakdown {
  const ms = endAt.getTime() - startAt.getTime();
  const hours = Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
  const days = Math.ceil(hours / 24);

  let baseFare: number;
  let rentalUnit: BookingPriceBreakdown["rentalUnit"];

  if (hours <= 24) {
    // Compare hourly vs daily rate, use whichever is cheaper
    const hourly = hours * vehicle.pricePerHour;
    baseFare = Math.min(hourly, vehicle.pricePerDay);
    rentalUnit = hourly <= vehicle.pricePerDay ? "HOUR" : "DAY";
  } else if (days < 7) {
    baseFare = days * vehicle.pricePerDay;
    rentalUnit = "DAY";
  } else {
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    baseFare = weeks * vehicle.pricePerWeek + remDays * vehicle.pricePerDay;
    rentalUnit = "WEEK";
  }

  baseFare = Math.round(baseFare);
  const platformFee = Math.round(baseFare * PLATFORM_FEE_RATE);
  const taxes = Math.round(platformFee * GST_RATE);
  const includedKm = vehicle.includedKmPerDay * Math.max(1, days);
  const totalPayable = baseFare + platformFee + taxes + vehicle.securityDeposit;

  return {
    hours,
    days,
    rentalUnit,
    baseFare,
    platformFee,
    taxes,
    securityDeposit: vehicle.securityDeposit,
    totalPayable,
    includedKm,
    extraKmCharge: vehicle.extraKmCharge,
  };
}

export interface PriceRecommendationInput {
  category: string;
  fuelType: string;
  transmission: string;
  year: number;
  city: string;
  ratingAvg?: number;
}

export interface PriceRecommendation {
  recommendedDaily: number;
  minDaily: number;
  maxDaily: number;
  recommendedHourly: number;
  recommendedWeekly: number;
  explanation: string;
  factors: { label: string; impact: string }[];
}

const CATEGORY_BASE_DAILY: Record<string, number> = {
  HATCHBACK: 1400,
  SEDAN: 1800,
  SUV: 2400,
  MUV: 2600,
  LUXURY: 5500,
  ELECTRIC_CAR: 2200,
  SCOOTER: 350,
  COMMUTER_BIKE: 400,
  SPORTS_BIKE: 900,
  CRUISER_BIKE: 1100,
  ADVENTURE_BIKE: 1300,
  ELECTRIC_BIKE: 450,
};

const CITY_DEMAND_MULTIPLIER: Record<string, number> = {
  Mumbai: 1.18,
  Bengaluru: 1.15,
  Delhi: 1.12,
  Hyderabad: 1.05,
  Pune: 1.04,
  Chennai: 1.0,
  Kolkata: 0.95,
  Ahmedabad: 0.92,
};

/**
 * Deterministic, explainable heuristic pricing model — a stand-in "recommendation
 * engine" until a real market-data-driven pricing service is connected. Never
 * presented to owners as a mandatory price; always overridable.
 */
export function recommendPrice(input: PriceRecommendationInput): PriceRecommendation {
  const base = CATEGORY_BASE_DAILY[input.category] ?? 1500;
  const cityMultiplier = CITY_DEMAND_MULTIPLIER[input.city] ?? 1;

  const age = Math.max(0, new Date().getFullYear() - input.year);
  const ageDepreciation = Math.max(0.72, 1 - age * 0.035);

  const transmissionBump = input.transmission === "AUTOMATIC" ? 1.08 : 1;
  const fuelBump = input.fuelType === "ELECTRIC" ? 1.06 : input.fuelType === "DIESEL" ? 1.03 : 1;
  const ratingBump = input.ratingAvg && input.ratingAvg >= 4.7 ? 1.05 : 1;

  const recommendedDaily = Math.round(
    (base * cityMultiplier * ageDepreciation * transmissionBump * fuelBump * ratingBump) / 10
  ) * 10;

  const minDaily = Math.round((recommendedDaily * 0.88) / 10) * 10;
  const maxDaily = Math.round((recommendedDaily * 1.15) / 10) * 10;
  const recommendedHourly = Math.round(recommendedDaily / 7);
  const recommendedWeekly = Math.round((recommendedDaily * 5.7) / 10) * 10;

  const factors: { label: string; impact: string }[] = [
    { label: `${input.city} demand`, impact: cityMultiplier >= 1 ? `+${Math.round((cityMultiplier - 1) * 100)}%` : `${Math.round((cityMultiplier - 1) * 100)}%` },
    { label: `Vehicle age (${age} yrs)`, impact: `${Math.round((ageDepreciation - 1) * 100)}%` },
  ];
  if (transmissionBump > 1) factors.push({ label: "Automatic transmission", impact: "+8%" });
  if (fuelBump > 1) factors.push({ label: `${input.fuelType.toLowerCase()} premium`, impact: `+${Math.round((fuelBump - 1) * 100)}%` });
  if (ratingBump > 1) factors.push({ label: "High rating (4.7+)", impact: "+5%" });

  return {
    recommendedDaily,
    minDaily,
    maxDaily,
    recommendedHourly,
    recommendedWeekly,
    explanation: `Similar ${input.category.toLowerCase().replace("_", " ")} vehicles in ${input.city} are currently listed between ₹${minDaily.toLocaleString("en-IN")}–₹${maxDaily.toLocaleString("en-IN")}/day.`,
    factors,
  };
}

export function fuelPriceEstimate(fuelType: string) {
  return FUEL_PRICE_ESTIMATE[fuelType] ?? FUEL_PRICE_ESTIMATE.PETROL;
}
