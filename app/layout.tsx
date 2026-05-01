import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter_Tight({ subsets: ["latin"] });

export const metadata = {
  title: "Marketing Bento Vercel",
  description: "Vercel-inspired bento grid section with variable-span cards, gradient accents, and spring animations.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>{children}</body>
    </html>
  );
}
