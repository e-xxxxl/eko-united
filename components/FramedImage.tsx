import Image from "next/image";
import { clsx } from "clsx";

// Fixes the "images look cut out" problem for user-uploaded photos of
// unpredictable aspect ratio (news covers, staff headshots): a plain
// object-cover crop chops off whatever doesn't fit the box, which looks
// broken for a portrait photo in a wide card or vice versa. Instead this
// renders the SAME photo twice — a blurred, scaled-up copy filling the box
// as an ambient backdrop (so there's never an empty bar), with the real
// photo centered on top via object-contain so the full image is always
// visible, never cropped. The blurred backdrop is drawn from the photo's
// own colors, so the edges blend into it rather than cutting off sharply —
// same idea as Spotify/Apple Music artwork frames.
//
// `fill` controls the outer container's own positioning — deliberately a
// discrete prop, not left for the caller to pass "absolute inset-0" via
// `className`: Tailwind's stylesheet defines `.relative` after `.absolute`,
// so a `relative` baked into this component would silently beat an
// `absolute` passed in alongside it (equal specificity, later rule wins) —
// not an HTML class-order fight. That collision is exactly what made the
// hero's full-bleed slide collapse to zero height and render blank.
export default function FramedImage({
  src,
  alt,
  sizes,
  priority,
  rounded = true,
  fill = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  rounded?: boolean;
  fill?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        fill ? "absolute inset-0" : "relative",
        "overflow-hidden bg-navy-light",
        rounded && "rounded-2xl",
        className
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        aria-hidden
        sizes={sizes}
        className="scale-125 object-cover opacity-60 blur-2xl"
      />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain"
      />
    </div>
  );
}
