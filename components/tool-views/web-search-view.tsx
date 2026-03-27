"use client";

import type { WebSearchUIToolInvocation } from "../../lib/multi-step-tool-types";

interface WebSearchViewProps {
  invocation: WebSearchUIToolInvocation;
}

export default function WebSearchView({ invocation }: WebSearchViewProps) {
  switch (invocation.state) {
    case "input-streaming":
      return <div className="text-gray-500">Preparing search query...</div>;

    case "input-available":
      return (
        <div className="text-gray-500">
          Searching the web for: <strong>{invocation.input.query}</strong>
        </div>
      );

    case "output-available":
      if (invocation.output.state === "loading") {
        return (
          <div className="text-gray-500">
            Searching the web for: <strong>{invocation.input.query}</strong>...
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <div className="font-medium text-gray-700 text-sm">
            Web Search Results for: <strong>{invocation.input.query}</strong>
          </div>
          <div className="space-y-2">
            {invocation.output.results?.map((result, index) => (
              <div className="border-blue-200 border-l-2 pl-3" key={index}>
                <div className="font-medium text-sm">
                  <a
                    className="text-blue-600 hover:text-blue-800"
                    href={result.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {result.title}
                  </a>
                </div>
                {result.source && (
                  <div className="text-gray-500 text-xs">{result.source}</div>
                )}
                {result.snippet && (
                  <div className="mt-1 text-gray-600 text-sm">
                    {result.snippet}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "output-error":
      return <div className="text-red-500">Error: {invocation.errorText}</div>;

    default:
      return null;
  }
}
