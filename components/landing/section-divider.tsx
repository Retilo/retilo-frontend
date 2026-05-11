"use client"

export function SectionDivider({ n, label }: { n: string; label: string }) {
  return (
    <div
      className="relative flex items-center gap-4 px-6 md:px-10 lg:px-16"
      style={{ height: 36, borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.04)" }}
      aria-hidden
    >
      {/* Left: step number */}
      <span
        style={{
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "oklch(0.58 0.24 350)",
          textTransform: "uppercase",
        }}
      >
        {n}
      </span>

      {/* Divider line */}
      <span style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.06)" }} />

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.16em",
          color: "rgba(0,0,0,0.3)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>

      {/* Right dot in brand color */}
      <span
        style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "oklch(0.58 0.24 350)",
          flexShrink: 0,
        }}
      />
    </div>
  )
}
