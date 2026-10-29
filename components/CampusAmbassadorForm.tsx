"use client";

import { useState, type FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const levels = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level", "Postgraduate", "Other"];

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

export default function CampusAmbassadorForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) || "");
    try {
      const res = await fetch(`${API_URL}/campus-ambassador`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: field("name"),
          email: field("email"),
          phone: field("phone"),
          institution: field("institution"),
          course: field("course"),
          level: field("level"),
          social: field("social"),
          message: field("message"),
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
          Your campus ambassador application has been received. The Eko United team will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label htmlFor="ca-name" className={labelClass}>
          Full name
        </label>
        <input id="ca-name" name="name" required autoComplete="name" className={fieldClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ca-email" className={labelClass}>
            Email
          </label>
          <input id="ca-email" name="email" type="email" required autoComplete="email" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="ca-phone" className={labelClass}>
            Phone number
          </label>
          <input id="ca-phone" name="phone" type="tel" required autoComplete="tel" className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="ca-institution" className={labelClass}>
          Institution
        </label>
        <input id="ca-institution" name="institution" required placeholder="e.g. University of Lagos" className={fieldClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ca-course" className={labelClass}>
            Course of study
          </label>
          <input id="ca-course" name="course" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="ca-level" className={labelClass}>
            Level
          </label>
          <select id="ca-level" name="level" defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Choose your level
            </option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ca-social" className={labelClass}>
          Instagram or X handle (optional)
        </label>
        <input id="ca-social" name="social" placeholder="@yourhandle" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="ca-message" className={labelClass}>
          Why would you make a good ambassador? (optional)
        </label>
        <textarea
          id="ca-message"
          name="message"
          rows={4}
          placeholder="Tell us about your campus, your following, or any groups you lead"
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
