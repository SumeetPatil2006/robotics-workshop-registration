"use client";

import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { BarcodeFormat, BrowserQRCodeReader } from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";
import { useCallback, useEffect, useRef, useState } from "react";

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

interface BarcodeDetectorItem {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorInterface {
  detect: (source: ImageBitmapSource) => Promise<BarcodeDetectorItem[]>;
}

interface BarcodeDetectorClass {
  new (options?: { formats: string[] }): BarcodeDetectorInterface;
  getSupportedFormats?: () => Promise<string[]>;
}

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
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const barcodeDetectorRef = useRef<BarcodeDetectorInterface | null>(null);

  const isScanningPausedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const currentTicketIdRef = useRef<string | null>(null);
  const lastProcessedCodeRef = useRef<{ code: string; timestamp: number }>({ code: "", timestamp: 0 });
  const frameCountRef = useRef(0);
  const autoResumeTimerRef = useRef<number | null>(null);

  const [status, setStatus] = useState<ResultState>("scanning");
  const [message, setMessage] = useState("Scanning for QR ticket...");
  const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
  const [cameraError, setCameraError] = useState("");

  const resumeForNextScan = useCallback(() => {
    if (autoResumeTimerRef.current) {
      window.clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
    setRegistration(null);
    setCameraError("");
    currentTicketIdRef.current = null;
    isProcessingRef.current = false;
    setStatus("scanning");
    setMessage("Scanning for QR ticket...");
    // Clear last processed code so the same ticket can be re-scanned if intentional
    lastProcessedCodeRef.current = { code: "", timestamp: 0 };
    // Immediately re-arm scanning loop without touching media stream
    isScanningPausedRef.current = false;
  }, []);

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

      // Optional haptic feedback on mobile
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch {}
      }

