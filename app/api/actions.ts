"use server"

import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function incrementCounter() {
  try {
    // Increment the counter in Redis
    const newCount = await redis.incr("visitor_count")

    return { success: true, count: newCount }
  } catch (error) {
    console.error("Failed to increment counter:", error)
    return { success: false, error: "Failed to increment counter" }
  }
}
