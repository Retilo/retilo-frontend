"use client";

import { useState } from "react";
import { InfiniteSlider } from "../infinite-slider";
import { ArrowButton, FeatureCardHeader } from "./shared";

const products = [
  { color: "#3B82F6" },
  { color: "#1F2937" },
  { color: "#9CA3AF" },
  { color: "#EF4444" },
  { color: "#10B981" },
  { color: "#F59E0B" },
];

export function CommerceCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex h-full flex-col p-8 md:p-10">
      <FeatureCardHeader
        description="Increase conversion with fast, branded storefronts."
        title="Composable Commerce"
      />
      <ArrowButton />

      {/* Product cards mockup */}
      <div className="mt-auto">
        <div
          className="cursor-pointer overflow-hidden rounded-lg border border-border bg-secondary p-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered ? (
            <InfiniteSlider className="py-0" gap={8} speed={40}>
              {products.map((product, index) => (
                <div
                  className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background p-3"
                  key={index}
                >
                  <TShirtIcon color={product.color} />
                </div>
              ))}
            </InfiniteSlider>
          ) : (
            <div className="flex gap-2">
              {/* T-shirt cards */}
              <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-background p-3">
                <TShirtIcon color="#3B82F6" />
              </div>
              <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-background p-3">
                <TShirtIcon color="#1F2937" />
              </div>
              <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-background p-3 opacity-50">
                <TShirtIcon color="#9CA3AF" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TShirtIcon({ color }: { color: string }) {
  return (
    <svg
      fill="none"
      height="48"
      viewBox="0 0 48 48"
      width="48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 8L8 14V20L12 18V40H36V18L40 20V14L32 8H16Z"
        fill={color}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M16 8C16 12.4183 19.5817 16 24 16C28.4183 16 32 12.4183 32 8"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