      // Automatically re-arm for next attendee after 1.8 seconds so line flows smoothly
      if (autoResumeTimerRef.current) {
        window.clearTimeout(autoResumeTimerRef.current);
      }
      autoResumeTimerRef.current = window.setTimeout(() => {
        resumeForNextScan();
      }, 1800);
    } catch {
      setStatus("invalid");
      setMessage("INVALID TICKET");
      setRegistration(null);
    }
  };

  const processTicketVerification = useCallback(async (candidate: string) => {
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
        isProcessingRef.current = false;
        return;
      }

      if (data.already_checked_in) {
        setStatus("already_checked_in");
        setMessage("ALREADY CHECKED IN");
        setRegistration({
          ...data.registration,
          checked_in_at: data.checked_in_at ?? data.registration.checked_in_at ?? null,
        });
        isProcessingRef.current = false;
        return;
      }

      setStatus("valid");
      setMessage("VALID TICKET");
      setRegistration(data.registration);
      isProcessingRef.current = false;
    } catch {
      setStatus("invalid");
      setMessage("INVALID TICKET");
      setRegistration(null);
      isProcessingRef.current = false;
    }
  }, []);

  const handleDetectedCode = useCallback(
    (candidate: string) => {
      if (!candidate || isScanningPausedRef.current || isProcessingRef.current) {
        return;
      }

      const now = Date.now();
      // Guard against rapid duplicate reads of the exact same code within 3.5 seconds
      if (
        lastProcessedCodeRef.current.code === candidate &&
        now - lastProcessedCodeRef.current.timestamp < 3500
      ) {
        return;
      }

      // Immediately stop further decoding before processing API request
      isScanningPausedRef.current = true;
      lastProcessedCodeRef.current = { code: candidate, timestamp: now };

      // Haptic feedback
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {}
      }

      void processTicketVerification(candidate);
    },
    [processTicketVerification],
  );

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0) {
      return;
    }

    // Tier 1: Hardware-accelerated native BarcodeDetector if available (iOS 17+ Safari, Chrome)
    if (barcodeDetectorRef.current) {
      try {
        const barcodes = await barcodeDetectorRef.current.detect(video);
        if (barcodes && barcodes.length > 0) {
          const raw = barcodes[0].rawValue?.trim();
          if (raw) {
            handleDetectedCode(raw);
            return;
          }
        }
      } catch {
        // Fall back directly to ZXing if native detection misses or errors
      }
    }

    // Tier 2: Tuned ZXing decoding on an offscreen ROI canvas
    if (readerRef.current) {
      if (!canvasRef.current && typeof document !== "undefined") {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const minDim = Math.min(vw, vh);

      frameCountRef.current += 1;
      const isFullFrameScan = frameCountRef.current % 4 === 0;

      if (isFullFrameScan) {
        // Periodic scaled full-frame pass in case QR is off-center or held far away
        const targetW = 480;
        const targetH = Math.round(480 * (vh / vw));
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
        ctx.drawImage(video, 0, 0, vw, vh, 0, 0, targetW, targetH);
      } else {
        // Central 72% Region of Interest (ROI) for maximum resolution and fastest processing
        const cropSize = Math.round(minDim * 0.72);
        const sx = Math.round((vw - cropSize) / 2);
        const sy = Math.round((vh - cropSize) / 2);
        if (canvas.width !== 480 || canvas.height !== 480) {
          canvas.width = 480;
          canvas.height = 480;
        }
        ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, 480, 480);
      }

      try {
        const result = readerRef.current.decodeFromCanvas(canvas);
        if (result) {
          const raw = result.getText()?.trim();
          if (raw) {
            handleDetectedCode(raw);
            return;
          }
        }
      } catch {
        // NotFoundException is expected on frames without a readable QR code
      }
    }
  }, [handleDetectedCode]);

  useEffect(() => {
    let isMounted = true;
    let animFrameId: number;

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const startCamera = async () => {
      setStatus("scanning");
      setMessage("Scanning for QR ticket...");
      setCameraError("");

      try {
        // Optimal camera constraints: prefer rear camera, avoid 4K overhead
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        // Apply continuous autofocus if available
        const track = stream.getVideoTracks()[0];
        if (track && "getCapabilities" in track) {
          try {
            const capabilities = (
              track as unknown as { getCapabilities: () => Record<string, unknown> }
            ).getCapabilities();
            if (
              capabilities &&
              Array.isArray(capabilities.focusMode) &&
              capabilities.focusMode.includes("continuous")
            ) {
              await track.applyConstraints({
                advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
              });
            }
          } catch {
            // Non-critical if focusMode cannot be set
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("muted", "true");
          videoRef.current.muted = true;
          await videoRef.current.play();
        }

        // Initialize native BarcodeDetector if available
        if (typeof window !== "undefined" && "BarcodeDetector" in window) {
          try {
            const Detector = (window as unknown as { BarcodeDetector: BarcodeDetectorClass }).BarcodeDetector;
            if (typeof Detector.getSupportedFormats === "function") {
              const formats = await Detector.getSupportedFormats();
              if (formats && formats.includes("qr_code")) {
                barcodeDetectorRef.current = new Detector({ formats: ["qr_code"] });
              }
            } else {
              barcodeDetectorRef.current = new Detector({ formats: ["qr_code"] });
            }
          } catch {
            barcodeDetectorRef.current = null;
          }
        }

        // Initialize optimized ZXing QR Reader (QR-only, TRY_HARDER disabled for speed)
        const hints = new Map<DecodeHintType, unknown>();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
        hints.set(DecodeHintType.TRY_HARDER, false);
        readerRef.current = new BrowserQRCodeReader(hints, {
          delayBetweenScanAttempts: 40,
          delayBetweenScanSuccess: 40,
        });

        // Frame scanning loop throttled to ~28 fps (every ~35ms)
        let lastScanTime = 0;
        let isScanningFrame = false;

        const scanLoop = async () => {
          if (!isMounted) return;

          if (!isScanningPausedRef.current && !isProcessingRef.current) {
            const now = performance.now();
            if (now - lastScanTime >= 35 && !isScanningFrame) {
              lastScanTime = now;
              isScanningFrame = true;
              try {
                await scanFrame();
              } finally {
                isScanningFrame = false;
              }
            }
          }

          animFrameId = requestAnimationFrame(scanLoop);
        };

        animFrameId = requestAnimationFrame(scanLoop);
      } catch (err) {
        if (!isMounted) return;
        console.error("Camera initialization error:", err);
        setCameraError("Camera unavailable. Please allow camera permissions in your browser settings.");
        setStatus("error");
        setMessage("Camera unavailable");
      }
    };

    void startCamera();

    return () => {
      isMounted = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (autoResumeTimerRef.current) window.clearTimeout(autoResumeTimerRef.current);
      stopCamera();
    };
  }, [scanFrame]);

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
              <div className="relative overflow-hidden rounded-[18px] border border-[#dfeafc] bg-[#dfeafc]">
                <video ref={videoRef} className="h-[420px] w-full object-cover" autoPlay playsInline muted />

                {/* Central viewfinder reticle matching the central scanning ROI */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-56 w-56 rounded-2xl border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(15,23,42,0.18)]">
                    <div className="absolute -top-1 -left-1 h-5 w-5 rounded-tl border-t-4 border-l-4 border-[var(--blue)]" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-tr border-t-4 border-r-4 border-[var(--blue)]" />
                    <div className="absolute -bottom-1 -left-1 h-5 w-5 rounded-bl border-b-4 border-l-4 border-[var(--blue)]" />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-br border-b-4 border-r-4 border-[var(--blue)]" />
                  </div>
                </div>
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
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  ) : status === "already_checked_in" ? (
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                  ) : status === "invalid" ? (
                    <XCircle className="h-5 w-5 shrink-0" />
                  ) : status === "error" ? (
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                  ) : (
                    <Camera className="h-5 w-5 shrink-0" />
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
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCheckIn}
                    className="flex-1 inline-flex items-center justify-center rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blue)]"
                  >
                    CHECK IN
                  </button>
                  <button
                    type="button"
                    onClick={resumeForNextScan}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#edf6ff]"
                  >
                    Scan again
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={resumeForNextScan}
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

