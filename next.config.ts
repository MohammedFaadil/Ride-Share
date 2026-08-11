import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dashboard/owner/admin sidebars all put a logout button in the
  // bottom-left corner — that's exactly where Next's dev-mode route
  // indicator sits by default, so it visually collides with (and sits on
  // top of) real UI. Dev-only; has no effect on production builds.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
