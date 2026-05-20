export function getSlaStatus(deadline: Date): "ok" | "warning" | "breached" {
  const now = new Date();
  if (now > deadline) return "breached";
  const remaining = deadline.getTime() - now.getTime();
  const total = deadline.getTime() - (deadline.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (remaining < total * 0.5) return "warning";
  return "ok";
}

export function getDaysRemaining(deadline: Date): number {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
