import { clearSessionCookie } from "@/lib/auth";
import { apiOk, handleRoute } from "@/lib/api";

export async function POST() {
  return handleRoute(async () => {
    await clearSessionCookie();
    return apiOk({ success: true });
  });
}
