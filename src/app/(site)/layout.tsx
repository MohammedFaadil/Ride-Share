import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  return (
    <>
      <Navbar
        user={
          user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role,
              }
            : null
        }
        city={user?.city ?? undefined}
        unreadCount={unreadCount}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
