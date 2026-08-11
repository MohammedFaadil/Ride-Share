import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatNumber } from "@/lib/format";
import { Users as UsersIcon } from "lucide-react";
import { VerifyButton, SuspendToggle } from "./UserActions";

export const dynamic = "force-dynamic";

const VERIFICATION_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  NOT_SUBMITTED: "neutral",
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
};

const VERIFICATION_LABEL: Record<string, string> = {
  NOT_SUBMITTED: "Not submitted",
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatNumber(users.length)} shown &middot; manage KYC and account status.</p>
        </div>
        <form className="w-full sm:w-72" action="/admin/users" method="get">
          <Input name="q" defaultValue={q} placeholder="Search name or email" />
        </form>
      </div>

      {users.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<UsersIcon className="size-6" />} title="No users found" description="Try a different search." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Trust</th>
                <th className="px-4 py-3">Identity</th>
                <th className="px-4 py-3">Licence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} src={u.avatarUrl} size={30} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.name}</p>
                        <p className="truncate text-xs text-[var(--muted)]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{u.city ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={u.role === "ADMIN" ? "dark" : "neutral"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">{u.trustScore}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <Badge tone={VERIFICATION_TONE[u.identityVerified]}>{VERIFICATION_LABEL[u.identityVerified]}</Badge>
                      {u.identityVerified === "PENDING" && (
                        <VerifyButton userId={u.id} action="verify_identity" label="Verify identity" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <Badge tone={VERIFICATION_TONE[u.licenceVerified]}>{VERIFICATION_LABEL[u.licenceVerified]}</Badge>
                      {u.licenceVerified === "PENDING" && (
                        <VerifyButton userId={u.id} action="verify_licence" label="Verify licence" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.suspended ? "danger" : "success"}>{u.suspended ? "Suspended" : "Active"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {u.role === "ADMIN" ? (
                        <span className="text-xs text-[var(--muted-2)]">—</span>
                      ) : (
                        <SuspendToggle userId={u.id} suspended={u.suspended} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
