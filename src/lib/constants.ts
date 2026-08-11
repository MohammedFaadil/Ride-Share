export const APP_NAME = "Roamly";
export const APP_TAGLINE = "Rent a car or bike from people near you.";

export const PLATFORM_FEE_RATE = 0.08; // 8% platform fee on rentals
export const GST_RATE = 0.18; // 18% GST on platform fee (Indian tax convention)
export const OWNER_COMMISSION_RATE = 0.12; // 12% commission owners pay platform

export const CITIES = [
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
] as const;

export const CAR_CATEGORIES = [
  { value: "HATCHBACK", label: "Hatchback" },
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "MUV", label: "MUV" },
  { value: "LUXURY", label: "Luxury" },
  { value: "ELECTRIC_CAR", label: "Electric" },
] as const;

export const BIKE_CATEGORIES = [
  { value: "SCOOTER", label: "Scooter" },
  { value: "COMMUTER_BIKE", label: "Commuter" },
  { value: "SPORTS_BIKE", label: "Sports" },
  { value: "CRUISER_BIKE", label: "Cruiser" },
  { value: "ADVENTURE_BIKE", label: "Adventure" },
  { value: "ELECTRIC_BIKE", label: "Electric" },
] as const;

export const ALL_CATEGORIES = [...CAR_CATEGORIES, ...BIKE_CATEGORIES];

export function categoryLabel(value: string) {
  return ALL_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const FUEL_TYPES = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
  { value: "CNG", label: "CNG" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "HYBRID", label: "Hybrid" },
] as const;

export const TRANSMISSIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
] as const;

export const CAR_FEATURES = [
  "Air Conditioning",
  "Bluetooth",
  "GPS Navigation",
  "USB Charging",
  "Android Auto",
  "Apple CarPlay",
  "Reverse Camera",
  "Sunroof",
  "Child Seat",
  "Luggage Space",
  "Music System",
  "Cruise Control",
];

export const BIKE_FEATURES = [
  "Helmet Included",
  "USB Charging",
  "Under-seat Storage",
  "Digital Console",
  "Anti-lock Braking",
  "Bluetooth Connectivity",
  "Mobile Holder",
  "Saree Guard",
];

export const CAR_BRANDS = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata",
  "Mahindra",
  "Toyota",
  "Honda",
  "Kia",
  "MG",
  "Volkswagen",
  "Skoda",
];

export const BIKE_BRANDS = [
  "Royal Enfield",
  "Honda",
  "TVS",
  "Bajaj",
  "Yamaha",
  "KTM",
  "Suzuki",
  "Ather",
  "Ola Electric",
];

export const FUEL_PRICE_ESTIMATE: Record<string, number> = {
  PETROL: 103.5,
  DIESEL: 90.2,
  CNG: 76.4,
  ELECTRIC: 9.5, // per unit equivalent estimate
  HYBRID: 103.5,
};

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Requested",
  OWNER_ACCEPTED: "Accepted — Payment Pending",
  OWNER_REJECTED: "Rejected",
  CONFIRMED: "Confirmed",
  HANDOVER_PENDING: "Ready for Pickup",
  ACTIVE: "Active",
  RETURN_PENDING: "Return Pending",
  COMPLETED: "Completed",
  CANCELLED_BY_RENTER: "Cancelled by Renter",
  CANCELLED_BY_OWNER: "Cancelled by Owner",
  DISPUTED: "Disputed",
};

export const BOOKING_STATUS_TONE: Record<
  string,
  "success" | "warning" | "danger" | "neutral" | "info"
> = {
  REQUESTED: "warning",
  OWNER_ACCEPTED: "info",
  OWNER_REJECTED: "danger",
  CONFIRMED: "info",
  HANDOVER_PENDING: "info",
  ACTIVE: "success",
  RETURN_PENDING: "warning",
  COMPLETED: "neutral",
  CANCELLED_BY_RENTER: "danger",
  CANCELLED_BY_OWNER: "danger",
  DISPUTED: "danger",
};

export const VEHICLE_GRADIENTS = [
  "from-slate-700 to-slate-900",
  "from-blue-600 to-slate-900",
  "from-emerald-600 to-slate-900",
  "from-rose-500 to-slate-900",
  "from-amber-500 to-slate-900",
  "from-indigo-600 to-slate-900",
  "from-teal-500 to-slate-900",
  "from-violet-600 to-slate-900",
];

export function gradientForVehicle(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return VEHICLE_GRADIENTS[hash % VEHICLE_GRADIENTS.length];
}
