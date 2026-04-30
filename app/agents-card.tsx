"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { TextScramble } from "../text-scramble";
import { ArrowButton, FeatureCardHeader } from "./shared";

const thinkingMessages = [
  "Thinking...",
  "Analyzing...",
  "Processing...",
  "Computing...",
  "Reasoning...",
];

export function AgentsCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const handleHover = () => {
    setIsHovered(true);
    setMessageIndex((prev) => (prev + 1) % thinkingMessages.length);
  };

  const handleLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-secondary/50 p-6 sm:p-8 md:p-10">
      <FeatureCardHeader
        description="Deliver more value to users by executing complex workflows."
        title="Agents"
      />
      <ArrowButton />

      {/* Chat interface mockup */}
      <div
        className="mt-auto min-w-0 cursor-pointer overflow-hidden rounded-lg border border-border bg-background p-3 transition-shadow hover:shadow-md sm:p-4"
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
      >
        <div className="mb-3 flex items-center gap-2 text-muted-foreground text-sm sm:mb-4">
          <ThinkingIcon isAnimating={isHovered} />
          <TextScramble
            as="span"
            className="truncate"
            duration={0.6}
            key={messageIndex}
            speed={0.03}
            trigger={true}
          >
            {thinkingMessages[messageIndex]}
          </TextScramble>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 sm:px-4">
          <input
            className="min-w-0 flex-1 bg-transparent text-foreground text-sm outline-none"
            placeholder=""
            readOnly
            type="text"
          />
          <button className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-foreground transition-transform hover:scale-110">
            <Send className="h-3.5 w-3.5 text-background" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ThinkingIcon({ isAnimating }: { isAnimating?: boolean }) {
  return (
    <svg
      className={isAnimating ? "animate-spin" : ""}
      fill="none"
      height="16"
      style={{ transition: "transform 0.3s ease" }}
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1V3M8 13V15M1 8H3M13 8H15M3.05 3.05L4.46 4.46M11.54 11.54L12.95 12.95M3.05 12.95L4.46 11.54M11.54 4.46L12.95 3.05"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
