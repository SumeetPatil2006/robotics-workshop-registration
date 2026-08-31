import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircuitBoard, Cpu, MapPin } from "lucide-react";
import { eventConfig, eventDetails } from "@/lib/event-data";

export default function HomePage() {
  const techItems = [
    {
      title: "Line Following Robot",
      description: "Build a robot that senses and tracks a path with precision.",
      icon: Cpu,
    },
    {
      title: "Pick & Place Robot",
      description: "Design a robot that identifies and moves objects reliably.",
      icon: CircuitBoard,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#dfeafc] bg-[#edf6ff]">
              <Image
                src="/images/Techfest logo.png"
                alt="Techfest logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">
                Techfest
              </p>
              <p className="mt-1 text-base font-semibold tracking-[-0.03em] text-[var(--navy)]">
                Robotics Workshop
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="pt-2 lg:pt-4">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-[620px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--blue)]">
                {eventConfig.partner}
              </p>
              <h1 className="mt-5 text-[3.3rem] font-semibold leading-[0.9] tracking-[-0.07em] text-[var(--navy)] sm:text-[4.1rem] lg:text-[5.3rem]">
                <span className="block">Robotics</span>
                <span className="block text-[var(--blue)]">Workshop</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                {eventConfig.shortDescription}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blue)]"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[32px] border border-[#dfeafc] bg-[linear-gradient(135deg,_rgba(118,214,255,0.16),_rgba(255,255,255,0.94)_40%,_rgba(186,230,255,0.18))]" />
              <div className="relative overflow-hidden rounded-[32px] border border-[#dfeafc] bg-white p-3 shadow-[0_20px_50px_rgba(13,29,59,0.06)] sm:p-5">
                <div className="tech-grid absolute inset-0 opacity-70" />
                <div className="absolute left-4 top-4 h-24 w-24 rounded-full border border-[#bfe9ff] bg-[#f3fbff]" />
                <div className="absolute bottom-5 left-5 h-14 w-14 rounded-full border border-[#d7ecff] bg-[#edf8ff]" />
                <div className="absolute right-4 top-8 h-28 w-28 rounded-full border border-[#dfeafc] bg-[#f9fcff]" />

                <div className="relative z-10 overflow-hidden rounded-[26px] border border-[#dfeafc] bg-[rgba(255,255,255,0.9)] p-3 sm:p-4">
                  <div className="relative h-[300px] w-full overflow-hidden rounded-[18px] sm:h-[340px] lg:h-[380px]">
                    <Image
                      src="/robotics-hero.png"
                      alt="Robotics workshop illustration"
                      fill
                      priority
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 42vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 border-t border-[var(--border)] pt-10 lg:mt-14">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_1.1fr_0.95fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfeafc] bg-[#edf6ff] text-[var(--blue)]">
                  <Cpu className="h-4 w-4" />
                </div>
                <p className="section-label !tracking-[0.24em]">About the workshop</p>
              </div>
              <p className="mt-5 text-base leading-7 text-[var(--muted)] sm:text-lg">
                {eventConfig.description}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfeafc] bg-[#edf6ff] text-[var(--blue)]">
                  <CircuitBoard className="h-4 w-4" />
                </div>
                <p className="section-label !tracking-[0.24em]">What you&apos;ll build</p>
              </div>
              <div className="mt-5 space-y-3">
                {techItems.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-white px-3 py-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfeafc] bg-[#edf6ff] text-[var(--blue)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-base font-semibold tracking-[-0.04em] text-[var(--navy)]">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfeafc] bg-[#edf6ff] text-[var(--blue)]">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="section-label !tracking-[0.24em]">Event details</p>
              </div>
              <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-white p-4 shadow-[0_12px_32px_rgba(13,29,59,0.04)] sm:p-5">
                {eventDetails.map((item) => (
                  <div key={item.label} className="detail-row">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-[var(--navy)] sm:text-base">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 text-sm text-[var(--muted)] sm:px-6 lg:px-8">
          <span>{eventConfig.partner}</span>
          <span>{eventConfig.footerNote}</span>
        </div>
      </footer>
    </div>
  );
}
