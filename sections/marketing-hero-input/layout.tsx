import { Fraunces, Figtree } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Marketing Hero Input",
  description: "Input-centric hero section with warm editorial design.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex min-h-svh flex-col antialiased",
          fraunces.variable,
          figtree.variable
        )}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {children}
      </body>
    </html>
  );
}
