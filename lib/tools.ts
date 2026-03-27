import { type ToolSet, tool } from "ai";
import { z } from "zod";

// Tool that requires human confirmation (no execute function)
const getWeatherInformation = tool({
  description: "show the weather in a given city to the user",
  inputSchema: z.object({ city: z.string() }),
  outputSchema: z.string(),
  // no execute function, we want human in the loop
});

// Tool that requires human confirmation for content moderation
const moderateContent = tool({
  description: "moderate user content and get human approval for publishing",
  inputSchema: z.object({
    content: z.string(),
    contentType: z.string().optional(),
    context: z.string().optional(),
  }),
  outputSchema: z.string(),
  // no execute function, we want human in the loop
});

// Tool that requires human confirmation for shopping cart actions
const addToCart = tool({
  description: "add items to shopping cart with human approval",
  inputSchema: z.object({
    items: z.array(
      z.object({
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
      })
    ),
    total: z.number(),
  }),
  outputSchema: z.string(),
  // no execute function, we want human in the loop
});

// Tool that requires human confirmation for user approval
const approveUser = tool({
  description: "approve or deny user registration requests",
  inputSchema: z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string(),
    reason: z.string().optional(),
  }),
  outputSchema: z.string(),
  // no execute function, we want human in the loop
});

// Tool that requires human confirmation for payment processing
const processPayment = tool({
  description: "process payment with human approval",
  inputSchema: z.object({
    amount: z.number(),
    paymentMethod: z.string(),
    description: z.string().optional(),
  }),
  outputSchema: z.string(),
  // no execute function, we want human in the loop
});

// Tool that doesn't require confirmation (has execute function)
const webSearch = tool({
  description: "search the web for current information",
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.string(),
  execute: async ({ query }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock web search implementation
    return `Search results for "${query}": This is a mock search result.`;
  },
});

// Tool that doesn't require confirmation (has execute function)
const getLocalTime = tool({
  description: "get the local time for a specified location",
  inputSchema: z.object({ location: z.string() }),
  outputSchema: z.string(),
  execute: async ({ location }) =>
    `The local time in ${location} is ${new Date().toLocaleTimeString()}`,
});

export const tools = {
  getWeatherInformation,
  moderateContent,
  addToCart,
  approveUser,
  processPayment,
  webSearch,
  getLocalTime,
} satisfies ToolSet;
