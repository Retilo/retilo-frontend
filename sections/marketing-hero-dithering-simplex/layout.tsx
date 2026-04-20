import { DM_Sans, Syne } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Dithering Simplex Hero",
  description: "Marketing hero with simplex dither shader background.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("flex min-h-svh flex-col antialiased", syne.variable, dmSans.variable, dmSans.className)}>
        {children}
      </body>
    </html>
  );
}
