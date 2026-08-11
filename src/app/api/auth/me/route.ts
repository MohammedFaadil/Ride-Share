import { getCurrentUser } from "@/lib/auth";
import { apiOk, handleRoute } from "@/lib/api";

export async function GET() {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (!user) return apiOk({ user: null });
    return apiOk({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        avatarUrl: user.avatarUrl,
        identityVerified: user.identityVerified,
        licenceVerified: user.licenceVerified,
      },
    });
  });
}
