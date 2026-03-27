"use client";

import type { AnalyzeUIToolInvocation } from "../../lib/multi-step-tool-types";

interface AnalyzeViewProps {
  invocation: AnalyzeUIToolInvocation;
}

export default function AnalyzeView({ invocation }: AnalyzeViewProps) {
  switch (invocation.state) {
    case "input-streaming":
      return <div className="text-gray-500">Preparing analysis...</div>;

    case "input-available":
      return (
        <div className="text-gray-500">
          Analyzing: <strong>{invocation.input.problem}</strong> using{" "}
          <strong>{invocation.input.approach}</strong> approach
        </div>
      );

    case "output-available":
      if (invocation.output.state === "loading") {
        return (
          <div className="text-gray-500">
            Analyzing: <strong>{invocation.input.problem}</strong>...
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <div className="font-medium text-gray-700 text-sm">
            Analysis Results
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Problem:</strong> {invocation.output.problem}
            </div>
            <div className="text-sm">
              <strong>Approach:</strong> {invocation.output.approach}
            </div>
            <div className="text-sm">
              <strong>Breakdown:</strong>
              <div className="mt-1 rounded bg-gray-50 p-2 text-xs">
                {invocation.output.breakdown}
              </div>
            </div>
            {invocation.output.components &&
              invocation.output.components.length > 0 && (
                <div className="text-sm">
                  <strong>Components:</strong>
                  <ul className="mt-1 list-inside list-disc text-xs">
                    {invocation.output.components.map((component, index) => (
                      <li key={index}>{component}</li>
                    ))}
                  </ul>
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
