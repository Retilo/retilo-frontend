import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import type { UIMessage as MultiStepToolUIMessage } from "ai";
import {
  convertToModelMessages,
  getToolName,
  isToolUIPart,
  type Tool,
  type ToolCallOptions,
  type ToolSet,
  type UIMessageStreamWriter,
} from "ai";

// These strings must match exactly between frontend and backend
export const APPROVAL = {
  YES: "Yes, confirmed.",
  NO: "No, denied.",
} as const;

// Type guard to ensure tool name exists in execute functions map
function isValidToolName<K extends PropertyKey, T extends object>(
  key: K,
  obj: T
): key is K & keyof T {
  return key in obj;
}

// Execute approved tools and return results to client
async function executeApprovedTool(
  toolName: string,
  part: MultiStepToolUIMessage["parts"][0],
  executeFunctions: Record<string, (...args: unknown[]) => Promise<string>>,
  messages: MultiStepToolUIMessage[]
): Promise<string> {
  if (!isValidToolName(toolName, executeFunctions)) {
    return "Error: Invalid tool name";
  }

  const toolInstance = executeFunctions[toolName];
  if (!toolInstance) {
    return "Error: No execute function found on tool";
  }

  // Cast to access tool-specific properties
  const toolPart = part as { input: unknown; toolCallId: string };
  return await toolInstance(toolPart.input, {
    messages: convertToModelMessages(messages),
    toolCallId: toolPart.toolCallId,
  });
}

// Handle individual tool parts - execute if approved, deny if rejected
async function processToolPart(
  part: MultiStepToolUIMessage["parts"][0],
  executeFunctions: Record<string, (...args: unknown[]) => Promise<string>>,
  messages: MultiStepToolUIMessage[],
  writer: UIMessageStreamWriter
): Promise<MultiStepToolUIMessage["parts"][0]> {
  if (!isToolUIPart(part)) {
    return part;
  }

  const toolName = getToolName(part);
  if (!(toolName in executeFunctions) || part.state !== "output-available") {
    return part;
  }

  let result: string;
  if (part.output === APPROVAL.YES) {
    result = await executeApprovedTool(
      toolName,
      part,
      executeFunctions,
      messages
    );
  } else if (part.output === APPROVAL.NO) {
    result = "Error: User denied access to tool execution";
  } else {
    return part;
  }

  // Stream result back to client
  writer.write({
    type: "tool-output-available",
    toolCallId: part.toolCallId,
    output: result,
  });

  return { ...part, output: result };
}

// Main entry point - processes all tool calls in the last message
export async function processToolCalls<
  Tools extends ToolSet,
  ExecutableTools extends {
    [K in keyof Tools as Tools[K] extends {
      execute: (...args: unknown[]) => unknown;
    }
      ? never
      : K]: Tools[K];
  },
>(
  {
    writer,
    messages,
  }: {
    tools: Tools;
    writer: UIMessageStreamWriter;
    messages: MultiStepToolUIMessage[];
  },
  executeFunctions: {
    [K in keyof Tools & keyof ExecutableTools]?: (
      args: ExecutableTools[K] extends Tool<infer P> ? P : never,
      context: ToolCallOptions
    ) => Promise<string>;
  }
): Promise<MultiStepToolUIMessage[]> {
  const lastMessage = messages.at(-1);
  if (!lastMessage?.parts) {
    return messages;
  }

  const processedParts = await Promise.all(
    lastMessage.parts.map((part) =>
      processToolPart(
        part,
        executeFunctions as Record<
          string,
          (...args: unknown[]) => Promise<string>
        >,
        messages,
        writer
      )
    )
  );

  return [...messages.slice(0, -1), { ...lastMessage, parts: processedParts }];
}

// Returns tool names that don't have execute functions (require human approval)
export function getToolsRequiringConfirmation<T extends ToolSet>(
  tools: T
): string[] {
  return (Object.keys(tools) as (keyof T)[]).filter((key) => {
    const maybeTool = tools[key];
    return typeof maybeTool.execute !== "function";
  }) as string[];
}
