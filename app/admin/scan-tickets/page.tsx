"use client";

import { useEffect, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/adminApi";
import { API_URL } from "@/lib/api";

type MatchOption = { _id: string; opponent: string; kickoff: string; isHome: boolean };

type TicketResult = {
  _id: string;
  code: string;
  holderName: string;
  ticketTypeName: string;
  used: boolean;
  usedAt?: string;
  alreadyUsed?: boolean;
  match: { opponent: string; kickoff: string; isHome: boolean };
};

type Summary = { total: number; used: number };

// Matchday gate tool: select the match, then either type the 6-character
// code a fan reads off their ticket, or scan the QR code with the device
// camera (native BarcodeDetector API, no extra library, and it just quietly
// doesn't offer the camera option on browsers that don't support it, since
// the manual code entry always works regardless).
export default function ScanTicketsPage() {
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [matchId, setMatchId] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<TicketResult | null>(null);
  const [status, setStatus] = useState<"idle" | "looking-up" | "found" | "not-found">("idle");
  const [admitting, setAdmitting] = useState(false);
  const [error, setError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Deliberately the PUBLIC /api/matches endpoint, not adminFetch("/matches")
    // (which hits /api/admin/matches, gated to content_editor): this page's
    // actual users are ticket_manager/inventory_manager, who have no reason
    // to be granted content-editing access just to see a match dropdown here.
    fetch(`${API_URL}/matches`)
      .then((res) => (res.ok ? res.json() : []))
      .then((all: MatchOption[]) => {
        const upcoming = all.filter((m) => m.opponent).sort((a, b) => a.kickoff.localeCompare(b.kickoff));
        setMatches(upcoming);
      })
      .catch(() => setMatches([]));
    setScannerSupported(typeof window !== "undefined" && "BarcodeDetector" in window);
  }, []);

  useEffect(() => {
    if (!matchId) {
      setSummary(null);
      return;
    }
    refreshSummary(matchId);
  }, [matchId]);

  function refreshSummary(id: string) {
    adminFetch<Summary>(`/tickets/summary/${id}`)
      .then(setSummary)
      .catch(() => setSummary(null));
  }

  async function handleLookup(rawCode: string) {
    const cleaned = rawCode.trim().toUpperCase();
    if (cleaned.length < 4) return;
    setStatus("looking-up");
    setError("");
    setResult(null);
    try {
      const ticket = await adminFetch<TicketResult>("/tickets/lookup", {
        method: "POST",
        body: JSON.stringify({ code: cleaned }),
      });
      setResult(ticket);
      setStatus("found");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No ticket found with that code.");
      setStatus("not-found");
    }
  }

  async function handleAdmit() {
    if (!result) return;
    setAdmitting(true);
    try {
      const updated = await adminFetch<TicketResult>("/tickets/validate", {
        method: "POST",
        body: JSON.stringify({ code: result.code }),
      });
      setResult(updated);
      if (matchId) refreshSummary(matchId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in this ticket.");
    } finally {
      setAdmitting(false);
    }
  }

  function reset() {
    setCode("");
    setResult(null);
    setStatus("idle");
    setError("");
  }

  async function startScanner() {
    setScannerOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Detector = (window as any).BarcodeDetector;
      const detector = new Detector({ formats: ["qr_code"] });
      const tick = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            stopScanner();
            setCode(codes[0].rawValue);
            handleLookup(codes[0].rawValue);
            return;
          }
        } catch {
          // a single failed detect() pass (e.g. blurry frame) isn't fatal, just try again next tick
        }
        if (streamRef.current) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch {
      setError("Couldn't access the camera. Check permissions, or just type the code below.");
      setScannerOpen(false);
    }
  }

  function stopScanner() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScannerOpen(false);
  }

  useEffect(() => () => stopScanner(), []);

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-10 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Matchday</p>
          <h1 className="display-title font-display mt-2 mb-8">Scan Tickets</h1>

          <div className="max-w-md">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50">
              Match
            </label>
            <select
              value={matchId}
              onChange={(e) => {
                setMatchId(e.target.value);
                reset();
              }}
              className="w-full border-b border-navy/20 bg-transparent px-1 py-3 text-base text-navy outline-none focus:border-cyan"
            >
              <option value="">Select a match…</option>
              {matches.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.isHome ? "vs " : "at "}
                  {m.opponent} ·{" "}
                  {new Date(m.kickoff).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    timeZone: "Africa/Lagos",
                  })}
                </option>
              ))}
            </select>

            {summary && (
              <p className="mt-3 text-sm text-navy/60">
                <span className="font-display text-2xl text-navy">{summary.used}</span> / {summary.total}{" "}
                checked in
              </p>
            )}
          </div>

          {matchId && (
            <div className="mt-10 max-w-md">
              {scannerOpen ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl bg-navy-dark">
                    <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
                    <div className="pointer-events-none absolute inset-8 rounded-2xl border-4 border-cyan/70" />
                  </div>
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="w-full rounded-full border border-navy/20 px-6 py-3 text-sm font-bold uppercase tracking-wide text-navy transition-colors duration-200 ease-smooth hover:border-navy"
                  >
                    Cancel scan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scannerSupported && (
                    <button
                      type="button"
                      onClick={startScanner}
                      className="w-full rounded-full bg-navy-dark px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-transform duration-300 ease-smooth hover:scale-[1.01]"
                    >
                      📷 Scan QR code
                    </button>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLookup(code);
                    }}
                    className="flex gap-3"
                  >
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="6-DIGIT CODE"
                      maxLength={6}
                      autoCapitalize="characters"
                      className="flex-1 rounded-full border-2 border-navy/20 bg-transparent px-6 py-4 text-center text-2xl font-bold uppercase tracking-[0.3em] text-navy outline-none focus:border-cyan"
                    />
                    <button
                      type="submit"
                      disabled={status === "looking-up" || code.length < 4}
                      className="shrink-0 rounded-full bg-yellow px-6 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      Check
                    </button>
                  </form>
                </div>
              )}

              {status === "not-found" && (
                <div className="mt-6 rounded-2xl bg-red-50 p-6 text-center">
                  <p className="text-lg font-bold text-red-600">✕ Not found</p>
                  <p className="mt-1 text-sm text-red-500">{error}</p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-4 text-xs font-semibold uppercase tracking-wide text-red-600 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {result && status === "found" && (
                <div
                  className={`mt-6 rounded-2xl p-6 text-center ${result.used ? "bg-yellow/10" : "bg-cyan/10"}`}
                >
                  <p className={`text-lg font-bold ${result.used ? "text-navy" : "text-navy"}`}>
                    {result.used ? "⚠ Already checked in" : "✓ Valid ticket"}
                  </p>
                  <p className="mt-3 font-display text-2xl text-navy">{result.holderName}</p>
                  <p className="mt-1 text-sm text-navy/60">{result.ticketTypeName}</p>
                  {result.used && result.usedAt && (
                    <p className="mt-2 text-xs text-navy/40">
                      Checked in{" "}
                      {new Date(result.usedAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Africa/Lagos",
                      })}
                    </p>
                  )}

                  {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

                  <div className="mt-5 flex justify-center gap-3">
                    {!result.used && (
                      <button
                        type="button"
                        onClick={handleAdmit}
                        disabled={admitting}
                        className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-60"
                      >
                        Admit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={reset}
                      className="rounded-full border border-navy/20 px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy transition-colors duration-200 ease-smooth hover:border-navy"
                    >
                      Next ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
