import PhotoCollage from "@/components/PhotoCollage";

// The opening of a page that would otherwise be all text: eyebrow, title and
// a short introduction on one side, a photo collage on the other. Stacks on
// phones with the words first, then the photos.
export default function PageIntro({
  eyebrow,
  title,
  intro,
  photos,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  photos: string[];
  children?: React.ReactNode;
}) {
  return (
    <section className="mb-14 grid items-center gap-12 lg:mb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
      <div>
        {eyebrow && <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{eyebrow}</p>}
        <h1 className="display-title font-display">{title}</h1>
        {intro && <div className="mt-6 max-w-xl text-base leading-relaxed text-navy/70 sm:text-lg">{intro}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
      <PhotoCollage photos={photos} label={title} />
    </section>
  );
}
