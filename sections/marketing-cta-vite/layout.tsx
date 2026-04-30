import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter_Tight({ subsets: ["latin"] });

export const metadata = {
  title: "Marketing CTA Vite",
  description: "Vite-inspired CTA section with gradient accents, spring animations, and social proof.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>{children}</body>
    </html>
  );
}
