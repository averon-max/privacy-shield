import { RateLimiterMemory } from "rate-limiter-flexible";

const freeLimit = new RateLimiterMemory({ points: 30, duration: 60 });
const proLimit  = new RateLimiterMemory({ points: 200, duration: 60 });

export async function rateLimit(ip: string, isPro: boolean = false) {
  const limiter = isPro ? proLimit : freeLimit;
  await limiter.consume(ip);
}