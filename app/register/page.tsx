import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to home
        </Link>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Registration
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-900">
            Robotics Workshop
          </h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
            🔒
          </div>

          <h2 className="mt-6 text-2xl font-semibold text-slate-900">
            Registration Closed
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            Thank you for the overwhelming response! We have reached the
            registration capacity for the Robotics Workshop.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}