import { tool, type UIToolInvocation } from "ai";
import { z } from "zod";

export const AnalysisSchema = z.object({
  problem: z.string(),
  approach: z.enum(["systematic", "creative", "technical"]),
  breakdown: z.string(),
  components: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof AnalysisSchema>;

export const analyzeTool = tool({
  description:
    "Analyze and break down complex problems into smaller, manageable components",
  inputSchema: z.object({
    problem: z.string().describe("The problem to analyze"),
    approach: z
      .enum(["systematic", "creative", "technical"])
      .describe("The analysis approach"),
  }),
  async *execute({
    problem,
    approach,
  }: {
    problem: string;
    approach: "systematic" | "creative" | "technical";
  }) {
    yield { state: "loading" as const };

    // Simulate analysis processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const analysisResults = {
      systematic:
        "Systematic breakdown: 1) Problem identification, 2) Root cause analysis, 3) Solution alternatives, 4) Implementation plan",
      creative: `Creative analysis: Exploring unconventional approaches and innovative solutions for ${problem}`,
      technical: `Technical analysis: Examining ${problem} from a technical perspective including architecture, implementation, and optimization considerations`,
    };

    yield {
      state: "ready" as const,
      problem,
      approach,
      breakdown: analysisResults[approach],
      components: [
        `Component 1: Analysis of ${problem}`,
        "Component 2: Solution design",
        "Component 3: Implementation strategy",
      ],
    };
  },
});

export type AnalyzeUIToolInvocation = UIToolInvocation<typeof analyzeTool>;

export default analyzeTool;
