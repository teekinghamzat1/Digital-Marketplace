import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Ensure these environment variables are set in your deployment
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Login Limiter: 5 attempts / 1 minute
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1m"),
  analytics: true,
  prefix: "ratelimit:login",
});

// Purchase Limiter: 10 attempts / 1 minute
export const purchaseLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1m"),
  analytics: true,
  prefix: "ratelimit:purchase",
});

// Wallet Limiter: 3 attempts / 1 minute
export const walletLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1m"),
  analytics: true,
  prefix: "ratelimit:wallet",
});

export async function checkRateLimit(limiter: Ratelimit, identifier: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    // Fallback if Redis is not configured (dev only)
    return { success: true, retryAfter: 0 };
  }
  const { success, reset } = await limiter.limit(identifier);
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return { success, retryAfter };
}
