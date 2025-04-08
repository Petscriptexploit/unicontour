import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Send the initial count
      const initialCount = (await redis.get<number>("visitor_count")) || 0
      controller.enqueue(encoder.encode(`data: ${initialCount}\n\n`))

      // Set up a polling mechanism to check for updates
      const intervalId = setInterval(async () => {
        try {
          const currentCount = (await redis.get<number>("visitor_count")) || 0
          controller.enqueue(encoder.encode(`data: ${currentCount}\n\n`))
        } catch (error) {
          console.error("Error fetching counter:", error)
        }
      }, 1000) // Poll every second

      // Clean up the interval when the connection closes
      return () => {
        clearInterval(intervalId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
