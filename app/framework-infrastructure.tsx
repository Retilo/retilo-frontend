import { FileText, Hexagon, Layers, LayoutGrid, Settings2 } from "lucide-react";

export function FrameworkInfrastructure() {
  return (
    <section className="border-border border-b">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left side - Framework visualization */}
        <div className="border-border border-b p-8 md:p-12 lg:border-r lg:border-b-0">
          <div className="group relative h-64 cursor-pointer md:h-80">
            <style>
              {`
                .framework-line {
                  stroke-dasharray: 300;
                  stroke-dashoffset: 300;
                  transition: stroke-dashoffset 0.6s ease-out, opacity 0.3s ease;
                }
                .group:hover .framework-line {
                  stroke-dashoffset: 0;
                }
                .feature-line {
                  stroke-dasharray: 300;
                  stroke-dashoffset: -300;
                  transition: stroke-dashoffset 0.6s ease-out, opacity 0.3s ease;
                }
                .group:hover .feature-line {
                  stroke-dashoffset: 0;
                }
                .framework-icon {
                  opacity: 0.5;
                  transform: translateX(0);
                  transition: all 0.3s ease-out;
                }
                .group:hover .framework-icon {
                  opacity: 1;
                  transform: translateX(4px);
                }
                .feature-icon-el {
                  opacity: 0.5;
                  transform: translateX(0);
                  transition: all 0.3s ease-out;
                }
                .group:hover .feature-icon-el {
                  opacity: 1;
                  transform: translateX(-4px);
                }
                .vercel-center {
                  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
                }
                .group:hover .vercel-center {
                  transform: scale(1.1);
                  box-shadow: 0 0 30px 8px rgba(0,0,0,0.15);
                }
              `}
            </style>

            {/* Framework icons on left */}
            <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-4">
              <div
                className="framework-icon"
                style={{ transitionDelay: "0ms", color: "#FF3E00" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                  <SvelteIcon />
                </div>
              </div>
              <div
                className="framework-icon"
                style={{ transitionDelay: "50ms", color: "#646CFF" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                  <ViteIcon />
                </div>
              </div>
              <div
                className="framework-icon"
                style={{ transitionDelay: "100ms", color: "#000000" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                  <NextIcon />
                </div>
              </div>
              <div
                className="framework-icon"
                style={{ transitionDelay: "150ms", color: "#00DC82" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                  <NuxtIcon />
                </div>
              </div>
              <div
                className="framework-icon"
                style={{ transitionDelay: "200ms", color: "#F9A826" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                  <TurboIcon />
                </div>
              </div>
            </div>

            {/* Center Vercel logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="vercel-center flex h-16 w-16 items-center justify-center rounded-full bg-foreground">
                <VercelLogo />
              </div>
            </div>

            {/* Feature icons on right */}
            <div className="absolute top-0 right-0 bottom-0 flex flex-col justify-between py-4">
              <div
                className="feature-icon-el"
                style={{ transitionDelay: "150ms" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                  <LayoutGrid className="h-4 w-4" />
                </div>
              </div>
              <div
                className="feature-icon-el"
                style={{ transitionDelay: "200ms" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                  <Settings2 className="h-4 w-4" />
                </div>
              </div>
              <div
                className="feature-icon-el"
                style={{ transitionDelay: "250ms" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div
                className="feature-icon-el"
                style={{ transitionDelay: "300ms" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Connecting lines SVG */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 400 300"
            >
              {/* Lines from frameworks to center */}
              <path
                className="framework-line"
                d="M 40 30 Q 120 60 200 150"
                fill="none"
                opacity="0.6"
                stroke="#FF3E00"
                strokeWidth="2"
                style={{ transitionDelay: "0ms" }}
              />
              <path
                className="framework-line"
                d="M 40 90 Q 120 110 200 150"
                fill="none"
                opacity="0.6"
                stroke="#646CFF"
                strokeWidth="2"
                style={{ transitionDelay: "50ms" }}
              />
              <path
                className="framework-line"
                d="M 40 150 L 200 150"
                fill="none"
                opacity="0.6"
                stroke="#000000"
                strokeWidth="2"
                style={{ transitionDelay: "100ms" }}
              />
              <path
                className="framework-line"
                d="M 40 210 Q 120 190 200 150"
                fill="none"
                opacity="0.6"
                stroke="#00DC82"
                strokeWidth="2"
                style={{ transitionDelay: "150ms" }}
              />
              <path
                className="framework-line"
                d="M 40 270 Q 120 240 200 150"
                fill="none"
                opacity="0.6"
                stroke="#F9A826"
                strokeWidth="2"
                style={{ transitionDelay: "200ms" }}
              />

              {/* Lines from center to features */}
              <path
                className="feature-line"
                d="M 200 150 Q 280 60 360 30"
                fill="none"
                opacity="0.4"
                stroke="#666"
                strokeWidth="1.5"
                style={{ transitionDelay: "100ms" }}
              />
              <path
                className="feature-line"
                d="M 200 150 Q 280 110 360 100"
                fill="none"
                opacity="0.4"
                stroke="#666"
                strokeWidth="1.5"
                style={{ transitionDelay: "150ms" }}
              />
              <path
                className="feature-line"
                d="M 200 150 Q 280 190 360 200"
                fill="none"
                opacity="0.4"
                stroke="#666"
                strokeWidth="1.5"
                style={{ transitionDelay: "200ms" }}
              />
              <path
                className="feature-line"
                d="M 200 150 Q 280 240 360 270"
                fill="none"
                opacity="0.4"
                stroke="#666"
                strokeWidth="1.5"
                style={{ transitionDelay: "250ms" }}
              />
            </svg>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
            <Hexagon className="h-4 w-4" />
            <span>Framework-Defined Infrastructure</span>
          </div>
          <h2 className="mb-4 font-semibold text-2xl text-foreground leading-tight md:text-3xl">
            <span className="text-foreground">
              From code to infrastructure in one git push.
            </span>{" "}
            <span className="text-muted-foreground">
              Vercel deeply understands your app to provision the right
              resources and optimize for high-performance apps.
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}

function VercelLogo() {
  return (
    <svg fill="white" height="24" viewBox="0 0 24 24" width="24">
      <path d="M12 2L2 22h20L12 2z" />
    </svg>
  );
}

function SvelteIcon() {
  return (
    <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
      <path d="M20.25 3.75C17.25 0 11.25 1.5 8.25 5.25c-2.25 2.25-2.25 6 0 8.25.75.75 1.5 1.5 2.25 1.5-.75 1.5-2.25 2.25-3.75 2.25-2.25 0-4.5-1.5-5.25-3.75-.75-2.25 0-5.25 2.25-6.75C6 4.5 9 3 12 3c3 0 6 1.5 8.25 4.5 1.5 2.25 1.5 5.25 0 7.5-1.5 2.25-4.5 3-6.75 2.25 1.5-1.5 2.25-3.75 1.5-6-.75-2.25-3-3.75-5.25-3.75-2.25 0-4.5 1.5-5.25 3.75-.75 2.25 0 5.25 2.25 6.75 2.25 1.5 5.25 1.5 7.5 0 2.25-1.5 3.75-4.5 3-7.5" />
    </svg>
  );
}

function ViteIcon() {
  return (
    <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
      <path d="M12 2L2 7l1.5 11L12 22l8.5-4L22 7L12 2zm0 2.5l6.5 3.25-1 7.5L12 18.5l-5.5-3.25-1-7.5L12 4.5z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
      <circle cx="12" cy="12" fill="currentColor" r="10" />
    </svg>
  );
}

function NuxtIcon() {
  return (
    <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
      <path d="M12 2L2 20h20L12 2z" />
    </svg>
  );
}

function TurboIcon() {
  return (
    <svg fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
      <rect height="16" rx="2" width="16" x="4" y="4" />
    </svg>
  );
}
