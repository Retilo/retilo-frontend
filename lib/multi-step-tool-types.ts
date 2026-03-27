export type { AnalyzeUIToolInvocation } from "./ai-agent-multi-step-tools/analyze";
export type { DecideUIToolInvocation } from "./ai-agent-multi-step-tools/decide";
export type { NewsSearchUIToolInvocation } from "./ai-agent-multi-step-tools/news-search";
export type { ProvideAnswerUIToolInvocation } from "./ai-agent-multi-step-tools/provide-answer";
// Re-export tool invocation types for UI components
export type { WebSearchUIToolInvocation } from "./ai-agent-multi-step-tools/web-search";
export type { MultiStepAgentUIMessage as MultiStepToolUIMessage } from "./multi-step-agent";

// Legacy types for backward compatibility (can be removed later)
export type MultiStepToolDataParts = {
  "transient-stage-data": {
    s: string; // stage
    m: string; // message
  };
  "agent-info": {
    task: string;
    icon: string;
    color: string;
    systemPrompt: string;
  };
};

export type MultiStepToolMetadata = {
  agent: {
    task: string;
    icon: string;
    color: string;
  };
  processing: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
  model: {
    name: string;
    provider: string;
  };
};
