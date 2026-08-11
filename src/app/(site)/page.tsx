import Link from "next/link";
import {
  ShieldCheck,
  Wallet,
  Clock,
  Car,
  Bike,
  ArrowRight,
  FileCheck2,
  Handshake,
  KeyRound,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { HeroSearch } from "@/components/home/HeroSearch";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { Button } from "@/components/ui/Button";
import { CAR_CATEGORIES, BIKE_CATEGORIES, CITIES, APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const city = user?.city ?? "Chennai";

  const [featured, favoriteIds, totalVehicles, totalCities, totalRentals] = await Promise.all([
    prisma.vehicle.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ ratingAvg: "desc" }, { totalRentals: "desc" }],
      take: 8,
    }),
    user
      ? prisma.favorite.findMany({ where: { userId: user.id }, select: { vehicleId: true } })
      : Promise.resolve([]),
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    Promise.resolve(CITIES.length),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
  ]);

  const favoriteSet = new Set(favoriteIds.map((f) => f.vehicleId));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-gray-50 to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.06), transparent 40%), radial-gradient(circle at 80% 0%, rgba(20,22,26,0.05), transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--muted)]">
              <ShieldCheck className="size-3.5 text-[var(--success)]" />
              Verified owners &amp; renters across India
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Rent a car or bike
              <br />
              from people near you.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-[var(--muted)] sm:text-lg">
              Find verified vehicles, flexible rental periods, and transparent
              pricing wherever you need to go.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <HeroSearch />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[var(--muted)]">
            <span>{totalVehicles}+ vehicles listed</span>
            <span className="hidden sm:inline text-[var(--border-strong)]">•</span>
            <span>{totalCities} cities</span>
            <span className="hidden sm:inline text-[var(--border-strong)]">•</span>
            <span>{totalRentals}+ completed rentals</span>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ValueProp
              icon={<ShieldCheck className="size-5" />}
              title="Verified &amp; insured"
              description="Identity checks, vehicle documents, and digital agreements for every rental."
            />
            <ValueProp
              icon={<Wallet className="size-5" />}
              title="Transparent pricing"
              description="See the full breakdown upfront — no hidden fees, ever."
            />
            <ValueProp
              icon={<Clock className="size-5" />}
              title="Flexible durations"
              description="Rent by the hour, day, or week — whatever your trip needs."
            />
          </div>
        </div>
      </section>

      {/* Category quick links */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Browse by category</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Find exactly the kind of vehicle you need</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[...CAR_CATEGORIES.slice(0, 3), ...BIKE_CATEGORIES.slice(0, 3)].map((cat) => (
            <Link
              key={cat.value}
              href={`/explore?category=${cat.value}`}
              className="group flex flex-col items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 text-center transition-all hover:border-[var(--primary)] hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-gray-100 text-[var(--foreground)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                {CAR_CATEGORIES.some((c) => c.value === cat.value) ? (
                  <Car className="size-5" />
                ) : (
                  <Bike className="size-5" />
                )}
              </div>
              <span className="text-sm font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured vehicles */}
      <section className="border-t border-[var(--border)] bg-gray-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Popular vehicles near {city}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Highly rated, frequently booked vehicles</p>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:underline">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                favorited={favoriteSet.has(v.id)}
                isAuthenticated={!!user}
              />
            ))}
          </div>
          <div className="mt-8 flex justify-center sm:hidden">
            <Button href="/explore" variant="secondary">
              View all vehicles
            </Button>
          </div>
        </div>
      </section>

      {/* How it works teaser */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold tracking-tight">How renting works</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">From search to return, in four simple steps</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Step number={1} icon={<Car className="size-5" />} title="Search & select">
            Find a vehicle near you and check availability for your dates.
          </Step>
          <Step number={2} icon={<FileCheck2 className="size-5" />} title="Verify & request">
            Complete quick identity verification and send a booking request.
          </Step>
          <Step number={3} icon={<KeyRound className="size-5" />} title="Pick up & drive">
            Sign the digital agreement, complete handover, and drive off.
          </Step>
          <Step number={4} icon={<Handshake className="size-5" />} title="Return & review">
            Return the vehicle, settle any extras, and rate your experience.
          </Step>
        </div>
        <div className="mt-10 flex justify-center">
          <Button href="/how-it-works" variant="secondary">
            Learn more about how it works
          </Button>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--primary)] px-6 py-14 sm:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-lg">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <Star className="size-3 fill-current" /> For vehicle owners
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                Turn your idle car or bike into income.
              </h2>
              <p className="mt-3 text-sm text-white/70 sm:text-base">
                List your vehicle on {APP_NAME}, set your own price and availability,
                and start earning from renters near you — with owner-controlled
                approval on every request.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button href="/list-vehicle" size="lg" variant="secondary" className="!bg-white">
                List your vehicle
              </Button>
              <Button href="/how-it-works#owners" size="lg" variant="ghost" className="!text-white hover:!bg-white/10">
                See how it works
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueProp({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  children,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
      <span className="absolute right-5 top-5 text-2xl font-bold text-gray-100">
        0{number}
      </span>
      <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--muted)]">{children}</p>
    </div>
  );
}
