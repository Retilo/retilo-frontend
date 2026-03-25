export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-ui="dashboard" className="min-h-screen" style={{ background: "oklch(0.985 0.003 350)" }}>
      {children}
    </div>
  )
}
