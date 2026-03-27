// @ts-nocheck
import type { ChatStatus } from "ai";
import { AlertCircleIcon, ExternalLinkIcon } from "lucide-react";
import type { SVGProps } from "react";
import { Loader } from "@/components/ai-elements/loader";
import { cn } from "@/lib/utils";

type HeaderSectionProps = {
  hasResults: boolean;
  status: ChatStatus;
};

function HeaderSectionHeading({
  title = "",
  subtitle = "",
  status,
  patternType,
}: {
  title: string;
  subtitle: string;
  status: ChatStatus;
  patternType: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 md:flex-row">
      <div className="flex items-center justify-center rounded-lg bg-muted p-[4px] shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
        {status === "error" && (
          <div className="rounded-md bg-destructive/10 p-1 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
            <AlertCircleIcon className="size-8 text-destructive" />
          </div>
        )}
        {status !== "ready" && status !== "error" && (
          <div className="rounded-md bg-primary/10 p-1 shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
            <Loader className="size-8 text-foreground" />
          </div>
        )}
        {status === "ready" && (
          <div className="flex items-center gap-2">
            <OpenAIIcon className="size-8 rounded-md bg-primary/10 p-1 text-foreground shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]" />
            <AISDKIcon className="size-8 rounded-md bg-primary/10 p-1 text-foreground shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]" />
          </div>
        )}
      </div>
      <div>
        <h1 className="font-semibold text-2xl text-foreground tracking-tight">
          {status === "error" ? (
            <span className="text-destructive">Error</span>
          ) : (
            title
          )}
        </h1>
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <p className="font-mono text-muted-foreground text-xs md:text-sm">
            {subtitle}
          </p>{" "}
          <p className="rounded-full bg-muted/50 px-2 py-1 text-muted-foreground text-xs">
            {patternType}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeaderSectionCallout({ children }: { children: React.ReactNode }) {
  return (
    <span className="inset-shadow-2xs inset-shadow-white/25 whitespace-nowrap rounded-[3px] border-[1px] border-primary/10 bg-linear-to-b from-primary/5 to-muted/40 px-1 py-[1px] text-primary text-xs">
      {children}
    </span>
  );
}

function HeaderSectionLink({
  href,
  children,
  isCodeExample = false,
}: {
  href: string;
  children: React.ReactNode;
  isCodeExample?: boolean;
}) {
  return (
    <a
      className={cn(
        "group inline-flex items-center whitespace-nowrap rounded-[3px] border border-border/20 px-1 py-[1px] text-xs transition-all duration-50 ease-out hover:font-medium hover:text-blue-600",
        isCodeExample &&
          "pt-[2px] font-mono text-[10px] text-foreground/80 tracking-tighter"
      )}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}{" "}
      <ExternalLinkIcon className="ml-1 size-2 translate-x-[-2px] transform text-gray-600 opacity-50 transition-all duration-150 ease-out group-hover:translate-x-0 group-hover:scale-110 group-hover:opacity-100" />
    </a>
  );
}

function SdkItemsUsed({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-muted-foreground text-xs">
        <AISDKIcon className="size-3" />
      </div>
      {items.map((item) => (
        <HeaderSectionLink href={item.href} isCodeExample key={item.href}>
          {item.label}
        </HeaderSectionLink>
      ))}
    </div>
  );
}

/**
 * Header Section Component
 *
 * Displays the main title, current stage information, and tool descriptions.
 * Shows different content based on whether there are results and current status.
 */
export const HeaderSection = ({ hasResults, status }: HeaderSectionProps) => (
  <div className={cn("space-y-2", !hasResults ? "mx-auto" : "pl-6")}>
    <div className="flex items-center justify-between">
      <HeaderSectionHeading
        patternType="Human-in-the-Loop Demo"
        status={status}
        subtitle="AI SDK v5 + Official HITL Pattern"
        title="Human-in-the-Loop Assistant"
      />
    </div>

    <div className={cn("space-y-6", hasResults && "hidden")}>
      <p className="mb-4 max-w-lg pl-3 text-muted-foreground text-xs leading-5 tracking-tight lg:pl-0 lg:text-sm lg:leading-snug xl:max-w-2xl">
        This demo shows how AI can pause and ask for human approval before
        taking action. Built with{" "}
        <HeaderSectionLink href="https://ai-sdk.dev/docs/introduction">
          AI SDK v5
        </HeaderSectionLink>{" "}
        and the{" "}
        <HeaderSectionLink href="https://ai-sdk.dev/cookbook/next/human-in-the-loop#human-in-the-loop-with-nextjs">
          human-in-the-loop pattern
        </HeaderSectionLink>
        . Try these examples: weather check, content moderation, shopping cart,
        user approval, or payment processing.{" "}
        <HeaderSectionCallout>Tools requiring approval</HeaderSectionCallout>{" "}
        will wait for your confirmation.{" "}
        <HeaderSectionCallout>Auto-execute tools</HeaderSectionCallout> run
        immediately. This keeps AI safe and trustworthy.
      </p>
      <SdkItemsUsed
        items={[
          {
            href: "https://ai-sdk.dev/docs/reference/ai-sdk-core/tool#tool",
            label: "tool()",
          },
          {
            href: "https://ai-sdk.dev/docs/reference/ai-sdk-ui/create-ui-message-stream#createuimessagestream",
            label: "createUIMessageStream()",
          },
          {
            href: "https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat#usechat",
            label: "useChat()",
          },
          {
            href: "https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat#add-tool-result",
            label: "addToolResult()",
          },
        ]}
      />
    </div>
  </div>
);


const OpenAIIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-label="OpenAI logo"
    height="1em"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 260"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>OpenAI logo</title>
    <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
  </svg>
);

function AISDKIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="text-zinc-800 dark:text-zinc-100">
      <svg
        aria-label="AI SDK icon"
        data-testid="multi-agent-icon"
        height="16"
        strokeLinejoin="round"
        style={{ color: "currentcolor" }}
        viewBox="0 0 16 16"
        width="16"
        {...props}
      >
        <title>AI SDK icon</title>
        <path
          d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z"
          fill="currentColor"
        />
        <path
          d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z"
          fill="currentColor"
        />
        <path
          d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}