// @ts-nocheck
"use client";

import { useChat } from "@ai-sdk/react";
import { type ChatStatus, DefaultChatTransport } from "ai";
import {
  BrainIcon,
  CheckCircleIcon,
  CopyIcon,
  ExternalLink,
  NewspaperIcon,
  RefreshCcwIcon,
  ScaleIcon,
  SearchIcon,
} from "lucide-react";
import { Fragment, type SVGProps, useState } from "react";
import { toast } from "sonner";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
// UI Components
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

// Types and utilities
import { cn } from "@/lib/utils";
import type { MultiStepToolUIMessage } from "../lib/multi-step-tool-types";
import AnalyzeView from "./tool-views/analyze-view";
import DecideView from "./tool-views/decide-view";
import NewsSearchView from "./tool-views/news-search-view";
import ProvideAnswerView from "./tool-views/provide-answer-view";
// Tool view components
import WebSearchView from "./tool-views/web-search-view";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * Predefined use cases that users can quickly select from
 */
const USE_CASES = [
  {
    title: "Research AI Trends",
    content:
      "What are the latest trends in artificial intelligence and machine learning?",
  },
  {
    title: "Analyze Market Data",
    content:
      "Help me analyze the current state of the cryptocurrency market and provide insights.",
  },
  {
    title: "Compare Technologies",
    content:
      "Compare React vs Vue.js for building modern web applications in 2024.",
  },
  {
    title: "Research Company",
    content:
      "Find recent news and information about Tesla's latest developments and stock performance.",
  },
  {
    title: "Technical Problem",
    content:
      "I'm having issues with my Next.js application deployment. Help me troubleshoot and find solutions.",
  },
  {
    title: "Industry Analysis",
    content:
      "Analyze the current state of the renewable energy industry and future prospects.",
  },
] as const;

/**
 * Available tools configuration for the multi-step agent
 */
const AVAILABLE_TOOLS = [
  {
    name: "Web Search",
    icon: "🔍",
    color: "bg-blue-200 border-blue-200 text-blue-800",
  },
  {
    name: "News Search",
    icon: "📰",
    color: "bg-green-200 border-green-200 text-green-800",
  },
  {
    name: "Analysis",
    icon: "🧠",
    color: "bg-purple-200 border-purple-200 text-purple-800",
  },
  {
    name: "Decision Making",
    icon: "⚖️",
    color: "bg-orange-200 border-orange-200 text-orange-800",
  },
  {
    name: "Final Answer",
    icon: "✅",
    color: "bg-emerald-200 border-emerald-200 text-emerald-800",
  },
] as const;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface HeaderSectionProps {
  hasResults: boolean;
  status: ChatStatus;
}

interface ChainOfThoughtDisplayProps {
  messages: MultiStepToolUIMessage[];
  status: ChatStatus;
}

interface ErrorStateProps {
  error: string;
}

