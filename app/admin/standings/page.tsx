"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import AdminShell from "@/components/admin/AdminShell";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";
import { ErrorNote, PageHeader, Pill, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { FormChips } from "@/components/LeagueTable";
import { adminFetch, revalidatePublicPaths } from "@/lib/adminApi";
import { isAllowedImageUrl } from "@/lib/imageHosts";

type Result = "W" | "D" | "L";

type Row = {
  key: string; // identifies the row on screen (new rows have no _id yet)
  _id?: string;
  clubName: string;
  clubLogoUrl: string;
  isEkoUnited: boolean;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: Result[];
  isActive: boolean;
};

type ServerRow = Partial<Row> & { _id: string; clubName: string };

const fromServer = (s: ServerRow): Row => ({
  key: s._id,
  _id: s._id,
  clubName: s.clubName,
  clubLogoUrl: s.clubLogoUrl || "",
  isEkoUnited: Boolean(s.isEkoUnited),
  played: s.played ?? 0,
  won: s.won ?? 0,
  drawn: s.drawn ?? 0,
  lost: s.lost ?? 0,
  goalsFor: s.goalsFor ?? 0,
  goalsAgainst: s.goalsAgainst ?? 0,
  points: s.points ?? 0,
  form: (s.form || []).slice(-5),
  isActive: s.isActive !== false,
});

let nextKey = 0;
const blankRow = (): Row => ({
  key: `new-${++nextKey}`,
  clubName: "",
  clubLogoUrl: "",
  isEkoUnited: false,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
  form: [],
  isActive: true,
});

// With "calculate for me" on, games played and points come from wins, draws and
// losses (3 for a win, 1 for a draw) so they can never disagree with them.
const shown = (r: Row, auto: boolean) => ({
  played: auto ? r.won + r.drawn + r.lost : r.played,
  points: auto ? r.won * 3 + r.drawn : r.points,
  gd: r.goalsFor - r.goalsAgainst,
});

const snapshot = (rows: Row[]) => JSON.stringify(rows.map(({ key, ...rest }) => rest));

const inputBase =
  "w-full rounded-lg border border-navy/15 bg-white px-1 py-2 text-center text-sm font-semibold tabular-nums text-navy outline-none transition-colors duration-200 ease-smooth focus:border-cyan";

function Num({ value, onChange, label, readOnly, warn }: { value: number; onChange: (n: number) => void; label: string; readOnly?: boolean; warn?: boolean }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      aria-label={label}
      value={value}
      readOnly={readOnly}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value) || 0)))}
      className={clsx(inputBase, readOnly && "border-transparent bg-navy/[0.05] text-navy/70", warn && "border-red-400")}
    />
  );
}

const nextResult = (r: Result): Result => (r === "W" ? "D" : r === "D" ? "L" : "W");

function FormEditor({ form, onChange }: { form: Result[]; onChange: (f: Result[]) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {form.map((r, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(form.map((x, j) => (j === i ? nextResult(x) : x)))}
          title="Click to change"
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-transform duration-150 ease-smooth hover:scale-110",
            r === "W" && "bg-cyan text-navy-dark",
            r === "D" && "bg-navy/20 text-navy",
            r === "L" && "bg-red-500 text-white"
          )}
        >
          {r}
        </button>
      ))}
      {form.length < 5 && (
        <button type="button" onClick={() => onChange([...form, "W"])} title="Add a result" className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-navy/25 text-sm text-navy/50 hover:border-navy/50 hover:text-navy">
          +
        </button>
      )}
      {form.length > 0 && (
        <button type="button" onClick={() => onChange(form.slice(0, -1))} title="Remove the last result" className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-navy/35 hover:text-red-500">
          ×
        </button>
      )}
    </div>
  );
}

