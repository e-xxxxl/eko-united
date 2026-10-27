import FramedImage from "@/components/FramedImage";

// Up to three photos arranged as an offset collage: one tall frame beside two
// squares that sit a little out of line, over a soft cyan block, so a page
// that is mostly text still opens with a picture. One or two photos get a
// matching simpler arrangement.
export default function PhotoCollage({ photos, label }: { photos: string[]; label: string }) {
  if (photos.length === 0) return null;
  const [a, b, c] = photos;

  return (
    <div data-reveal="scale" className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <span aria-hidden className="absolute -left-3 -top-3 h-3/5 w-3/5 rounded-3xl bg-cyan/25 sm:-left-5 sm:-top-5" />
      <span aria-hidden className="absolute -bottom-3 -right-3 h-2/5 w-2/5 rounded-3xl bg-navy/[0.06] sm:-bottom-5 sm:-right-5" />

      {photos.length === 1 && (
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/4]">
          <FramedImage src={a} alt={label} sizes="(min-width: 1024px) 45vw, 100vw" fill rounded={false} priority />
        </div>
      )}

      {photos.length === 2 && (
        <div className="relative grid grid-cols-5 gap-3 sm:gap-4">
          <div className="relative col-span-3 aspect-[3/4] -rotate-1 overflow-hidden rounded-2xl">
            <FramedImage src={a} alt={label} sizes="(min-width: 1024px) 28vw, 60vw" fill rounded={false} priority />
          </div>
          <div className="relative col-span-2 mt-10 aspect-[2/3] rotate-1 overflow-hidden rounded-2xl sm:mt-14">
            <FramedImage src={b} alt="" sizes="(min-width: 1024px) 20vw, 40vw" fill rounded={false} />
          </div>
        </div>
      )}

      {photos.length >= 3 && (
        <div className="relative grid grid-cols-5 gap-3 sm:gap-4">
          <div className="relative col-span-3 row-span-2 -rotate-1 overflow-hidden rounded-2xl">
            <FramedImage src={a} alt={label} sizes="(min-width: 1024px) 28vw, 60vw" fill rounded={false} priority />
          </div>
          <div className="relative col-span-2 aspect-[4/5] translate-y-3 rotate-1 overflow-hidden rounded-2xl sm:translate-y-5">
            <FramedImage src={b} alt="" sizes="(min-width: 1024px) 20vw, 40vw" fill rounded={false} />
          </div>
          <div className="relative col-span-2 aspect-[4/5] translate-y-3 overflow-hidden rounded-2xl sm:translate-y-5">
            <FramedImage src={c} alt="" sizes="(min-width: 1024px) 20vw, 40vw" fill rounded={false} />
          </div>
        </div>
      )}
    </div>
  );
}
