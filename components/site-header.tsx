import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 font-bold text-slate-950 shadow-lg shadow-cyan-500/30">
            T
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide text-white">TechSpark</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Summit 2026</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/#about" className="transition hover:text-white">About</Link>
          <Link href="/#schedule" className="transition hover:text-white">Schedule</Link>
          <Link href="/#faq" className="transition hover:text-white">FAQ</Link>
          <Link href="/admin" className="transition hover:text-white">Admin</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center rounded-full border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500 hover:text-slate-950"
          >
            Register Now
          </Link>
        </div>
      </div>
    </header>
  );
}
