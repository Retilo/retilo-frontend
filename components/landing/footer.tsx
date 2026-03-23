import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="bg-[oklch(0.07_0.010_270)] border-t border-white/8 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[oklch(0.55_0.24_280)] flex items-center justify-center">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <span className="font-bold text-white/70 text-sm">Retilo</span>
        </div>
        <p className="text-xs text-white/30 text-center md:text-left">
          AI-powered Google Business automation platform.
          Built for multi-location businesses.
        </p>
        <div className="flex items-center gap-4 text-xs text-white/30">
          <Link href="/auth" className="hover:text-white/60 transition-colors">Sign in</Link>
          <Link href="/auth" className="hover:text-white/60 transition-colors">Get started</Link>
        </div>
      </div>
    </footer>
  )
}
