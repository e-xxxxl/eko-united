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
  fullBleedFromSm = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  rounded?: boolean;
  fill?: boolean;
  className?: string;
  // Opt-in only (the hero carousel is the one caller that wants this): every
  // other use of this component (news covers, staff headshots, product shots)
  // keeps the never-crop letterboxed treatment at every width, which is the
  // whole point of this component existing. At `sm` and up the sharp image
  // switches to a full-bleed object-cover crop and the blurred backdrop
  // (pointless once nothing is left uncovered) hides, so a portrait/oddly-
  // shaped photo still shows uncropped on a narrow phone screen but fills a
  // wide desktop hero edge-to-edge instead of sitting letterboxed in the
  // middle with visible blur on both sides.
  fullBleedFromSm?: boolean;
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
        className={clsx("scale-125 object-cover opacity-60 blur-2xl", fullBleedFromSm && "sm:hidden")}
      />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        // object-top, not the default center: object-cover's crop is
        // otherwise symmetric top+bottom, and for a photo whose subject sits
        // in the upper portion of the frame (a headshot-style news photo,
        // say) that chops into exactly the part that matters; anchoring to
        // the top keeps the crop's slack entirely at the bottom instead.
        className={clsx("object-contain", fullBleedFromSm && "sm:object-cover sm:object-top")}
      />
    </div>
  );
}
