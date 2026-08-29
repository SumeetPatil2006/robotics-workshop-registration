import Link from "next/link";
import { RegistrationForm } from "@/components/registration-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-8 inline-flex text-sm font-medium text-slate-600 hover:text-slate-900">
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

        <RegistrationForm />
      </div>
    </main>
  );
}
