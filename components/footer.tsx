import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-xl font-bold text-white">TechSpark Summit</p>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            A one-day innovation experience for builders, thinkers, and future tech leaders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-300">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <Link href="/#about" className="transition hover:text-white">About</Link>
          <Link href="/#schedule" className="transition hover:text-white">Schedule</Link>
          <Link href="/register" className="transition hover:text-white">Register</Link>
        </div>
      </div>
    </footer>
  );
}
