import { Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const instrumentSans = Instrument_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Marketing Stats Globe",
  description:
    "Statistics section with an interactive 3D globe visualization and animated metric cards.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex min-h-svh flex-col antialiased",
          instrumentSans.className
        )}
      >
        {children}
      </body>
    </html>
  );
}
