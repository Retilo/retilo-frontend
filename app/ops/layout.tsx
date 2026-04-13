import { OpsNav } from "@/components/ops/ops-nav"

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.97 0.003 270)" }}>
      <OpsNav />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
