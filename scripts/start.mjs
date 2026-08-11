// Cross-platform production start script.
// `next start` does not read process.env.PORT on its own — it needs an
// explicit `-p <port>`. Render (and most PaaS platforms) set PORT at runtime,
// so this resolves it in plain Node instead of relying on shell-specific
// `${PORT:-3000}` syntax, which cmd.exe (Windows) can't parse.
import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";

const child = spawn("npx", ["next", "start", "-p", port], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => process.exit(code ?? 0));
