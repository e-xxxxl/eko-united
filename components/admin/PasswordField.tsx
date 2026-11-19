"use client";

import { useState, type InputHTMLAttributes } from "react";

// A password box with a "show / hide" eye, so a typo can be spotted before signing
// in or before a temporary password is handed to a colleague. `tone` picks the
// colours for the dark sign-in panel or the white admin pages.
export default function PasswordField({
  tone = "light",
  className = "",
  ...props
}: { tone?: "light" | "dark" } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const dark = tone === "dark";

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className={`absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg transition-colors duration-200 ease-smooth ${
          dark ? "text-white/45 hover:text-cyan" : "text-navy/40 hover:text-cyan-dark"
        }`}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c5.5 0 9 5.5 9.5 7a11.6 11.6 0 0 1-2.6 3.7M6.3 6.3A11.6 11.6 0 0 0 2.5 12c.5 1.5 4 7 9.5 7a9.7 9.7 0 0 0 4-.9" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
