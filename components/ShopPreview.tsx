import Link from "next/link";
import Image from "next/image";

// Static teaser only — the real Product model, cart and checkout are Phase 2
// (out of scope for now, see CLAUDE.md §7). Kit renders supplied by Emmanuel,
// dropped in frontend/public/jerseys/ — swap for real Cloudinary product
// photography once shot, no layout change needed.
const products = [
  { id: "home-kit", name: "2026 Home Kit", price: "₦25,000", imageUrl: "/jerseys/home-kit.jpg" },
  { id: "away-kit", name: "2026 Away Kit", price: "₦25,000", imageUrl: "/jerseys/away-kit.jpg" },
];

export default function ShopPreview() {
  return (
    <section className="bg-navy-dark px-6 py-16 sm:px-10 lg:px-16">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
            2026 Kit
          </p>
          <h2 className="font-display text-2xl text-white sm:text-3xl">Club Shop</h2>
        </div>
        <Link
          href="/shop"
          className="text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-white"
        >
          Visit shop →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <Link key={product.id} href="/shop" className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-white">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 45vw, 90vw"
                className="object-contain p-3 transition-transform duration-500 ease-smooth group-hover:scale-105"
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-sm font-medium text-white group-hover:text-cyan">
                {product.name}
              </p>
              <p className="text-sm text-white/50">{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
