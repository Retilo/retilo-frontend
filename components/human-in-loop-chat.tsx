// @ts-nocheck
"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage as MultiStepToolUIMessage } from "ai";
import { DefaultChatTransport, getToolName, isToolUIPart } from "ai";
import { useState } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { tools } from "../lib/tools";
import { APPROVAL, getToolsRequiringConfirmation } from "../lib/utils";
import { HeaderSection } from "./intro-heading";

// Predefined use cases for quick testing
const USE_CASES = [
  {
    title: "Weather Check",
    content: "What's the weather like in New York?",
  },
  {
    title: "Content Moderation",
    content:
      "Please moderate this comment: 'This product is terrible and the company should be ashamed!'",
  },
  {
    title: "Shopping Cart",
    content:
      "Add these items to my cart: MacBook Pro ($2,499), Magic Mouse ($79), AppleCare+ ($399)",
  },
  {
    title: "User Approval",
    content:
      "A new user 'john_doe' with email 'john@example.com' wants to register. Should I approve them?",
  },
  {
    title: "Payment Processing",
    content:
      "Process a payment of $299.99 using credit card for 'Premium Subscription'",
  },
];

export default function HumanInLoopChat() {
  const [input, setInput] = useState("");
  const { messages, addToolResult, sendMessage, status, error } =
    useChat<MultiStepToolUIMessage>({
      transport: new DefaultChatTransport({
        // change to api/human-in-loop in your app
        api: "/registry/blocks/ai-human-in-the-loop/app/api/human-in-loop", // change to api/human-in-loop in your app
      }),
      onError: (err) => {
        toast.error(err.message);
      },
    });

  const toolsRequiringConfirmation = getToolsRequiringConfirmation(tools);

  // used to disable input while confirmation is pending
  const pendingToolCallConfirmation = messages.some((m) =>
    m.parts?.some(
      (part: MultiStepToolUIMessage["parts"][0]) =>
        isToolUIPart(part) &&
        part.state === "input-available" &&
        toolsRequiringConfirmation.includes(getToolName(part))
    )
  );

  const handleSubmit = (message: { text?: string }) => {
    if (message.text?.trim()) {
      sendMessage({ text: message.text });
      setInput("");
    }
  };

  return (
    <div className="relative mx-auto size-full h-screen max-w-4xl p-6">
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <HeaderSection hasResults={messages.length > 0} status={status} />

        <Conversation className="relative h-full w-full flex-1">
          <ConversationContent>
            {/* Show error message */}
            {error && (
              <div className="mx-2 mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                <p className="font-medium text-sm">Error: {error.message}</p>
              </div>
            )}

            {/* Show loading state when streaming */}
            {status === "streaming" && messages.length === 0 && <Loader />}

            {/* Render messages */}
            {messages.map((message) => (
              <MessageRenderer
                key={message.id}
                message={message}
                onApprove={async (toolCallId, toolName) => {
                  await addToolResult({
                    toolCallId,
                    tool: toolName,
                    output: APPROVAL.YES,
                  });
                  sendMessage();
                }}
                onDeny={async (toolCallId, toolName) => {
                  await addToolResult({
                    toolCallId,
                    tool: toolName,
                    output: APPROVAL.NO,
                  });
                  sendMessage();
                }}
                toolsRequiringConfirmation={toolsRequiringConfirmation}
              />
            ))}

            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit}>
          <div className="py-1 pl-1">
            <Suggestions>
              {USE_CASES.map((useCase) => (
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
            disabled={pendingToolCallConfirmation}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder={
              pendingToolCallConfirmation
                ? "Please respond to the confirmation above..."
                : "Ask for weather, content moderation, shopping cart, user approval, or payment processing..."
            }
            value={input}
          />
          <PromptInputToolbar>
            <PromptInputTools className="ml-auto">
              <PromptInputSubmit
                disabled={!input || pendingToolCallConfirmation}
                status={status}
              />
            </PromptInputTools>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}

// Message Renderer Component using ai-elements
type MessageRendererProps = {
  message: MultiStepToolUIMessage;
  toolsRequiringConfirmation: string[];
  onApprove: (toolCallId: string, toolName: string) => Promise<void>;
  onDeny: (toolCallId: string, toolName: string) => Promise<void>;
};

const MessageRenderer = ({
  message,
  toolsRequiringConfirmation,
  onApprove,
  onDeny,
}: MessageRendererProps) => (
  <div className="flex flex-col">
    {message.parts.map(
      (part: MultiStepToolUIMessage["parts"][0], index: number) => (
        <MessagePartRenderer
          key={`${message.id}-${index}`}
          message={message}
          onApprove={onApprove}
          onDeny={onDeny}
          part={part}
          toolsRequiringConfirmation={toolsRequiringConfirmation}
        />
      )
    )}
  </div>
);

// Message Part Renderer Component
type MessagePartRendererProps = {
  part: MultiStepToolUIMessage["parts"][0];
  message: MultiStepToolUIMessage;
  toolsRequiringConfirmation: string[];
  onApprove: (toolCallId: string, toolName: string) => Promise<void>;
  onDeny: (toolCallId: string, toolName: string) => Promise<void>;
};

const MessagePartRenderer = ({
  part,
  message,
  toolsRequiringConfirmation,
  onApprove,
  onDeny,
}: MessagePartRendererProps) => {
  switch (part.type) {
    case "text":
      return (
        <Message from={message.role}>
          <MessageContent>
            <Response>{part.text}</Response>
          </MessageContent>
        </Message>
      );

    default:
      if (isToolUIPart(part)) {
        const toolName = getToolName(part);
        const toolCallId = part.toolCallId;

        // Render confirmation UI for tools requiring human approval
        if (
          toolsRequiringConfirmation.includes(toolName) &&
          part.state === "input-available"
        ) {
          return (
            <div className="mx-2 max-w-fit first-of-type:mt-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <h3 className="font-medium text-sm">
                      Confirmation Required
                    </h3>
                  </div>
                  <p className="mb-3 text-muted-foreground text-sm">
                    The AI wants to run{" "}
                    <code className="rounded bg-muted px-1 text-xs">
                      {toolName}
                    </code>{" "}
                    with the following parameters:
                  </p>
                </div>

                <div className="mb-4 rounded-md bg-muted/50 p-3">
                  <pre className="text-muted-foreground text-xs">
                    {JSON.stringify(part.input, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 rounded-md bg-green-600 px-3 py-2 font-medium text-sm text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={() => onApprove(toolCallId, toolName)}
                    type="button"
                  >
                    ✓ Approve
                  </Button>
                  <Button
                    className="flex-1 rounded-md bg-red-600 px-3 py-2 font-medium text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => onDeny(toolCallId, toolName)}
                    type="button"
                  >
                    ✗ Deny
                  </Button>
                </div>
              </div>
            </div>
          );
        }

        // Render regular tool (auto-executed or with result)
        return (
          <div className="mx-2 max-w-fit first-of-type:mt-4">
            <Tool className="rounded-xl" defaultOpen={true}>
              <ToolHeader state={part.state} type={part.type} />
              <ToolContent>
                <ToolInput input={part.input} />
                {part.state === "output-available" && (
                  <div className="p-4">
                    <div className="text-sm">
                      {typeof part.output === "string"
                        ? part.output
                        : JSON.stringify(part.output)}
                    </div>
                  </div>
                )}
              </ToolContent>
            </Tool>
          </div>
        );
      }
      return null;
  }
};
