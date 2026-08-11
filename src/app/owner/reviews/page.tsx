import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OwnerReviewsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const reviews = await prisma.review.findMany({
    where: { targetUserId: user.id, type: "RENTER_TO_OWNER" },
    include: { author: true, vehicle: true },
    orderBy: { createdAt: "desc" },
  });

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        {reviews.length > 0 && <RatingStars value={avg} count={reviews.length} size={16} />}
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">What renters are saying about you and your vehicles.</p>

      {reviews.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={<Star className="size-6" />} title="No reviews yet" description="Reviews from renters will appear here after completed rentals." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
              <Avatar name={r.author.name} src={r.author.avatarUrl} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{r.author.name}</p>
                  <span className="text-xs text-[var(--muted-2)]">{timeAgo(r.createdAt)}</span>
                </div>
                <RatingStars value={r.rating} showValue={false} size={13} />
                {r.vehicle && <p className="mt-1 text-xs text-[var(--muted)]">{r.vehicle.brand} {r.vehicle.model}</p>}
                {r.comment && <p className="mt-1.5 text-sm text-[var(--muted)]">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
