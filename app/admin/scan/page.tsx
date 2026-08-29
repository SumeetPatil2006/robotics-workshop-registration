"use client";

import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { BrowserCodeReader, BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";

type RegistrationRecord = {
  id: string;
  registration_id: string;
  full_name: string;
  email: string;
  branch: string;
  year: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
};

type ResultState =
  | "idle"
  | "valid"
  | "invalid"
  | "already_checked_in"
  | "check_in_success"
  | "error"
  | "scanning";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const isProcessingRef = useRef(false);
  const currentTicketIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<ResultState>("scanning");
  const [message, setMessage] = useState("Scanning for QR ticket...");
  const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
  const [cameraError, setCameraError] = useState("");

  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  };

  const handleCheckIn = async () => {
    if (!currentTicketIdRef.current) {
      return;
    }

    setStatus("scanning");
    setMessage("Checking in...");

    try {
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId: currentTicketIdRef.current }),
      });

      const data = (await response.json()) as {
        registration?: RegistrationRecord;
        checked_in_at?: string | null;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.registration) {
        setStatus("invalid");
        setMessage(data.error || "INVALID TICKET");
        setRegistration(null);
        return;
      }

      const updatedRegistration = {
        ...data.registration,
        checked_in: true,
        checked_in_at: data.checked_in_at ?? data.registration.checked_in_at ?? new Date().toISOString(),
      };

      setRegistration(updatedRegistration);
      setStatus("check_in_success");
      setMessage("CHECK-IN SUCCESSFUL");
    } catch {
      setStatus("invalid");
      setMessage("INVALID TICKET");
      setRegistration(null);
    }
  };

  const startScanner = async () => {
    if (typeof window === "undefined" || !videoRef.current) {
      return;
    }

    setCameraError("");
    setStatus("scanning");
    setMessage("Scanning for QR ticket...");
    setRegistration(null);
    currentTicketIdRef.current = null;
    isProcessingRef.current = false;

    try {
      const reader = new BrowserMultiFormatReader();
      const inputDevices = await BrowserCodeReader.listVideoInputDevices();
      const selectedDeviceId = inputDevices[0]?.deviceId ?? undefined;

      const controls = await reader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        async (result, error, scannerControls) => {
          controlsRef.current = scannerControls;
          if (isProcessingRef.current) {
            return;
          }

          if (result) {
            const candidate = result.getText().trim();

            if (!candidate) {
              return;
            }

            currentTicketIdRef.current = candidate;
            isProcessingRef.current = true;
            setStatus("scanning");
            setMessage("Verifying ticket...");

            try {
              const response = await fetch("/api/admin/verify-ticket", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ ticketId: candidate }),
              });

              const data = (await response.json()) as {
                valid?: boolean;
                already_checked_in?: boolean;
                registration?: RegistrationRecord;
                checked_in_at?: string | null;
                error?: string;
                message?: string;
              };

              if (!response.ok || !data.registration) {
                setStatus("invalid");
                setMessage(data.error || "INVALID TICKET");
                setRegistration(null);
                return;
              }

              if (data.already_checked_in) {
                setStatus("already_checked_in");
                setMessage("ALREADY CHECKED IN");
                setRegistration({
                  ...data.registration,
                  checked_in_at: data.checked_in_at ?? data.registration.checked_in_at ?? null,
                });
                return;
              }

              setStatus("valid");
              setMessage("VALID TICKET");
              setRegistration(data.registration);
            } catch {
              setStatus("invalid");
              setMessage("INVALID TICKET");
              setRegistration(null);
            }
          }

          if (error && error?.name !== "NotFoundException") {
            setStatus("error");
            setCameraError("Unable to access the camera. Please allow camera permissions and try again.");
          }
        },
      );

      controlsRef.current = controls;
    } catch {
      setStatus("error");
      setCameraError("Camera access is unavailable on this device or browser.");
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      void startScanner();
    }, 0);

    return () => {
      window.clearTimeout(id);
      stopScanner();
    };
  }, []);

  const handleReset = () => {
    stopScanner();
    setRegistration(null);
    setCameraError("");
    setStatus("idle");
    setMessage("Ready to scan a QR ticket");
    currentTicketIdRef.current = null;
    setTimeout(() => {
      void startScanner();
    }, 0);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--navy)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin
          </Link>
        </div>

        <div className="rounded-[30px] border border-[var(--border)] bg-white p-5 shadow-[0_14px_40px_rgba(13,29,59,0.05)] sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--blue)]">
                Organizer access
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--navy)]">
                QR Ticket Verification
              </h1>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfeafc] bg-[#edf6ff] text-[var(--blue)]">
              <Camera className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--soft-blue)] p-3">
              <div className="overflow-hidden rounded-[18px] border border-[#dfeafc] bg-[#dfeafc]">
                <video ref={videoRef} className="h-[420px] w-full object-cover" autoPlay playsInline muted />
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <div
                  className={
                    status === "valid" || status === "check_in_success"
                      ? "flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
                      : status === "already_checked_in"
                        ? "flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-violet-800"
                        : status === "invalid"
                          ? "flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
                          : status === "error"
                            ? "flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
                            : "flex items-center gap-3 rounded-2xl border border-[#dfeafc] bg-[#edf6ff] p-4 text-[var(--navy)]"
                  }
                >
                  {status === "valid" || status === "check_in_success" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : status === "already_checked_in" ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : status === "invalid" ? (
                    <XCircle className="h-5 w-5" />
                  ) : status === "error" ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em]">Status</p>
                    <p className="mt-1 text-lg font-semibold">{message}</p>
                  </div>
                </div>

                {cameraError ? (
                  <p className="mt-4 text-sm leading-6 text-amber-800">{cameraError}</p>
                ) : null}

                {registration ? (
                  <div className="mt-5 space-y-4 rounded-[20px] border border-[var(--border)] bg-[#f8fbff] p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">Participant</p>
                      <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--navy)]">
                        {registration.full_name}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Registration ID</p>
                        <p className="mt-1 font-semibold text-[var(--navy)]">{registration.registration_id}</p>
                      </div>
                      {status === "valid" || status === "check_in_success" ? (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Email</p>
                          <p className="mt-1 font-semibold break-all text-[var(--navy)]">{registration.email}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Branch</p>
                        <p className="mt-1 font-semibold text-[var(--navy)]">{registration.branch}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Year</p>
                        <p className="mt-1 font-semibold text-[var(--navy)]">{registration.year}</p>
                      </div>
                      {(status === "already_checked_in" || status === "check_in_success") && registration.checked_in_at ? (
                        <div className="sm:col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Checked in at</p>
                          <p className="mt-1 font-semibold text-[var(--navy)]">{formatDateTime(registration.checked_in_at)}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {status === "valid" ? (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blue)]"
                >
                  CHECK IN
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blue)]"
                >
                  Scan again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
