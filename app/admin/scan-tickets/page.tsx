"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import AdminShell from "@/components/admin/AdminShell";
import TicketingTabs from "@/components/admin/TicketingTabs";
import QrScanner from "@/components/admin/QrScanner";
import { ErrorNote, PageHeader, Pill, ProgressBar, dateTimeLabel, kickoffLabel, timeLabel } from "@/components/admin/ui";
import { adminFetch } from "@/lib/adminApi";
import { fetchMatchOptions, type MatchOption } from "@/lib/adminMatches";
import { formatTicketCode } from "@/lib/format";

type Ticket = {
  _id: string;
  code: string;
  holderName: string;
  holderEmail?: string;
  holderPhone?: string;
  ticketTypeName: string;
  used: boolean;
  usedAt?: string;
  usedBy?: string;
  alreadyUsed?: boolean;
  match?: { _id: string; opponent: string; kickoff: string; isHome: boolean };
};

type Summary = { total: number; used: number; byCategory: { name: string; total: number; used: number }[] };
type Result = { kind: "admitted" | "already" | "valid" | "error"; ticket?: Ticket; message?: string };

const MATCH_KEY = "eko_checkin_match";

// A short tone and a buzz so gate staff know the result without looking at the
// screen: one rising beep for admitted, two flat beeps for already used, one low
// buzz for a ticket that cannot be used.
let audioCtx: AudioContext | null = null;
function feedback(kind: Result["kind"]) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioCtx = audioCtx || new Ctx();
      const plan: [number, number][] = kind === "admitted" ? [[880, 0.14]] : kind === "already" ? [[520, 0.14], [520, 0.14]] : kind === "valid" ? [[700, 0.1]] : [[200, 0.4]];
      let t = audioCtx.currentTime;
      for (const [freq, dur] of plan) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = freq;
        osc.type = kind === "error" ? "sawtooth" : "sine";
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + dur);
        t += dur + 0.08;
      }
    }
    navigator.vibrate?.(kind === "admitted" ? 60 : [120, 80, 120]);
  } catch {
    // no sound or vibration on this device: the colours still say it all
  }
}

const clean = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

