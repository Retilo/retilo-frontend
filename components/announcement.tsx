"use client";

import { ArrowRight, Blocks } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export function Announcement() {
  const discountCode = "CULT_OF_MITHRAS";

  const handleCopy = () => {
    navigator.clipboard
      .writeText(discountCode)
      .then(() => {
        toast.success("Discount code copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Error copying discount code:");
        console.error("Failed to copy discount code: ", err);
      });
  };

  return (
    <button
      className="group inline-flex cursor-pointer items-center rounded-lg border border-black/10 bg-transparent px-3 py-1 font-medium text-neutral-800 text-xs shadow-sm lg:text-sm"
      onClick={handleCopy}
    >
      <Blocks className="h-4 w-4 fill-paint-blue-300 group-hover:rotate-6" />{" "}
      <span className="ml-1">New </span>
      <Separator className="mx-2 h-4 bg-neutral-900" orientation="vertical" />{" "}
      <span>launch discount! $60 off</span>
      <span>click to copy</span>
      <ArrowRight className="ml-1 h-4 w-4" />
    </button>
  );
}
