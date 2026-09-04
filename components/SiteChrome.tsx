"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type FooterSettings = {
  clubInfo?: { address?: string; phone?: string; email?: string };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
};

// The public marketing chrome (nav + footer) doesn't belong on the admin
// panel — it's a separate internal tool, not a page of the club site. The
// root layout can't give /admin a fully separate <html> shell without
// splitting every existing route into a route group, so this is the
// lighter-weight fix: hide the public Header/Footer client-side by path.
export default function SiteChrome({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings?: FooterSettings | null;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      {children}
      <Footer settings={settings} />
    </>
  );
}
