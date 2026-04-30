import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter_Tight({ subsets: ["latin"] });

export const metadata = {
  title: "Social Proof Vite",
  description: "Vite-inspired social proof section with logo marquee, animated metrics, and developer testimonial cards.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>{children}</body>
    </html>
  );
}
