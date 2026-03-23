"use client";

import { ArrowRight } from "lucide-react";

import { motion } from "motion/react";
import { TextRoll } from "@/components/text-roll";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function MarketingHero() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted/20 to-accent/20 opacity-50"
        style={{
          maskImage:
            "radial-gradient(circle at center, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />

      <div className="relative px-3 py-16 text-center sm:px-4 sm:py-20 md:px-6 md:py-24 lg:px-8 lg:py-32">
        {/* Main content */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl space-y-6 sm:space-y-8 xl:max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {/* Eyebrow text */}
          <motion.p
            animate={{ opacity: 1 }}
            className="font-medium text-primary text-xs uppercase tracking-wider sm:text-sm"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to the Future
          </motion.p>

          {/* Headline */}
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-2xl leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <TextRoll className="text-2xl text-black sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl dark:text-white">
              Build Amazing Things Together
            </TextRoll>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            animate={{ opacity: 1 }}
            className="mx-auto max-w-xl px-2 text-base text-muted-foreground leading-relaxed sm:px-0 sm:text-lg"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
          >
            Create stunning websites and applications with our modern UI
            components and development tools.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
          >
            <Button className="w-full gap-2 sm:w-auto" size="lg">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button className="w-full sm:w-auto" size="lg" variant="outline">
              Learn More
            </Button>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
          >
            {features.map((feature, index) => (
              <Card className="p-4 text-left sm:p-6" key={index}>
                <feature.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                <h3 className="mt-3 font-semibold text-sm sm:mt-4 sm:text-base">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground text-xs leading-relaxed sm:text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Modern Design",
    description:
      "Beautiful, responsive components built with modern design principles.",
    icon: ArrowRight,
  },
  {
    title: "Developer Experience",
    description:
      "Intuitive APIs and comprehensive documentation for rapid development.",
    icon: ArrowRight,
  },
  {
    title: "Performance First",
    description:
      "Optimized for speed and efficiency without sacrificing functionality.",
    icon: ArrowRight,
  },
];
