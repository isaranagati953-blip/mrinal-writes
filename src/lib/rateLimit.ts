const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000  // 15 minutes
): { limited: boolean; remaining: number } {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || record.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: maxAttempts - 1 };
  }

  record.count++;

  if (record.count > maxAttempts) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: maxAttempts - record.count };
}