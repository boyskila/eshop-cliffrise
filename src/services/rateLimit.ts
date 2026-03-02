type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number
}

type RateLimitInput = {
  key: string
  limit: number
  windowMs: number
}

const requestsByKey = new Map<string, number[]>()

const clampConfig = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback

export const checkRateLimit = ({
  key,
  limit,
  windowMs,
}: RateLimitInput): RateLimitResult => {
  const safeLimit = clampConfig(limit, 5)
  const safeWindowMs = clampConfig(windowMs, 60_000)
  const now = Date.now()
  const windowStart = now - safeWindowMs
  const recent = (requestsByKey.get(key) ?? []).filter((ts) => ts > windowStart)

  if (recent.length >= safeLimit) {
    const oldest = recent[0] ?? now
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + safeWindowMs - now) / 1000),
    )
    requestsByKey.set(key, recent)
    return { allowed: false, retryAfterSeconds }
  }

  recent.push(now)
  requestsByKey.set(key, recent)
  return { allowed: true, retryAfterSeconds: 0 }
}

export const clearRateLimitStore = () => {
  requestsByKey.clear()
}
