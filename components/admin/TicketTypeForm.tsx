"use client";

import { type FormEvent } from "react";

export type TicketTypeFormValues = {
  match: string;
  name: string;
  price: number;
  quantityAvailable: number;
};

export type MatchOption = { _id: string; opponent: string; kickoff: string; isHome: boolean };

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function TicketTypeForm({
  initial,
  matches,
  onSave,
  saving,
  error,
}: {
  initial?: Partial<TicketTypeFormValues>;
  matches: MatchOption[];
  onSave: (values: TicketTypeFormValues) => void;
  saving: boolean;
  error: string;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({
      match: String(data.get("match") || ""),
      name: String(data.get("name") || ""),
      price: Number(data.get("price") || 0),
      quantityAvailable: Number(data.get("quantityAvailable") || 0),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="match" className={labelClass}>
          Match
        </label>
        <select id="match" name="match" required defaultValue={initial?.match} className={fieldClass}>
          <option value="" disabled>
            Select a match…
          </option>
          {matches.map((m) => (
            <option key={m._id} value={m._id}>
              {m.isHome ? "vs " : "at "}
              {m.opponent} —{" "}
              {new Date(m.kickoff).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "Africa/Lagos",
              })}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          Ticket type name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initial?.name}
          placeholder="e.g. Regular, VIP, Student"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label htmlFor="price" className={labelClass}>
            Price (₦)
          </label>
          <input id="price" name="price" type="number" min={0} required defaultValue={initial?.price} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="quantityAvailable" className={labelClass}>
            Quantity available
          </label>
          <input
            id="quantityAvailable"
            name="quantityAvailable"
            type="number"
            min={0}
            required
            defaultValue={initial?.quantityAvailable}
            className={fieldClass}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
      >
        {saving ? "Saving…" : "Save ticket type"}
      </button>
    </form>
  );
}
