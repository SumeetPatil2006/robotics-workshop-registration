"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type SavedRegistration = {
  registration: {
    registration_id: string;
    full_name: string;
    branch: string;
    year: string;
    email: string;
  };
  ticket: {
    qrCodeDataUrl: string;
  };
};

// No PDF export constants needed anymore

const getStoredRegistration = (): SavedRegistration | null => {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem("robotics-workshop-registration");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedRegistration;
  } catch {
    return null;
  }
};

// No helper functions needed for QR-only download

function TicketCardBody({ registration, ticket }: { registration: SavedRegistration["registration"]; ticket: SavedRegistration["ticket"] }) {
  return (
    <div className="w-full max-w-[860px] rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Techfest × KBTCOE</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900">Robotics Workshop</h1>
        </div>
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Confirmed</span>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_0.8fr] md:items-center">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Participant name</p>
            <p className="mt-2 text-xl font-medium text-slate-900">{registration.full_name}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Branch</p>
              <p className="mt-2 text-base text-slate-700">{registration.branch}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Year</p>
              <p className="mt-2 text-base text-slate-700">{registration.year}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Email</p>
              <p className="mt-2 text-base text-slate-700">{registration.email}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-stone-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Registration ID</p>
            <p className="mt-2 text-2xl font-semibold tracking-[0.06em] text-slate-900">{registration.registration_id}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
          <Image src={ticket.qrCodeDataUrl} alt="QR code ticket" width={144} height={144} unoptimized className="h-36 w-36 rounded-xl border border-slate-200 bg-white p-2" />
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Digital ticket</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900">Back to home</Link>
        <Link href="/register" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">Register again</Link>
      </div>
    </div>
  );
}

function TicketCard() {
  const [data] = useState<SavedRegistration | null>(getStoredRegistration);
  const hasAutoDownloadedRef = useRef(false);

  useEffect(() => {
    if (!data || hasAutoDownloadedRef.current) return;

    const downloadQr = () => {
      try {
        const { registration, ticket } = data;
        const a = document.createElement("a");
        a.href = ticket.qrCodeDataUrl;
        a.download = `robotics-workshop-qr-${registration.registration_id}.png`;
        // some browsers require the link to be in the document
        document.body.appendChild(a);
        a.click();
        a.remove();
        hasAutoDownloadedRef.current = true;
      } catch (err) {
        console.error("QR download failed:", err);
      }
    };

    // small delay to ensure visuals render before auto-download
    const t = window.setTimeout(downloadQr, 250);
    return () => window.clearTimeout(t);
  }, [data]);

  if (!data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Registration status</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-slate-900">No ticket found</h1>
        <p className="mt-4 text-base text-slate-600">Your registration details were not found. Please return to the registration form and submit again.</p>
        <Link href="/register" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">Register again</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TicketCardBody registration={data.registration} ticket={data.ticket} />
    </div>
  );
}

export default TicketCard;
export { TicketCard };
