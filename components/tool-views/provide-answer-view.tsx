// @ts-nocheck
"use client";

import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationQuote,
  InlineCitationSource,
} from "@/components/ai-elements/inline-citation";
import { Loader } from "@/components/ai-elements/loader";
import type { ProvideAnswerUIToolInvocation } from "../../lib/multi-step-tool-types";

interface ProvideAnswerViewProps {
  invocation: ProvideAnswerUIToolInvocation;
}

export default function ProvideAnswerView({
  invocation,
}: ProvideAnswerViewProps) {
  switch (invocation.state) {
    case "input-streaming":
      return (
        <div className="text-gray-500">
          <Loader className="mr-1 size-4" /> Preparing final answer...
        </div>
      );

    case "input-available":
      return (
        <div className="text-gray-500">
          Synthesizing results into final answer...
        </div>
      );

    case "output-available": {
      if (invocation.output.state === "loading") {
        return <div className="text-gray-500">Generating final answer...</div>;
      }

      const answer = invocation.output.answer || "No answer provided";
      const confidence = Math.round((invocation.output.confidence || 0) * 100);
      const steps = invocation.output.steps || [];
      const citations = invocation.output.citations || [];

      // Split the answer by citation patterns [1], [2], etc.
      const parts = answer.split(/(\[\d+\])/);

      return (
        <div className="space-y-4">
          <div className="font-semibold text-gray-800 text-lg">
            Final Answer
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="leading-relaxed">
              {parts.map((part, index) => {
                const citationMatch = part.match(/\[(\d+)\]/);
                if (citationMatch) {
                  // Render citation number as a clickable badge
                  return (
                    <span
                      className="ml-1 inline-flex cursor-pointer items-center rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5 font-medium text-blue-800 text-xs hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                      key={index}
                      title={`Citation ${citationMatch[1]}`}
                    >
                      {citationMatch[0]}
                    </span>
                  );
                }
                return part;
              })}
            </p>

            {/* Citation carousel */}
            {citations.length > 0 && (
              <div className="mt-4">
                <InlineCitation>
                  <InlineCitationCard>
                    <InlineCitationCardTrigger
                      className="shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]"
                      sources={
                        citations.map((c) => c.url).filter(Boolean) as string[]
                      }
                    />
                    <InlineCitationCardBody>
                      <InlineCitationCarousel>
                        <InlineCitationCarouselHeader>
                          <InlineCitationCarouselPrev />
                          <InlineCitationCarouselNext />
                          <InlineCitationCarouselIndex />
                        </InlineCitationCarouselHeader>
                        <InlineCitationCarouselContent>
                          {citations.map((citation, citationIndex) => (
                            <InlineCitationCarouselItem key={citationIndex}>
                              <InlineCitationSource
                                description={citation.description}
                                title={citation.title || "Untitled"}
                                url={citation.url}
                              />
                              {citation.snippet && (
                                <InlineCitationQuote>
                                  {citation.snippet}
                                </InlineCitationQuote>
                              )}
                            </InlineCitationCarouselItem>
                          ))}
                        </InlineCitationCarouselContent>
                      </InlineCitationCarousel>
                    </InlineCitationCardBody>
                  </InlineCitationCard>
                </InlineCitation>
              </div>
            )}

            {/* Steps taken */}
            {steps.length > 0 && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <div className="mb-2 font-medium text-gray-700 text-sm">
                  Steps Taken ({steps.length})
                </div>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div className="text-xs" key={index}>
                      <div className="font-medium">
                        {index + 1}. {step.step}
                      </div>
                      <div className="mt-1 text-gray-600">
                        <strong>Reasoning:</strong> {step.reasoning}
                      </div>
                      <div className="text-gray-600">
                        <strong>Result:</strong> {step.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence level */}
            <div className="mt-4 text-gray-600 text-sm">
              <strong>Confidence:</strong> {confidence}%
            </div>
          </div>
        </div>
      );
    }

    case "output-error":
      return <div className="text-red-500">Error: {invocation.errorText}</div>;

    default:
      return null;
  }
}
