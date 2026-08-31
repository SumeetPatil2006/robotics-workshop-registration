import { TicketCard } from "@/components/ticket-card";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-12 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <TicketCard />
        <div className="mt-4 text-center text-sm text-slate-500">
          To avoid any inconvenience, please take a screenshot of this ticket and keep it saved for entry.
        </div>
      </div>
    </main>
  );
}
