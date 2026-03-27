"use client";

import type { DecideUIToolInvocation } from "../../lib/multi-step-tool-types";

interface DecideViewProps {
  invocation: DecideUIToolInvocation;
}

export default function DecideView({ invocation }: DecideViewProps) {
  switch (invocation.state) {
    case "input-streaming":
      return (
        <div className="text-gray-500">Preparing decision analysis...</div>
      );

    case "input-available":
      return (
        <div className="text-gray-500">
          Evaluating {invocation.input.options.length} options based on:{" "}
          <strong>{invocation.input.criteria.join(", ")}</strong>
        </div>
      );

    case "output-available":
      if (invocation.output.state === "loading") {
        return <div className="text-gray-500">Evaluating options...</div>;
      }

      return (
        <div className="space-y-2">
          <div className="font-medium text-gray-700 text-sm">
            Decision Analysis
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Context:</strong> {invocation.output.context}
            </div>
            <div className="text-sm">
              <strong>Decision:</strong>{" "}
              <span className="font-medium text-green-700">
                {invocation.output.decision}
              </span>
            </div>
            <div className="text-sm">
              <strong>Reasoning:</strong>
              <div className="mt-1 rounded bg-gray-50 p-2 text-xs">
                {invocation.output.reasoning}
              </div>
            </div>
            {invocation.output.evaluation &&
              invocation.output.evaluation.length > 0 && (
                <div className="text-sm">
                  <strong>Evaluation:</strong>
                  <div className="mt-1 space-y-1">
                    {invocation.output.evaluation.map((evaluation, index) => (
                      <div
                        className="rounded bg-gray-50 p-2 text-xs"
                        key={index}
                      >
                        <div className="font-medium">
                          {evaluation.option} (Score: {evaluation.score}/10)
                        </div>
                        <div className="text-gray-600">
                          {evaluation.reasoning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      );

    case "output-error":
      return <div className="text-red-500">Error: {invocation.errorText}</div>;

    default:
      return null;
  }
}
