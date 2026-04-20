import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const interTight = Inter_Tight({ subsets: ["latin"] });

export const metadata = {
  title: "Marketing Hero Ribbon",
  description: "Minimal marketing hero with path-following ribbon tile marquee.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full" lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", interTight.className)}>{children}</body>
    </html>
  );
}