interface ToolStep {
  icon: any;
  label: string;
  description: string;
  status: "complete" | "active" | "pending";
  content?: React.ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Multi-Step Tool Demo Component
 *
 * A comprehensive AI agent interface that demonstrates multi-step problem solving
 * using various tools like web search, news search, analysis, and decision making.
 * The agent breaks down complex problems into manageable steps and provides
 * comprehensive answers with proper citations and source attribution.
 */
export function MultiStepToolDemo() {
  const [input, setInput] = useState("");
  const [transientStageData, setTransientStageData] = useState<{
    s: string; // stage
    m: string; // message
  } | null>(null);

  const { messages, sendMessage, status, regenerate, error } =
    useChat<MultiStepToolUIMessage>({
      transport: new DefaultChatTransport({
        // !! CHANGE /registry/blocks/ai-agents-routing/app/api/routing-agent
        // to
        // /api/routing-agent in your app
        api: "/registry/blocks/ai-chat-agent-multi-step-tool-pattern/app/api/multi-step-tool-agent", // should be -> /api/routing-agent
        credentials: "include",
        headers: { "Custom-Header": "value" },
      }),
      onData: (data) => {
        if (data.type === "data-transient-stage-data") {
          setTransientStageData(data.data as { s: string; m: string });
        }
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  /**
   * Handles form submission for new messages
   */
  const handleSubmit = async (_message: any, e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    sendMessage({ text: input });
    setInput(""); // Clear input after sending
    setTransientStageData(null);
  };

  return (
    <div className="relative mx-auto size-full h-screen max-w-3xl p-6">
      <div className="flex h-full flex-col space-y-6">
        <HeaderSection hasResults={messages.length > 0} status={status} />

        <Conversation className="relative h-full w-full flex-1">
          <ConversationContent>
            {/* Show loading state when streaming */}
            {status === "streaming" && messages.length === 0 && (
              <LoadingState />
            )}

            {/* Show error state if there's an error */}
            {error && <ErrorState error={error.message} />}

            {/* Render messages */}
            {messages.map((message) => (
              <MessageRenderer
                key={message.id}
                message={message}
                messages={messages}
                onRegenerate={regenerate}
                status={status}
              />
            ))}

            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit}>
          <div className="py-1 pl-1">
            <Suggestions>
              {USE_CASES.slice(0, 6).map((useCase) => (
                <Suggestion
                  className="rounded-lg"
                  key={useCase.title}
                  onClick={() => setInput(useCase.content)}
                  suggestion={useCase.title}
                />
              ))}
            </Suggestions>
          </div>

          <PromptInputTextarea
            className="pr-12"
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Say something..."
            value={input}
          />
          <PromptInputToolbar>
            <PromptInputTools className="ml-auto">
              <PromptInputSubmit disabled={!input} status={status} />
            </PromptInputTools>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}

/**
 * Message Renderer Component
 *
 * Handles rendering of individual messages with all their parts including
 * text, tools, reasoning, and sources. Manages the complex logic for
 * displaying different message types and their associated actions.
 */
interface MessageRendererProps {
  message: MultiStepToolUIMessage;
  messages: MultiStepToolUIMessage[];
  status: ChatStatus;
  onRegenerate: () => void;
}

const MessageRenderer = ({
  message,
  messages,
  status,
  onRegenerate,
}: MessageRendererProps) => {
  const hasSources =
    message.role === "assistant" &&
    message.parts.filter((part) => part.type === "source-url").length > 0;

  const hasToolCalls =
    message.role === "assistant" &&
    message.parts.some((part) => part.type?.startsWith("tool-"));

  return (
    <div className="flex flex-col">
      {/* Sources Display */}
      {hasSources && (
        <Sources>
          <SourcesTrigger
            count={
              message.parts.filter((part) => part.type === "source-url").length
            }
          />
          {message.parts
            .filter((part) => part.type === "source-url")
            .map((part, i) => (
              <SourcesContent key={`${message.id}-${i}`}>
                <Source
                  href={part.url}
                  key={`${message.id}-${i}`}
                  title={part.url}
                />
              </SourcesContent>
            ))}
        </Sources>
      )}

      {/* Chain of Thought Display */}
      {hasToolCalls && (
        <div className="mx-2 mb-4 max-w-fit">
          <ChainOfThoughtDisplay messages={[message]} status={status} />
        </div>
      )}

      {/* Message Parts */}
      {message.parts.map((part, index) => (
        <MessagePartRenderer
          key={`${message.id}-${index}`}
          message={message}
          messages={messages}
          onRegenerate={onRegenerate}
          part={part}
          partIndex={index}
          status={status}
        />
      ))}
    </div>
  );
};

/**
 * Message Part Renderer Component
 *
 * Renders individual parts of a message (text, tools, reasoning, etc.)
 * with appropriate styling and actions.
 */
interface MessagePartRendererProps {
  part: any;
  message: MultiStepToolUIMessage;
  messages: MultiStepToolUIMessage[];
  status: ChatStatus;
  partIndex: number;
  onRegenerate: () => void;
}

const MessagePartRenderer = ({
  part,
  message,
  messages,
  status,
  partIndex,
  onRegenerate,
}: MessagePartRendererProps) => {
  const isLastPart = partIndex === message.parts.length - 1;
  const isSecondToLastPart = partIndex === message.parts.length - 2;
  const isStreaming =
    status === "streaming" &&
    partIndex === message.parts.length - 1 &&
    message.id === messages.at(-1)?.id;

  switch (part.type) {
    case "text":
      return (
        <>
          <Message from={message.role}>
            <MessageContent>
              <Response>{part.text}</Response>
            </MessageContent>
          </Message>
          {message.role === "assistant" && isSecondToLastPart && (
            <MessageActions onRegenerate={onRegenerate} text={part.text} />
          )}
        </>
      );

    case "tool-provideAnswer":
      return (
        <>
          <Message from={message.role}>
            <MessageContent>
              <ProvideAnswerView invocation={part} />
            </MessageContent>
          </Message>
          {message.role === "assistant" && isLastPart && (
            <MessageActions
              onRegenerate={onRegenerate}
              text={part.output?.answer || "Final answer"}
            />
          )}
        </>
      );

    case "reasoning":
      return (
        <Reasoning className="mt-4 w-full" isStreaming={isStreaming}>
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      );

    case "tool-websearch":
      return (
        <div className="mx-2 max-w-fit first-of-type:mt-4">
          <Tool className="rounded-xl">
            <ToolHeader state={part.state} type={part.type} />
            <ToolContent>
              <ToolInput input={part.input} />
              <div className="p-4">
                <WebSearchView invocation={part} />
              </div>
            </ToolContent>
          </Tool>
        </div>
      );

    case "tool-news":
      return (
        <div className="mx-2 max-w-fit first-of-type:mt-4">
          <Tool className="rounded-xl">
            <ToolHeader state={part.state} type={part.type} />
            <ToolContent>
              <ToolInput input={part.input} />
              <div className="p-4">
                <NewsSearchView invocation={part} />
              </div>
            </ToolContent>
          </Tool>
        </div>
      );

    case "tool-analyze":
      return (
        <div className="mx-2 max-w-fit first-of-type:mt-4">
          <Tool className="rounded-xl">
            <ToolHeader state={part.state} type={part.type} />
            <ToolContent>
              <ToolInput input={part.input} />
              <div className="p-4">
                <AnalyzeView invocation={part} />
              </div>
            </ToolContent>
          </Tool>
        </div>
      );

    case "tool-decide":
      return (
        <div className="mx-2 max-w-fit first-of-type:mt-4">
          <Tool className="rounded-xl">
            <ToolHeader state={part.state} type={part.type} />
            <ToolContent>
              <ToolInput input={part.input} />
              <div className="p-4">
                <DecideView invocation={part} />
              </div>
            </ToolContent>
          </Tool>
        </div>
      );

    default:
      return null;
  }
};

/**
 * Message Actions Component
 *
 * Displays action buttons (retry, copy) for assistant messages
 */
interface MessageActionsProps {
  text: string;
  onRegenerate: () => void;
}

const MessageActions = ({ text, onRegenerate }: MessageActionsProps) => (
  <Actions className="mb-2">
    <Action label="Retry" onClick={onRegenerate}>
      <RefreshCcwIcon className="size-3" />
    </Action>
    <Action label="Copy" onClick={() => navigator.clipboard.writeText(text)}>
      <CopyIcon className="size-3" />
    </Action>
  </Actions>
);

/**
 * Loading State Component
 *
 * Shows when the agent is initializing and no messages are present
 */
const LoadingState = () => (
  <div className="flex h-full flex-col items-center justify-center space-y-4">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
      <Loader />
    </div>
    <div className="space-y-1 text-center">
      <p className="font-medium text-foreground text-sm">
        Initializing multi-step agent
      </p>
      <p className="text-muted-foreground text-xs">
        Setting up tools and preparing analysis
      </p>
    </div>
  </div>
);

/**
 * Error State Component
 *
 * Displays error messages when something goes wrong
 */
const ErrorState = ({ error }: ErrorStateProps) => (
  <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
      <svg
        className="h-5 w-5 text-destructive"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </div>
    <div className="space-y-1">
      <p className="font-medium text-destructive text-sm">Error</p>
      <p className="max-w-sm text-muted-foreground text-xs">{error}</p>
    </div>
  </div>
);

// ============================================================================
// HELPER FUNCTIONS & UTILITIES
// ============================================================================

// ============================================================================
// CHAIN OF THOUGHT & ICONS
// ============================================================================

/**
 * Chain of Thought Display Component
 *
 * Shows the progress of the multi-step agent using Chain of Thought
 * visualization with step-by-step reasoning process.
 */
const ChainOfThoughtDisplay = ({ messages }: ChainOfThoughtDisplayProps) => {
  const toolSteps = extractToolSteps(messages);

  if (toolSteps.length === 0) {
    return null;
  }

  return (
    <ChainOfThought defaultOpen>
      <ChainOfThoughtHeader>Agent Reasoning Process</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {toolSteps.map((step, index) => (
          <ChainOfThoughtStep
            description={step.description}
            icon={step.icon}
            key={index}
            label={step.label}
            status={step.status}
          >
            {step.content}
          </ChainOfThoughtStep>
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
};

/**
 * Extracts tool steps from messages for Chain of Thought display
 *
 * @param messages - Array of messages to analyze
 * @returns Array of tool steps with icons, labels, and status
 */
const extractToolSteps = (messages: MultiStepToolUIMessage[]): ToolStep[] => {
  const steps: ToolStep[] = [];

  for (const message of messages) {
    if (message.role === "assistant" && message.parts) {
      const toolCalls = message.parts.filter((part) =>
        part.type?.startsWith("tool-")
      );

      toolCalls.forEach((tool, index) => {
        const step = getToolStep(tool, index === toolCalls.length - 1);
        if (step) {
          steps.push(step);
        }
      });
    }
  }

  return steps;
};

/**
 * Gets tool step information for Chain of Thought display
 *
 * @param tool - The tool call to convert to a step
 * @param isLast - Whether this is the last tool in the sequence
 * @returns Tool step information or null if not a valid tool
 */
const getToolStep = (tool: any, isLast: boolean): ToolStep | null => {
  const status = isLast ? "active" : "complete";

  switch (tool.type) {
    case "tool-websearch":
      return {
        icon: SearchIcon,
        label: "Web Search",
        description: `Searching for: "${tool.input?.query || "Unknown query"}"`,
        status,
        content: tool.output?.results?.length ? (
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">
              Found {tool.output.results.length} results
            </div>
            <ChainOfThoughtSearchResults className="scrollbar-thin-horizontal max-w-lg overflow-x-auto pb-1.5">
              {tool.output.results
                .slice(0, 3)
                .map((result: any, index: number) => (
                  <ChainOfThoughtSearchResult className="" key={index}>
                    <a
                      className=""
                      href={result.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {result.title || result.url}
                    </a>
                  </ChainOfThoughtSearchResult>
                ))}
            </ChainOfThoughtSearchResults>
          </div>
        ) : undefined,
      };
    case "tool-news":
      return {
        icon: NewspaperIcon,
        label: "News Search",
        description: `Searching news for: "${tool.input?.topic || "Unknown topic"}"`,
        status,
        content: tool.output?.items?.length ? (
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">
              Found {tool.output.items.length} news items
            </div>
            <ChainOfThoughtSearchResults className="scrollbar-thin-horizontal max-w-lg overflow-x-auto pb-1.5">
              {tool.output.items.slice(0, 3).map((item: any, index: number) => (
                <ChainOfThoughtSearchResult key={index}>
                  <a
                    className="text-green-600 text-xs hover:text-green-800"
                    href={item.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.title || "News Item"}
                  </a>
                </ChainOfThoughtSearchResult>
              ))}
            </ChainOfThoughtSearchResults>
          </div>
        ) : undefined,
      };
    case "tool-analyze":
      return {
        icon: BrainIcon,
        label: "Analysis",
        description: `Analyzing: ${tool.input?.problem || "Unknown problem"}`,
        status,
        content: tool.output?.breakdown ? (
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">
              {tool.output.breakdown}
            </div>
            {tool.output?.components?.length ? (
              <div className="text-muted-foreground text-xs">
                <strong>Components:</strong> {tool.output.components.length}{" "}
                identified
              </div>
            ) : null}
          </div>
        ) : undefined,
      };
    case "tool-decide":
      return {
        icon: ScaleIcon,
        label: "Decision Making",
        description: `Evaluating ${tool.input?.options?.length || 0} options`,
        status,
        content: tool.output?.decision ? (
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">
              <strong>Selected:</strong> {tool.output.decision}
            </div>
            {tool.output?.evaluation?.length ? (
              <div className="text-muted-foreground text-xs">
                <strong>Evaluation:</strong> {tool.output.evaluation.length}{" "}
                options scored
              </div>
            ) : null}
          </div>
        ) : undefined,
      };
    case "tool-provideAnswer":
      return {
        icon: CheckCircleIcon,
        label: "Final Answer",
        description: "Synthesizing results into final answer",
        status,
        content: tool.output?.answer ? (
          <div className="text-muted-foreground text-sm">
            Answer ready with {tool.output.citations?.length || 0} citations
          </div>
        ) : undefined,
      };
    default:
      return null;
  }
};

const OpenAIIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    height="1em"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 260"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
  </svg>
);

function AISDKIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <svg
        data-testid="multi-agent-icon"
        height="16"
        strokeLinejoin="round"
        style={{ color: "currentcolor" }}
        viewBox="0 0 16 16"
        width="16"
        {...props}
      >
        <path
          d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z"
          fill="currentColor"
        />
        <path
          d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z"
          fill="currentColor"
        />
        <path
          d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// COMPONENT DEFINITIONS
// ============================================================================

function HeaderSectionCallout({ children }: { children: React.ReactNode }) {
  return (
    <span className="inset-shadow-2xs inset-shadow-white/25 whitespace-nowrap rounded-[3px] border-[1px] border-primary/10 bg-linear-to-b from-primary/5 to-muted/40 px-1 py-[1px] text-primary text-xs">
      {children}
    </span>
  );
}

function HeaderSectionLink({
  href,
  children,
  isCodeExample = false,
}: {
  href: string;
  children: React.ReactNode;
  isCodeExample?: boolean;
}) {
  return (
    <a
      className={cn(
        "group inline-flex items-center whitespace-nowrap rounded-[3px] border border-border/20 px-1 py-[1px] text-xs transition-all duration-50 ease-out hover:font-medium hover:text-blue-600",
        isCodeExample &&
          "pt-[2px] font-mono text-[10px] text-foreground/80 tracking-tighter"
      )}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}{" "}
      <ExternalLink className="ml-1 size-2 translate-x-[-2px] transform text-gray-600 opacity-50 transition-all duration-150 ease-out group-hover:translate-x-0 group-hover:scale-110 group-hover:opacity-100" />
    </a>
  );
}

function HeaderSectionHeading({
  title = "",
  subtitle = "",
  status,
  patternType,
}: {
  title: string;
  subtitle: string;
  status: ChatStatus;
  patternType: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 md:flex-row">
      <div className="flex items-center justify-center rounded-lg bg-muted p-[4px] shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
        {status !== "ready" ? (
          <div className="rounded-md bg-primary/10 p-1 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
            <Loader className="size-8 text-foreground" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <OpenAIIcon className="size-8 rounded-md bg-primary/10 p-1 text-foreground shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]" />
            <AISDKIcon className="size-8 rounded-md bg-primary/10 p-1 text-foreground shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]" />
          </div>
        )}
      </div>
      <div>
        <h1 className="font-semibold text-2xl text-foreground tracking-tight">
          {title}
        </h1>
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <p className="font-mono text-muted-foreground text-xs md:text-sm">
            {subtitle}
          </p>{" "}
          <p className="rounded-full bg-muted/50 px-2 py-1 text-muted-foreground text-xs">
            {patternType}
          </p>
        </div>
      </div>
    </div>
  );
}

function SdkItemsUsed({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-muted-foreground text-xs">
        <AISDKIcon className="size-3" />
      </div>
      {items.map((item) => (
        <HeaderSectionLink href={item.href} isCodeExample key={item.href}>
          {item.label}
        </HeaderSectionLink>
      ))}
    </div>
  );
}

/**
 * Header Section Component
 *
 * Displays the main title, current stage information, and tool descriptions.
 * Shows different content based on whether there are results and current status.
 */
const HeaderSection = ({ hasResults, status }: HeaderSectionProps) => (
  <div className={cn("space-y-2", !hasResults && "mx-auto")}>
    <HeaderSectionHeading
      patternType="Agent Pattern"
      status={status}
      subtitle="AI SDK v5"
      title="Multi-Step Tool Agent"
    />

    <div className={cn("space-y-6", hasResults && "hidden")}>
      <p className="mb-4 max-w-lg pl-3 text-muted-foreground text-xs leading-5 tracking-tight lg:pl-0 lg:text-sm lg:leading-snug xl:max-w-2xl">
        Multi-step tool agent demonstrates how AI agents can solve complex
        problems using{" "}
        <HeaderSectionLink href="https://sdk.vercel.ai/docs/v5">
          ai sdk v5
        </HeaderSectionLink>
        . The <HeaderSectionCallout>Web Search Tool</HeaderSectionCallout>{" "}
        gathers current information, while the{" "}
        <HeaderSectionCallout>Analysis Tool</HeaderSectionCallout> processes and
        synthesizes data. The{" "}
        <HeaderSectionCallout>Decision Tool</HeaderSectionCallout> evaluates
        options and the <HeaderSectionCallout>Answer Tool</HeaderSectionCallout>{" "}
        provides comprehensive responses with proper citations.
      </p>
      <SdkItemsUsed
        items={[
          {
            href: "https://ai-sdk.dev/docs/reference/ai-sdk-core/tool#tool",
            label: "tool()",
          },
          {
            href: "https://x.com/nicoalbanese10/status/1965103104732659934",
            label: "new Agent()",
          },
          {
            href: "https://ai-sdk.dev/docs/reference/ai-sdk-core/step-count-is#stepcountis",
            label: "stepCountIs()",
          },
        ]}
      />
    </div>
  </div>
);
