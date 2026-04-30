import { Inter_Tight } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter_Tight({ subsets: ["latin"] });

export const metadata = {
  title: "Marketing Bento Core Capabilities",
  description:
    "Light marketing bento with asymmetric grid, feature cards, and product UI illustrations.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col bg-background text-foreground antialiased", inter.className)}>
        {children}
      </body>
    </html>
  );
}
