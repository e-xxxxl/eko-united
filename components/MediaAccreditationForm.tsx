"use client";

import { useState, type FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function MediaAccreditationForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const data = new FormData(event.currentTarget);

    try {
      const res = await fetch(`${API_URL}/media-accreditation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          outlet: String(data.get("outlet") || ""),
          role: String(data.get("role") || ""),
          matchInterest: String(data.get("matchInterest") || ""),
          message: String(data.get("message") || ""),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Can't reach the server right now. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border-t border-navy/10 pt-8">
        <p className="text-base text-navy">
          Thank you — your request has been sent. The club will be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Full name
        </label>
        <input id="name" name="name" required className={fieldClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone (optional)
          </label>
          <input id="phone" name="phone" type="tel" className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="outlet" className={labelClass}>
          Media outlet / organisation
        </label>
        <input id="outlet" name="outlet" required className={fieldClass} />
      </div>

      <div>
        <label htmlFor="role" className={labelClass}>
          Your role (optional)
        </label>
        <input id="role" name="role" placeholder="e.g. Reporter, Photographer, Broadcaster" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="matchInterest" className={labelClass}>
          Match(es) you'd like to cover (optional)
        </label>
        <input id="matchInterest" name="matchInterest" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea id="message" name="message" rows={4} required className={fieldClass} />
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-yellow px-8 py-3 text-sm font-bold uppercase tracking-wide text-navy-dark transition-transform duration-300 ease-smooth hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
      >
        {status === "submitting" ? "Sending…" : "Submit request"}
      </button>
    </form>
  );
}
