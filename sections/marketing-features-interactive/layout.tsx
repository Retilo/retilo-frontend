import { JetBrains_Mono, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Features Section — Interactive",
  description:
    "Interactive features section with cursor-reactive spotlight cards and animated SVG visuals.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex min-h-svh flex-col antialiased",
          outfit.variable,
          jetbrains.variable,
          outfit.className
        )}
      >
        {children}
      </body>
    </html>
  );
}