// The gate. Pick the match, then check people in three ways: scan the QR code
// with the camera (it keeps reading, so a queue moves quickly), type or scan the
// ticket number (a handheld scanner that types works too), or find the person
// by name, email or phone. With "check in automatically" on, a read admits the
// ticket at once; a used ticket or one for another match is flagged.
export default function CheckInPage() {
  const [matches, setMatches] = useState<MatchOption[]>([]);
  const [matchId, setMatchId] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<Ticket[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const [found, setFound] = useState<Ticket[] | null>(null);
  const [error, setError] = useState("");

  const busyRef = useRef(false);
  const lastScan = useRef({ code: "", at: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Home matches only, since that is where tickets are sold. Remember the last
  // match chosen, else the next one still to be played.
  useEffect(() => {
    fetchMatchOptions({ homeOnly: true }).then((list) => {
      setMatches(list);
      if (list.length === 0) return;
      let saved = "";
      try {
        saved = localStorage.getItem(MATCH_KEY) || "";
      } catch {
        // storage unavailable
      }
      const now = Date.now() - 6 * 60 * 60 * 1000;
      const next = list.find((m) => new Date(m.kickoff).getTime() >= now) || list[list.length - 1];
      setMatchId(list.some((m) => m._id === saved) ? saved : next._id);
    });
  }, []);

  const refreshSide = useCallback(() => {
    if (!matchId) return;
    adminFetch<Summary>(`/tickets/summary/${matchId}`)
      .then(setSummary)
      .catch(() => setSummary(null));
    adminFetch<Ticket[]>(`/tickets/recent/${matchId}`)
      .then(setRecent)
      .catch(() => setRecent([]));
  }, [matchId]);

  useEffect(() => {
    setResult(null);
    setFound(null);
    setSearch("");
    refreshSide();
    if (matchId) {
      try {
        localStorage.setItem(MATCH_KEY, matchId);
      } catch {
        // storage unavailable
      }
    }
  }, [matchId, refreshSide]);

  // Keep the phone awake while the camera is in use at the gate.
  useEffect(() => {
    if (!cameraOn) return;
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock
      ?.request("screen")
      .then((l) => (lock = l))
      .catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, [cameraOn]);

  const processCode = useCallback(
    async (raw: string, source: "camera" | "manual" | "search") => {
      const value = clean(raw);
      if (value.length < 4 || !matchId || busyRef.current) return;
      // The camera sees the same code many times a second; read it once.
      if (source === "camera" && lastScan.current.code === value && Date.now() - lastScan.current.at < 4000) return;
      lastScan.current = { code: value, at: Date.now() };

      busyRef.current = true;
      setBusy(true);
      setError("");
      let outcome: Result;
      try {
        if (autoCheckIn || source === "search") {
          const t = await adminFetch<Ticket>("/tickets/validate", { method: "POST", body: JSON.stringify({ code: value, matchId }) });
          outcome = { kind: t.alreadyUsed ? "already" : "admitted", ticket: t };
        } else {
          const t = await adminFetch<Ticket>("/tickets/lookup", { method: "POST", body: JSON.stringify({ code: value, matchId }) });
          outcome = { kind: t.used ? "already" : "valid", ticket: t };
        }
      } catch (err) {
        outcome = { kind: "error", message: err instanceof Error ? err.message : "That ticket could not be read." };
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
      setResult(outcome);
      feedback(outcome.kind);
      refreshSide();
      if (source === "manual") {
        setCode("");
        inputRef.current?.focus();
      }
    },
    [matchId, autoCheckIn, refreshSide]
  );

  async function undo(ticket: Ticket) {
    try {
      await adminFetch("/tickets/undo", { method: "POST", body: JSON.stringify({ code: ticket.code, matchId }) });
      if (result?.ticket?.code === ticket.code) setResult(null);
      lastScan.current = { code: "", at: 0 };
      refreshSide();
      if (search.trim().length >= 2) runSearch(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not undo that check-in.");
    }
  }

  const runSearch = useCallback(
    (q: string) => {
      if (q.trim().length < 2 || !matchId) {
        setFound(null);
        return;
      }
      adminFetch<Ticket[]>(`/tickets/search?match=${matchId}&q=${encodeURIComponent(q.trim())}`)
        .then(setFound)
        .catch(() => setFound([]));
    },
    [matchId]
  );

  useEffect(() => {
    const t = setTimeout(() => runSearch(search), 300);
    return () => clearTimeout(t);
  }, [search, runSearch]);

  const match = matches.find((m) => m._id === matchId);
  const pct = summary && summary.total > 0 ? Math.round((summary.used / summary.total) * 100) : 0;

  const tone =
    result?.kind === "admitted"
      ? "bg-cyan text-navy-dark"
      : result?.kind === "already"
        ? "bg-yellow text-navy-dark"
        : result?.kind === "valid"
          ? "bg-cyan/20 text-navy"
          : "bg-red-600 text-white";

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-12 sm:px-10">
          <PageHeader eyebrow="Ticketing" title="Check-in" intro="Scan the QR code, type the number, or find the person by name. Each ticket admits one person, once." />
          <TicketingTabs />
          {error && <ErrorNote>{error}</ErrorNote>}

          {matches.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-10 text-center text-sm text-navy/50">
              No home matches yet. Tickets are only sold for home matches.
            </p>
          ) : (
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
              {/* Left: the gate */}
              <div className="min-w-0 space-y-6">
                <div>
                  <label htmlFor="match" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50">
                    Match
                  </label>
                  <select
                    id="match"
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    className="w-full border-b border-navy/20 bg-transparent px-1 py-3 text-base text-navy outline-none focus:border-cyan"
                  >
                    {matches.map((m) => (
                      <option key={m._id} value={m._id}>
                        vs {m.opponent} · {kickoffLabel(m.kickoff)} {timeLabel(m.kickoff)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* The result of the last read: big and colour-coded so it can be seen from arm's length */}
                <div aria-live="polite" className="min-h-[9rem]">
                  {result ? (
                    <div className={clsx("rounded-2xl p-6 text-center", tone)}>
                      <p className="font-display text-4xl leading-none sm:text-5xl">
                        {result.kind === "admitted" && "✓ Admitted"}
                        {result.kind === "already" && "⚠ Already checked in"}
                        {result.kind === "valid" && "Valid ticket"}
                        {result.kind === "error" && "✕ Cannot admit"}
                      </p>
                      {result.ticket ? (
                        <>
                          <p className="mt-4 font-display text-3xl">{result.ticket.holderName}</p>
                          <p className="mt-1 text-sm font-semibold uppercase tracking-wide opacity-80">
                            {result.ticket.ticketTypeName} · {formatTicketCode(result.ticket.code)}
                          </p>
                          {result.kind === "already" && result.ticket.usedAt && (
                            <p className="mt-2 text-sm opacity-80">
                              Came in {dateTimeLabel(result.ticket.usedAt)}
                              {result.ticket.usedBy ? ` (checked in by ${result.ticket.usedBy})` : ""}
                            </p>
                          )}
                          <div className="mt-5 flex flex-wrap justify-center gap-3">
                            {result.kind === "valid" && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => processCode(result.ticket!.code, "search")}
                                className="btn-glass btn-glass-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
                              >
                                Admit
                              </button>
                            )}
                            {result.kind === "admitted" && (
                              <button type="button" onClick={() => undo(result.ticket!)} className="rounded-lg bg-navy-dark/10 px-5 py-2 text-xs font-bold uppercase tracking-wide hover:bg-navy-dark/20">
                                Undo check-in
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="mt-3 text-base">{result.message}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-navy/15 text-sm text-navy/40">
                      {cameraOn ? "Hold a QR code up to the camera" : "Ready. Scan a ticket or type its number."}
                    </div>
                  )}
                </div>

                {/* Camera */}
                {cameraOn ? (
                  <div className="space-y-3">
                    <QrScanner facing={facing} paused={busy} onScan={(v) => processCode(v, "camera")} />
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
                        className="btn-glass btn-glass-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
                      >
                        Switch camera
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCameraOn(false);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="btn-glass btn-glass-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wide"
                      >
                        Close camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      feedback("valid"); // unlocks sound on phones, which need a tap first
                      setCameraOn(true);
                    }}
                    className="btn-glass btn-glass-yellow w-full px-6 py-4 text-sm font-bold uppercase tracking-wide"
                  >
                    Open camera and scan
                  </button>
                )}

                {/* Type or scan the number */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    processCode(code, "manual");
                  }}
                  className="flex gap-3"
                >
                  <input
                    ref={inputRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="TICKET NUMBER"
                    aria-label="Ticket number"
                    inputMode="numeric"
                    autoComplete="off"
                    autoFocus
                    className="min-w-0 flex-1 rounded-xl border-2 border-navy/20 bg-transparent px-4 py-4 text-center text-2xl font-bold uppercase tracking-[0.2em] text-navy outline-none placeholder:text-base placeholder:tracking-normal placeholder:text-navy/30 focus:border-cyan"
                  />
                  <button
                    type="submit"
                    disabled={busy || clean(code).length < 4}
                    className="btn-glass btn-glass-yellow shrink-0 px-6 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
                  >
                    {autoCheckIn ? "Check in" : "Look up"}
                  </button>
                </form>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-navy">
                  <input type="checkbox" checked={autoCheckIn} onChange={(e) => setAutoCheckIn(e.target.checked)} className="h-4 w-4 accent-navy" />
                  Check in automatically (untick to see the ticket first and press Admit)
                </label>
              </div>

              {/* Right: how the match is going, recent, find a person */}
              <aside className="min-w-0 space-y-8">
                <div className="rounded-2xl bg-navy/[0.04] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/50">Checked in</p>
                  <p className="mt-2 font-display text-5xl leading-none text-navy">
                    {summary ? summary.used : "–"} <span className="text-2xl text-navy/40">/ {summary ? summary.total : "–"}</span>
                  </p>
                  <ProgressBar value={summary?.used || 0} max={summary?.total || 0} className="mt-3" />
                  <p className="mt-2 text-xs text-navy/50">
                    {pct}% of tickets sold{match ? ` for ${match.opponent}` : ""}
                  </p>
                  {summary && summary.byCategory.length > 0 && (
                    <ul className="mt-4 divide-y divide-navy/10 text-sm">
                      {summary.byCategory.map((c) => (
                        <li key={c.name} className="flex items-center justify-between py-2 text-navy">
                          <span>{c.name}</span>
                          <span className="font-semibold">
                            {c.used} <span className="font-normal text-navy/40">/ {c.total}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h2 className="mb-3 font-display text-2xl text-navy">Find a person</h2>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, email, phone or number"
                    aria-label="Find a ticket holder"
                    className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-cyan"
                  />
                  {found && (
                    <ul className="mt-3 divide-y divide-navy/10 rounded-xl border border-navy/10">
                      {found.length === 0 && <li className="px-4 py-3 text-sm text-navy/50">No ticket found for that.</li>}
                      {found.map((t) => (
                        <li key={t._id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-navy">{t.holderName}</p>
                            <p className="truncate text-xs text-navy/50">
                              {t.ticketTypeName} · {formatTicketCode(t.code)}
                              {t.match && t.match._id !== matchId ? ` · for ${t.match.opponent}` : ""}
                            </p>
                          </div>
                          {t.used ? (
                            <button type="button" onClick={() => undo(t)} className="shrink-0 text-xs font-semibold text-navy/50 hover:text-red-500">
                              <Pill tone="dark">In</Pill> Undo
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => processCode(t.code, "search")}
                              className="btn-glass btn-glass-yellow shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-wide disabled:opacity-60"
                            >
                              Check in
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h2 className="mb-3 font-display text-2xl text-navy">Just checked in</h2>
                  {recent.length === 0 ? (
                    <p className="text-sm text-navy/50">Nobody yet.</p>
                  ) : (
                    <ul className="divide-y divide-navy/10 rounded-xl border border-navy/10">
                      {recent.map((t) => (
                        <li key={t._id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-navy">{t.holderName}</p>
                            <p className="truncate text-xs text-navy/50">
                              {t.ticketTypeName} · {t.usedAt ? timeLabel(t.usedAt) : ""}
                              {t.usedBy ? ` · ${t.usedBy}` : ""}
                            </p>
                          </div>
                          <button type="button" onClick={() => undo(t)} className="shrink-0 text-xs font-semibold text-navy/40 hover:text-red-500">
                            Undo
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
