"use client";

import { useState, type FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const volunteerAreas = [
  "Matchday support and stewarding",
  "Community outreach",
  "Media and content",
  "Youth and academy support",
  "Fundraising and events",
  "Something else",
];

const availabilities = ["Matchdays", "Weekdays", "Weekends", "Evenings", "Flexible"];

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function VolunteerForm({ defaultInterest = "" }: { defaultInterest?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch(`${API_URL}/volunteer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          interest: String(data.get("interest") || ""),
          availability: String(data.get("availability") || ""),
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
      <div>
        <p className="font-display text-4xl font-bold text-navy">Thank you</p>
        <p className="mt-3 max-w-md text-base leading-relaxed text-navy/70">
          Your volunteer application has been received. The Eko United team will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label htmlFor="v-name" className={labelClass}>
          Full name
        </label>
        <input id="v-name" name="name" required autoComplete="name" className={fieldClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="v-email" className={labelClass}>
            Email
          </label>
          <input id="v-email" name="email" type="email" required autoComplete="email" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="v-phone" className={labelClass}>
            Phone number
          </label>
          <input id="v-phone" name="phone" type="tel" required autoComplete="tel" className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="v-interest" className={labelClass}>
            Where would you like to help?
          </label>
          <select id="v-interest" name="interest" required defaultValue={defaultInterest} className={fieldClass}>
            <option value="" disabled>
              Choose an area
            </option>
            {volunteerAreas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="v-availability" className={labelClass}>
            When are you free?
          </label>
          <select id="v-availability" name="availability" defaultValue="Flexible" className={fieldClass}>
            {availabilities.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="v-message" className={labelClass}>
          Tell us a little about you (optional)
        </label>
        <textarea
          id="v-message"
          name="message"
          rows={4}
          placeholder="Any experience, skills, or why you want to help"
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-glass btn-glass-yellow px-8 py-3.5 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
