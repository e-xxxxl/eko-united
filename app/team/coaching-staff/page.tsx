import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { demoCoaches, demoTechnicalStaff, type DemoPlayer } from "@/lib/demoData";
import FramedImage from "@/components/FramedImage";

export const metadata: Metadata = {
  title: "Coaching & Technical Staff",
  description: "Meet the coaching and technical staff behind Eko United FC.",
};

async function getStaff(role: "coach" | "technical_staff"): Promise<DemoPlayer[]> {
  const live = await apiFetch<DemoPlayer[]>(`/players?role=${role}`, 1800);
  if (live && live.length > 0) return live;
  return role === "coach" ? demoCoaches : demoTechnicalStaff;
}

function StaffGrid({ members }: { members: DemoPlayer[] }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((person) => (
        <Link key={person._id} href={`/team/${person.slug}`} className="group block">
          {person.photoUrl ? (
            <FramedImage
              src={person.photoUrl}
              alt={person.name}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 80vw"
              className="aspect-square transition-transform duration-500 ease-smooth group-hover:scale-[1.02]"
            />
          ) : (
            <div className="aspect-square rounded-2xl bg-navy-light" />
          )}
          <p className="mt-4 font-display text-lg transition-colors duration-200 ease-smooth group-hover:text-cyan">
            {person.name}
          </p>
          {(person.title || person.position) && (
            <p className="text-sm text-cyan">{person.title || person.position}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

export default async function CoachingStaffPage() {
  const [coaches, technicalStaff] = await Promise.all([
    getStaff("coach"),
    getStaff("technical_staff"),
  ]);

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Behind the Team
      </p>
      <h1 className="display-title font-display">Coaching &amp; Technical Staff</h1>

      <section className="mt-14 border-t border-navy/10 pt-10">
        <h2 className="font-display text-2xl text-navy/90">Coaching Staff</h2>
        {coaches.length === 0 ? (
          <p className="mt-6 text-navy/50">Coaching staff profiles will appear here once added.</p>
        ) : (
          <StaffGrid members={coaches} />
        )}
      </section>

      <section className="mt-14 border-t border-navy/10 pt-10">
        <h2 className="font-display text-2xl text-navy/90">Technical Team</h2>
        {technicalStaff.length === 0 ? (
          <p className="mt-6 text-navy/50">Technical team profiles will appear here once added.</p>
        ) : (
          <StaffGrid members={technicalStaff} />
        )}
      </section>
    </main>
  );
}
