import Link from "next/link"

const CALENDLY = "https://calendly.com/satwikloka321/retilo?month=2026-03"

export function LandingFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/retilo-fox.svg" className="w-7 h-7" alt="" />
              <span className="font-bold text-gray-800 text-sm">Retilo</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              AI-powered CX agent platform for modern retail. Built for multi-location businesses.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-6 text-sm">
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Product</p>
              <a href="#features" className="block text-gray-500 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="block text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
              <a href="#integrations" className="block text-gray-500 hover:text-gray-900 transition-colors">Integrations</a>
            </div>
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Company</p>
              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="block text-gray-500 hover:text-gray-900 transition-colors">Book a demo</a>
              <Link href="/auth" className="block text-gray-500 hover:text-gray-900 transition-colors">Sign in</Link>
              <Link href="/auth" className="block text-gray-500 hover:text-gray-900 transition-colors">Get started</Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2026 Retilo. All rights reserved.</p>
          <p className="text-xs text-gray-400">
            Built for the future of retail CX. <span style={{ color: "oklch(0.58 0.24 350)" }}>app.retilo.io</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
