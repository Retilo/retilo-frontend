// @ts-nocheck
import type { UIMessage as MultiStepToolUIMessage } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  gateway,
  stepCountIs,
  streamText,
} from "ai";
import {
  checkRateLimit,
  createRateLimitResponse,
  extractClientIP,
} from "../../../lib/rate-limit";
import { tools } from "../../../lib/tools";
import { processToolCalls } from "../../../lib/utils";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/** Rate limit key prefix for this endpoint */
const RATE_LIMIT_KEY_PREFIX = "ai-human-in-loop-agent";

export async function POST(req: Request) {
  try {
    // Extract client IP for rate limiting
    const clientIP = extractClientIP(req);

    // Check rate limit before processing
    const rateLimitResult = await checkRateLimit(
      `${RATE_LIMIT_KEY_PREFIX}-${clientIP}`
    );

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // Parse request body
    const { messages }: { messages: MultiStepToolUIMessage[] } =
      await req.json();

    const stream = createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        // Utility function to handle tools that require human confirmation
        // Checks for confirmation in last message and then runs associated tool
        const processedMessages = await processToolCalls(
          {
            messages,
            writer,
            tools,
          },
          {
            // type-safe object for tools without an execute function
            getWeatherInformation: async ({ city }) => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              const conditions = ["sunny", "cloudy", "rainy", "snowy"];
              return `The weather in ${city} is ${
                conditions[Math.floor(Math.random() * conditions.length)]
              }.`;
            },
            moderateContent: async ({ content, contentType, context }) =>
              `Content "${content}" has been approved for publishing. Content type: ${contentType || "text"}. Context: ${context || "none"}`,
            addToCart: async ({ items, total }) => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              const itemNames = items
                .map((item) => `${item.name} (x${item.quantity})`)
                .join(", ");
              return `Successfully added to cart: ${itemNames}. Total: $${total.toFixed(2)}`;
            },
            approveUser: async ({ userId, username, email, reason }) =>
              `User ${username} (${email}) has been approved. User ID: ${userId}. Reason: ${reason || "Standard approval"}`,
            processPayment: async ({ amount, paymentMethod, description }) =>
              `Payment of $${amount.toFixed(2)} processed successfully using ${paymentMethod}. Description: ${description || "No description provided"}`,
          }
        );

        const result = streamText({
          model: gateway("openai/gpt-4.1"),
          messages: convertToModelMessages(processedMessages),
          tools,
          stopWhen: stepCountIs(5),
        });

        writer.merge(
          result.toUIMessageStream({ originalMessages: processedMessages })
        );
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Error in human-in-loop agent:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
