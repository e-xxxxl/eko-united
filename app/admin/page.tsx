import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

// Not indexed — see robots.ts (disallow: "/admin") — and this page itself
// carries no public marketing chrome (see SiteChrome).
export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy-dark px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Image
            src="/brand/crest-mark.png"
            alt="Eko United FC crest"
            width={64}
            height={64}
            priority
            className="h-16 w-16"
          />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            Eko United FC
          </p>
          <h1 className="font-display mt-1 text-3xl text-white">Admin Login</h1>
        </div>

        <AdminLoginForm />

        <Link
          href="/"
          className="mt-8 block text-center text-xs text-white/40 transition-colors duration-200 ease-smooth hover:text-white"
        >
          ← Back to ekounitedfc.com
        </Link>
      </div>
    </main>
  );
}
