import { tool, type UIToolInvocation } from "ai";
import { z } from "zod";

export const DecisionEvaluationSchema = z.object({
  option: z.string(),
  score: z.number(),
  reasoning: z.string(),
});

export const DecisionSchema = z.object({
  context: z.string(),
  options: z.array(z.string()),
  criteria: z.array(z.string()),
  evaluation: z.array(DecisionEvaluationSchema),
  decision: z.string(),
  reasoning: z.string(),
});

export type DecisionResult = z.infer<typeof DecisionSchema>;

export const decideTool = tool({
  description: "Make decisions between different options based on criteria",
  inputSchema: z.object({
    options: z.array(z.string()).describe("List of options to choose from"),
    criteria: z.array(z.string()).describe("Criteria for evaluation"),
    context: z.string().describe("Context for the decision"),
  }),
  async *execute({
    options,
    criteria,
    context,
  }: {
    options: string[];
    criteria: string[];
    context: string;
  }) {
    yield { state: "loading" as const };

    // Simulate decision processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Analyze each option based on the provided criteria
    const evaluation = options.map((option, index) => {
      // Simple heuristic scoring based on keyword matching and length
      let score = 5; // Base score

      // Increase score for options that contain relevant keywords
      const relevantKeywords = criteria.flatMap((c) =>
        c.toLowerCase().split(" ")
      );
      const optionWords = option.toLowerCase().split(" ");
      const keywordMatches = relevantKeywords.filter((keyword) =>
        optionWords.some(
          (word) => word.includes(keyword) || keyword.includes(word)
        )
      ).length;

      score += keywordMatches * 2;

      // Adjust score based on option length (more detailed options often better)
      if (option.length > 50) score += 1;
      if (option.length > 100) score += 1;

      // Cap score between 1-10
      score = Math.max(1, Math.min(10, score));

      return {
        option,
        score,
        reasoning: `Option ${index + 1} scored ${score}/10 based on relevance to criteria: ${criteria.join(", ")}. ${keywordMatches > 0 ? `Found ${keywordMatches} keyword matches.` : "No direct keyword matches found."}`,
      };
    });

    const bestOption = evaluation.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    yield {
      state: "ready" as const,
      context,
      options,
      criteria,
      evaluation,
      decision: bestOption.option,
      reasoning: `Selected: ${bestOption.option} (Score: ${bestOption.score}/10) - ${bestOption.reasoning}`,
    };
  },
});

export type DecideUIToolInvocation = UIToolInvocation<typeof decideTool>;

export default decideTool;
