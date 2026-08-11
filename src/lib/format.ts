export function formatINR(amount: number, opts?: { decimals?: boolean }) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: opts?.decimals ? 2 : 0,
  }).format(amount);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDuration(startAt: Date | string, endAt: Date | string) {
  const start = typeof startAt === "string" ? new Date(startAt) : startAt;
  const end = typeof endAt === "string" ? new Date(endAt) : endAt;
  const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (remHours === 0) return `${days} day${days === 1 ? "" : "s"}`;
  return `${days} day${days === 1 ? "" : "s"} ${remHours} hr`;
}

export function timeAgo(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count === 1 ? "" : "s"} ago`;
  }
  return "just now";
}
