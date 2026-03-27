import { tool, type UIToolInvocation } from "ai";
import { z } from "zod";

export const CitationSchema = z.object({
  number: z.string().describe("Citation number (e.g., '1', '2')"),
  title: z.string().describe("Title of the source"),
  url: z.string().describe("URL of the source"),
  description: z
    .string()
    .optional()
    .describe("Brief description of the source"),
  snippet: z.string().optional().describe("Relevant snippet from the source"),
});

export const StepSchema = z.object({
  step: z.string().describe("Description of what was done in this step"),
  reasoning: z.string().describe("Reasoning behind this step"),
  result: z.string().describe("Result of this step"),
});

export const ProvideAnswerSchema = z.object({
  answer: z
    .string()
    .describe(
      "The final answer to the user's question with inline citations marked as [1], [2], etc."
    ),
  steps: z.array(StepSchema).describe("All steps taken to reach the answer"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence level in the answer"),
  sources: z.array(z.string()).optional().describe("Sources used if any"),
  citations: z
    .array(CitationSchema)
    .optional()
    .describe("Detailed citation information for inline citations"),
});

export type ProvideAnswerResult = z.infer<typeof ProvideAnswerSchema>;

export const provideAnswerTool = tool({
  description:
    "Provide the final structured answer to the user's question by synthesizing all previous tool results",
  inputSchema: z.object({
    answer: z
      .string()
      .describe(
        "The final answer to the user's question with inline citations marked as [1], [2], etc."
      ),
    steps: z.array(StepSchema).describe("All steps taken to reach the answer"),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Confidence level in the answer"),
    sources: z.array(z.string()).optional().describe("Sources used if any"),
    citations: z
      .array(CitationSchema)
      .optional()
      .describe("Detailed citation information for inline citations"),
  }),
  async *execute({
    answer,
    steps,
    confidence,
    sources,
    citations,
  }: {
    answer: string;
    steps: Array<{
      step: string;
      reasoning: string;
      result: string;
    }>;
    confidence: number;
    sources?: string[];
    citations?: Array<{
      number: string;
      title: string;
      url: string;
      description?: string;
      snippet?: string;
    }>;
  }) {
    yield { state: "loading" as const };

    // Simulate answer generation with streaming
    const answerWords = answer.split(" ");
    let partialAnswer = "";

    for (let i = 0; i < answerWords.length; i++) {
      partialAnswer += (i > 0 ? " " : "") + answerWords[i];

      // Yield partial result every few words for smooth streaming
      if (i % 3 === 0 || i === answerWords.length - 1) {
        yield {
          state: "ready" as const,
          answer: partialAnswer,
          steps: [],
          confidence: 0,
          sources: [],
          citations: [],
          summary: "Generating answer...",
        };

        // Small delay to simulate streaming
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    // Stream the final complete result
    yield {
      state: "ready" as const,
      answer,
      steps,
      confidence,
      sources: sources || [],
      citations: citations || [],
      summary: `Based on my analysis using ${steps.length} steps, here's what I found:`,
    };
  },
});

export type ProvideAnswerUIToolInvocation = UIToolInvocation<
  typeof provideAnswerTool
>;

export default provideAnswerTool;