function Crest({ row, onClick }: { row: Row; onClick: () => void }) {
  const ok = row.clubLogoUrl && isAllowedImageUrl(row.clubLogoUrl);
  return (
    <button
      type="button"
      onClick={onClick}
      title="Change the crest"
      aria-label={`Change the crest for ${row.clubName || "this club"}`}
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy/[0.07] ring-1 ring-navy/10 transition-shadow duration-200 ease-smooth hover:ring-cyan"
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.clubLogoUrl} alt="" className="h-full w-full object-contain p-1" />
      ) : (
        <span className="font-display text-base text-navy/50">{row.clubName.replace(/[^A-Za-z ]/g, "").trim().slice(0, 2).toUpperCase() || "+"}</span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-navy-dark/60 text-[9px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">Edit</span>
    </button>
  );
}

const gridCols = "lg:max-xl:grid-cols-[3rem_minmax(9rem,1fr)_auto] xl:grid-cols-[3.25rem_minmax(14rem,1fr)_repeat(3,3.1rem)_repeat(2,3.4rem)_3.1rem_3.6rem_minmax(10rem,auto)_5.2rem]";

export default function AdminStandingsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [saved, setSaved] = useState("");
  const [auto, setAuto] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [crestFor, setCrestFor] = useState<string | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const lastNameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminFetch<ServerRow[]>("/standings")
      .then((all) => {
        const list = all.map(fromServer);
        setRows(list);
        setSaved(snapshot(list));
      })
      .catch((err) => setError(err.message));
  }, []);

  const dirty = rows !== null && snapshot(rows) !== saved;

  // Closing the tab with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (key: string, patch: Partial<Row>) => {
    setJustSaved(false);
    setRows((prev) => (prev ? prev.map((r) => (r.key === key ? { ...r, ...patch } : r)) : prev));
  };

  function move(index: number, by: -1 | 1) {
    setJustSaved(false);
    setRows((prev) => {
      if (!prev) return prev;
      const to = index + by;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
  }

  // Points, then goal difference, then goals scored. Clubs level on all three keep the order they are in now, so a
  // tie-break decided by hand (head to head, say) is not undone.
  function sortTable() {
    setJustSaved(false);
    setRows((prev) =>
      prev
        ? [...prev].sort((a, b) => {
            const sa = shown(a, auto);
            const sb = shown(b, auto);
            return sb.points - sa.points || sb.gd - sa.gd || b.goalsFor - a.goalsFor;
          })
        : prev
    );
  }

  function addClub() {
    setJustSaved(false);
    setRows((prev) => [...(prev || []), blankRow()]);
    setTimeout(() => lastNameInput.current?.focus(), 50);
  }

  function removeClub(row: Row) {
    if (!confirm(`Remove ${row.clubName || "this club"} from the table? It is deleted when you save.`)) return;
    setJustSaved(false);
    setRows((prev) => (prev ? prev.filter((r) => r.key !== row.key) : prev));
  }

  function setEko(key: string) {
    setJustSaved(false);
    setRows((prev) => (prev ? prev.map((r) => ({ ...r, isEkoUnited: r.key === key ? !r.isEkoUnited : false })) : prev));
  }

  // One finished match between two clubs in the table: updates both rows.
  function applyResult(homeKey: string, awayKey: string, homeGoals: number, awayGoals: number, resort: boolean) {
    setJustSaved(false);
    setRows((prev) => {
      if (!prev) return prev;
      const apply = (r: Row, gf: number, ga: number): Row => {
        const result: Result = gf > ga ? "W" : gf < ga ? "L" : "D";
        return {
          ...r,
          played: r.played + 1,
          won: r.won + (result === "W" ? 1 : 0),
          drawn: r.drawn + (result === "D" ? 1 : 0),
          lost: r.lost + (result === "L" ? 1 : 0),
          goalsFor: r.goalsFor + gf,
          goalsAgainst: r.goalsAgainst + ga,
          points: r.points + (result === "W" ? 3 : result === "D" ? 1 : 0),
          form: [...r.form, result].slice(-5),
        };
      };
      let next = prev.map((r) => (r.key === homeKey ? apply(r, homeGoals, awayGoals) : r.key === awayKey ? apply(r, awayGoals, homeGoals) : r));
      if (resort) {
        next = [...next].sort((a, b) => {
          const sa = shown(a, auto);
          const sb = shown(b, auto);
          return sb.points - sa.points || sb.gd - sa.gd || b.goalsFor - a.goalsFor;
        });
      }
      return next;
    });
    setResultOpen(false);
  }

  async function save() {
    if (!rows) return;
    if (rows.some((r) => !r.clubName.trim())) return setError("Every club needs a name.");
    setSaving(true);
    setError("");
    try {
      const body = rows.map((r) => {
        const s = shown(r, auto);
        return { ...r, played: s.played, points: s.points };
      });
      const reply = await adminFetch<ServerRow[]>("/standings", { method: "PUT", body: JSON.stringify({ season: "2026", rows: body }) });
      await revalidatePublicPaths(["/table", "/"]);
      const list = reply.map(fromServer);
      setRows(list);
      setSaved(snapshot(list));
      setJustSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the table.");
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!confirm("Throw away your changes and go back to the saved table?")) return;
    adminFetch<ServerRow[]>("/standings").then((all) => setRows(all.map(fromServer)));
  }

  const counts = useMemo(() => ({ total: rows?.length || 0, hidden: rows?.filter((r) => !r.isActive).length || 0 }), [rows]);

  return (
    <AdminShell>
      {() => (
        <div className="px-6 py-12 pb-32 sm:px-10">
          <PageHeader
            eyebrow="Matchday"
            title="League Table"
            intro="Edit the whole table in one place. Type the wins, draws, losses and goals; played and points are worked out for you. Move clubs with the arrows, or let Sort do it, then Save."
            actions={
              <>
                <Link href="/table" target="_blank" className={btnSecondary}>
                  View table
                </Link>
                <button type="button" onClick={addClub} className={btnPrimary}>
                  + Add club
                </button>
              </>
            }
          />
          {error && <ErrorNote>{error}</ErrorNote>}

          {rows === null ? (
            <p className="text-navy/50">Loading…</p>
          ) : (
            <>
              {/* Tools */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-navy/[0.04] px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-navy">
                    <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="h-4 w-4 accent-navy" />
                    <span>
                      <span className="font-semibold">Calculate played and points for me</span>
                      <span className="block text-xs text-navy/50">Played is W+D+L; points are 3 per win and 1 per draw. Turn off to type them (for a points deduction).</span>
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setResultOpen(true)} className={btnSecondary} disabled={rows.length < 2}>
                    Record a result
                  </button>
                  <button type="button" onClick={sortTable} className={btnSecondary}>
                    Sort by points
                  </button>
                </div>
              </div>

              {/* Column heads (wide screens) */}
              <div className={clsx("hidden items-end gap-2 px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/45 xl:grid", gridCols)}>
                <span className="text-center">Pos</span>
                <span>Club</span>
                <span className="text-center">W</span>
                <span className="text-center">D</span>
                <span className="text-center">L</span>
                <span className="text-center">GF</span>
                <span className="text-center">GA</span>
                <span className="text-center">P</span>
                <span className="text-center">Pts</span>
                <span>Form (last 5)</span>
                <span />
              </div>

              <ul className="space-y-2">
                {rows.map((r, i) => {
                  const s = shown(r, auto);
                  const mismatch = !auto && r.played !== r.won + r.drawn + r.lost;
                  return (
                    <li
                      key={r.key}
                      className={clsx(
                        "grid grid-cols-1 items-center gap-x-2 gap-y-3 rounded-2xl border px-4 py-3 transition-colors duration-200 ease-smooth",
                        r.isEkoUnited ? "border-cyan bg-cyan/[0.07]" : "border-navy/10 bg-white",
                        !r.isActive && "opacity-60",
                        gridCols
                      )}
                    >
                      {/* Position and move */}
                      <div className="flex items-center gap-1 lg:max-xl:row-span-2 xl:flex-col xl:gap-0">
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="px-1 text-navy/40 hover:text-navy disabled:opacity-20">
                          ▲
                        </button>
                        <span className="w-7 text-center font-display text-2xl leading-none text-navy">{i + 1}</span>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Move down" className="px-1 text-navy/40 hover:text-navy disabled:opacity-20">
                          ▼
                        </button>
                      </div>

                      {/* Club */}
                      <div className="flex min-w-0 items-center gap-3">
                        <Crest row={r} onClick={() => setCrestFor(r.key)} />
                        <div className="min-w-0 flex-1">
                          <input
                            ref={i === rows.length - 1 ? lastNameInput : undefined}
                            value={r.clubName}
                            onChange={(e) => update(r.key, { clubName: e.target.value })}
                            placeholder="Club name"
                            aria-label="Club name"
                            className="w-full border-b border-transparent bg-transparent font-display text-xl text-navy outline-none placeholder:text-navy/30 focus:border-cyan"
                          />
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEko(r.key)}
                              aria-pressed={r.isEkoUnited}
                              className={clsx("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", r.isEkoUnited ? "bg-navy text-white" : "bg-navy/[0.06] text-navy/45 hover:text-navy")}
                            >
                              {r.isEkoUnited ? "Eko United" : "Mark as Eko"}
                            </button>
                            {!r.isActive && <Pill tone="neutral">Hidden</Pill>}
                          </div>
                        </div>
                      </div>

                      {/* Numbers: labelled on phones, headed on wide screens */}
                      <div className="contents max-xl:grid max-xl:grid-cols-4 max-xl:gap-2 sm:max-xl:grid-cols-8 lg:max-xl:grid-cols-[repeat(8,2.6rem)] lg:max-xl:gap-1">
                        {(
                          [
                            ["won", "W", r.won],
                            ["drawn", "D", r.drawn],
                            ["lost", "L", r.lost],
                            ["goalsFor", "GF", r.goalsFor],
                            ["goalsAgainst", "GA", r.goalsAgainst],
                          ] as const
                        ).map(([field, label, value]) => (
                          <label key={field} className="block">
                            <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-wide text-navy/45 xl:hidden">{label}</span>
                            <Num value={value} label={`${label} for ${r.clubName}`} onChange={(n) => update(r.key, { [field]: n })} />
                          </label>
                        ))}
                        <label className="block">
                          <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-wide text-navy/45 xl:hidden">P</span>
                          <Num value={s.played} label={`Played by ${r.clubName}`} readOnly={auto} warn={mismatch} onChange={(n) => update(r.key, { played: n })} />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-wide text-navy/45 xl:hidden">Pts</span>
                          <Num value={s.points} label={`Points for ${r.clubName}`} readOnly={auto} onChange={(n) => update(r.key, { points: n })} />
                        </label>
                        <div className="text-center text-xs text-navy/45 xl:hidden">GD {s.gd > 0 ? `+${s.gd}` : s.gd}</div>
                      </div>

                      <div className="lg:max-xl:col-start-2">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-navy/45 xl:hidden">Form (last 5)</span>
                        <FormEditor form={r.form} onChange={(f) => update(r.key, { form: f })} />
                      </div>

                      <div className="flex items-center justify-end gap-3 text-xs font-semibold lg:max-xl:col-start-3">
                        <button type="button" onClick={() => update(r.key, { isActive: !r.isActive })} className="text-navy/50 hover:text-navy" title={r.isActive ? "Hide this club from the public table" : "Show this club again"}>
                          {r.isActive ? "Hide" : "Show"}
                        </button>
                        <button type="button" onClick={() => removeClub(r)} className="text-navy/35 hover:text-red-500">
                          Remove
                        </button>
                      </div>
                      {mismatch && <p className="text-xs text-red-500 xl:col-span-full">Played ({r.played}) is not W+D+L ({r.won + r.drawn + r.lost}).</p>}
                    </li>
                  );
                })}
              </ul>

              <p className="mt-5 text-xs leading-relaxed text-navy/45">
                {counts.total} club{counts.total === 1 ? "" : "s"}
                {counts.hidden > 0 ? `, ${counts.hidden} hidden from the public table` : ""}. Goal difference is worked out from goals for and against. A hidden club stays here but is
                left off the website.
              </p>

              {/* Live look at the form as the website will show it */}
              {rows.some((r) => r.form.length > 0) && (
                <div className="mt-8 hidden flex-wrap items-center gap-x-8 gap-y-3 xl:flex">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/40">On the website</span>
                  {rows.filter((r) => r.isActive && r.form.length > 0).slice(0, 4).map((r) => (
                    <span key={r.key} className="flex items-center gap-2 text-xs text-navy/60">
                      {r.clubName}
                      <FormChips form={r.form} />
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Save bar */}
          {(dirty || justSaved) && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 px-6 py-4 backdrop-blur sm:px-10 lg:left-64">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-navy">
                  {dirty ? <span className="text-navy">You have unsaved changes.</span> : <span className="text-cyan">Saved. The website table is updated.</span>}
                </p>
                {dirty && (
                  <div className="flex gap-3">
                    <button type="button" onClick={discard} disabled={saving} className={btnSecondary}>
                      Discard
                    </button>
                    <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
                      {saving ? "Saving…" : "Save table"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crest dialog */}
          {crestFor && rows && (
            <Dialog title={`Crest for ${rows.find((r) => r.key === crestFor)?.clubName || "this club"}`} onClose={() => setCrestFor(null)}>
              <CloudinaryUpload
                value={rows.find((r) => r.key === crestFor)?.clubLogoUrl || ""}
                onChange={(url) => update(crestFor, { clubLogoUrl: url })}
                folder="eko-united-fc/clubs"
                hint="A square crest with a transparent background, at least 200 x 200 pixels."
              />
              <button type="button" onClick={() => setCrestFor(null)} className={clsx(btnPrimary, "mt-6")}>
                Done
              </button>
            </Dialog>
          )}

          {resultOpen && rows && <ResultDialog rows={rows} onClose={() => setResultOpen(false)} onApply={applyResult} />}
        </div>
      )}
    </AdminShell>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-dark/60 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="font-display text-3xl text-navy">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-2xl leading-none text-navy/40 hover:text-navy">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ResultDialog({
  rows,
  onClose,
  onApply,
}: {
  rows: Row[];
  onClose: () => void;
  onApply: (home: string, away: string, hg: number, ag: number, resort: boolean) => void;
}) {
  const named = rows.filter((r) => r.clubName.trim());
  const eko = named.find((r) => r.isEkoUnited);
  const [home, setHome] = useState(eko?.key || named[0]?.key || "");
  const [away, setAway] = useState(named.find((r) => r.key !== (eko?.key || named[0]?.key))?.key || "");
  const [hg, setHg] = useState(0);
  const [ag, setAg] = useState(0);
  const [resort, setResort] = useState(true);
  const same = home === away;
  const sel = "w-full rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-cyan";

  return (
    <Dialog title="Record a result" onClose={onClose}>
      <p className="mb-5 text-sm text-navy/55">A finished match between two clubs. Both rows get the win, draw or loss, the goals and the form result. You can still edit anything afterwards.</p>
      <div className="grid grid-cols-[1fr_4.5rem] items-end gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy/50">Home</span>
          <select value={home} onChange={(e) => setHome(e.target.value)} className={sel}>
            {named.map((r) => (
              <option key={r.key} value={r.key}>
                {r.clubName}
              </option>
            ))}
          </select>
        </label>
        <Num value={hg} label="Home goals" onChange={setHg} />
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy/50">Away</span>
          <select value={away} onChange={(e) => setAway(e.target.value)} className={sel}>
            {named.map((r) => (
              <option key={r.key} value={r.key}>
                {r.clubName}
              </option>
            ))}
          </select>
        </label>
        <Num value={ag} label="Away goals" onChange={setAg} />
      </div>
      {same && <p className="mt-3 text-sm text-red-500">Choose two different clubs.</p>}
      <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-navy">
        <input type="checkbox" checked={resort} onChange={(e) => setResort(e.target.checked)} className="h-4 w-4 accent-navy" />
        Re-sort the table afterwards
      </label>
      <div className="mt-6 flex gap-3">
        <button type="button" disabled={same || !home || !away} onClick={() => onApply(home, away, hg, ag, resort)} className={clsx(btnPrimary, "disabled:opacity-50")}>
          Add result
        </button>
        <button type="button" onClick={onClose} className={btnSecondary}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}
