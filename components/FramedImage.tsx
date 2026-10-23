import Image from "next/image";
import { clsx } from "clsx";

// The site's standard photo frame: the picture itself is the whole story. It
// fills its box edge to edge (object-cover) with nothing behind or around it,
// no blurred backdrop, no letterbox bars, no padding. The box shape is set by
// the caller (aspect-* in `className`), and `position` chooses which part of
// the photo stays in view when the shape differs from the photo's own: the
// default keeps the upper part, where faces and the action usually are.
//
// `fill` controls the outer container's own positioning, deliberately a
// discrete prop and not left for the caller to pass "absolute inset-0" via
// `className`: Tailwind's stylesheet defines `.relative` after `.absolute`,
// so a `relative` baked into this component would silently beat an `absolute`
// passed in alongside it (equal specificity, later rule wins). That collision
// is exactly what once made the hero slide collapse to zero height.
export default function FramedImage({
  src,
  alt,
  sizes,
  priority,
  rounded = true,
  fill = false,
  className,
  position = "50% 20%",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  rounded?: boolean;
  fill?: boolean;
  className?: string;
  position?: string;
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
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  );
}
