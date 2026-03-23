"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";

const textClippedGifVariants = cva("bg-clip-text text-transparent", {
  variants: {
    size: {
      default: "text-2xl sm:text-3xl lg:text-4xl",
      xxs: "text-base sm:text-lg lg:text-lg",
      xs: "text-lg sm:text-xl lg:text-2xl",
      sm: "text-xl sm:text-2xl lg:text-3xl",
      md: "text-2xl sm:text-3xl lg:text-4xl",
      lg: "text-3xl sm:text-4xl lg:text-5xl",
      xl: "text-4xl sm:text-5xl lg:text-6xl",
      xxl: "text-5xl sm:text-6xl lg:text-[6rem]",
      xll: "text-5xl sm:text-6xl lg:text-[7rem]",
      xxxl: "text-[4.5rem] leading-5 sm:text-6xl lg:text-[8rem] lg:leading-8",
    },
    weight: {
      default: "font-bold",
      thin: "font-thin",
      base: "font-base",
      semi: "font-semibold",
      bold: "font-bold",
      black: "font-black",
    },
    font: {
      default: "font-sans",
      serif: "font-serif",
      mono: "font-mono",
    },
  },
  defaultVariants: {
    size: "default",
    weight: "bold",
    font: "default",
  },
});

interface TextClippedGifProps
  extends VariantProps<typeof textClippedGifVariants> {
  gifUrl: string;
  text: string;
  className?: string;
}

export const TextClippedGif: React.FC<TextClippedGifProps> = ({
  gifUrl,
  text,
  size,
  weight,
  font,
  className,
}) => {
  return (
    <div className="relative inline-block">
      <div
        className={cn(
          textClippedGifVariants({ size, weight, font }),
          className
        )}
        style={{
          backgroundImage: `url(${gifUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          WebkitBackgroundClip: "text",
          color: "transparent",
          lineHeight: 1,

          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// USAGE
{
  /* <TextClippedGif
className="leading-[0.05rem]"
gifUrl="https://media4.giphy.com/media/3zvbrvbRe7wxBofOBI/giphy.webp?cid=ecf05e47dn4a7rag1fno7sr5xwanzwscik8u41fdq35c1k6m&ep=v1_gifs_search&rid=giphy.webp&ct=g"
text="Preview."
size="xxxl"
weight="black"
/> */
}
