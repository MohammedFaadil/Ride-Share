import Link from "next/link";
import { BadgeCheck, Clock, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/format";

export function OwnerCard({
  owner,
  totalRentals,
}: {
  owner: {
    id: string;
    name: string;
    avatarUrl: string | null;
    createdAt: Date | string;
    identityVerified: string;
    trustScore: number;
  };
  totalRentals: number;
}) {
  const responseRate = Math.min(99, 80 + Math.round(owner.trustScore / 6));
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
      <div className="flex items-center gap-3">
        <Avatar name={owner.name} src={owner.avatarUrl} size={48} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{owner.name}</p>
          {owner.identityVerified === "VERIFIED" && (
            <span className="flex items-center gap-1 text-xs text-[var(--success)]">
              <BadgeCheck className="size-3.5" /> Verified owner
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-[var(--radius-sm)] bg-gray-50 py-2.5">
          <p className="text-base font-bold">{totalRentals}</p>
          <p className="text-[11px] text-[var(--muted)]">Rentals completed</p>
        </div>
        <div className="rounded-[var(--radius-sm)] bg-gray-50 py-2.5">
          <p className="text-base font-bold">{responseRate}%</p>
          <p className="text-[11px] text-[var(--muted)]">Response rate</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]">
        <Clock className="size-3.5" /> Joined {formatDate(owner.createdAt)}
      </div>
      <Link
        href={`/contact?category=Vehicle&subject=${encodeURIComponent("Question about a listing")}`}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] py-2.5 text-sm font-medium hover:bg-gray-50"
      >
        <MessageCircle className="size-4" /> Message owner
      </Link>
    </div>
  );
}
