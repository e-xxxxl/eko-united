import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { formatNaira } from "@/lib/format";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { isRealId } from "@/lib/isRealId";

export type ShopProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  kidsPrice?: number | null;
  kidsSizes?: string[];
  images: string[];
  sizes: string[];
  stock: number;
  category?: "jersey" | "apparel" | "accessories" | "other";
};

export const categoryLabels: Record<NonNullable<ShopProduct["category"]>, string> = {
  jersey: "Jersey",
  apparel: "Apparel",
  accessories: "Accessories",
  other: "Merchandise",
};

// One product in the shop grid and on the homepage. The photo is the card:
// it fills a tall frame edge to edge with nothing behind it, and a second
// photo (when the product has one) fades in on hover so shoppers see another
// angle without opening the page. Everything else (adding to the cart, kids
// sizes) happens on the product page, where there is room to do it properly.
export default function ProductCard({
  product,
  badge,
  dark = false,
}: {
  product: ShopProduct;
  badge?: string;
  dark?: boolean;
}) {
  const photos = product.images.filter(isAllowedImageUrl);
  const outOfStock = isRealId(product._id) && product.stock <= 0;
  const hasKids = product.kidsPrice !== undefined && product.kidsPrice !== null;
  const lowStock = !outOfStock && isRealId(product._id) && product.stock > 0 && product.stock <= 5;

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
        {photos[0] ? (
          <Image
            src={photos[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className={clsx(
              "object-cover transition-all duration-700 ease-smooth",
              photos[1] ? "group-hover:opacity-0" : "group-hover:scale-105"
            )}
          />
        ) : (
          <div className={clsx("absolute inset-0", dark ? "bg-white/10" : "bg-navy/[0.06]")} />
        )}
        {photos[1] && (
          <Image
            src={photos[1]}
            alt=""
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 ease-smooth group-hover:opacity-100"
          />
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {outOfStock ? (
            <span className="rounded-md bg-navy-dark px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Sold out
            </span>
          ) : (
            <>
              {badge && (
                <span className="rounded-md bg-navy-dark px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {badge}
                </span>
              )}
              {lowStock && (
                <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-navy">
                  Only {product.stock} left
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="pt-4">
        {product.category && (
          <p className={clsx("text-[10px] font-semibold uppercase tracking-[0.2em]", dark ? "text-cyan" : "text-navy/40")}>
            {categoryLabels[product.category]}
          </p>
        )}
        <p
          className={clsx(
            "mt-1 line-clamp-2 text-base font-medium leading-snug transition-colors duration-200 ease-smooth",
            dark ? "text-white group-hover:text-cyan" : "text-navy group-hover:text-cyan"
          )}
        >
          {product.name}
        </p>
        <p className={clsx("mt-1.5 flex flex-wrap items-baseline gap-x-3 text-sm", dark ? "text-white" : "text-navy")}>
          <span className="font-semibold">{formatNaira(product.price)}</span>
          {hasKids && (
            <span className={dark ? "text-white/60" : "text-navy/50"}>Kids {formatNaira(product.kidsPrice as number)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
