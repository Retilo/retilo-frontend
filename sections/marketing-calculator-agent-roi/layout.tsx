import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter_Tight({ subsets: ["latin"] });

export const metadata = {
  title: "Agent ROI Calculator",
  description:
    "Advanced ROI calculator for AI agent implementations with interactive charts, cost-benefit analysis, and performance projections. Features dynamic input controls, real-time calculations, and comprehensive reporting for strategic decision-making and investment planning.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>{children}</body>
    </html>
  );
}
