"use client";

import type { NewsSearchUIToolInvocation } from "../../lib/multi-step-tool-types";

interface NewsSearchViewProps {
  invocation: NewsSearchUIToolInvocation;
}

export default function NewsSearchView({ invocation }: NewsSearchViewProps) {
  switch (invocation.state) {
    case "input-streaming":
      return <div className="text-gray-500">Preparing news search...</div>;

    case "input-available":
      return (
        <div className="text-gray-500">
          Searching for news about: <strong>{invocation.input.topic}</strong>
        </div>
      );

    case "output-available":
      if (invocation.output.state === "loading") {
        return (
          <div className="text-gray-500">
            Searching for news about: <strong>{invocation.input.topic}</strong>
            ...
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <div className="font-medium text-gray-700 text-sm">
            News Results for: <strong>{invocation.input.topic}</strong>
          </div>
          <div className="space-y-2">
            {invocation.output.items?.map((item, index) => (
              <div className="border-green-200 border-l-2 pl-3" key={index}>
                <div className="font-medium text-sm">
                  {item.url ? (
                    <a
                      className="text-green-600 hover:text-green-800"
                      href={item.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <span className="text-gray-800">{item.title}</span>
                  )}
                </div>
                {item.publishedAt && (
                  <div className="text-gray-500 text-xs">
                    Published: {new Date(item.publishedAt).toLocaleDateString()}
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
