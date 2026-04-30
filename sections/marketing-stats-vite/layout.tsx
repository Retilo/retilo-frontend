import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter_Tight({ subsets: ["latin"] });

export const metadata = {
  title: "Marketing Stats Vite",
  description: "Vite-inspired hero-sized statistics section with animated counters, gradient accent bars, and trend indicators.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>{children}</body>
    </html>
  );
}
