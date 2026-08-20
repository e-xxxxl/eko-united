// Pure placeholder shapes — no real text/headings, so a crawler that catches
// a page mid-stream never sees fake content. `animate-pulse` is neutralized
// automatically by the global `prefers-reduced-motion` rule in globals.css.

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-navy/10 ${className}`} />;
}

export function GridSkeleton({ tiles = 8 }: { tiles?: number }) {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <Bar className="mb-4 h-3 w-40" />
      <Bar className="mb-10 h-10 w-72" />
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: tiles }).map((_, i) => (
          <div key={i}>
            <Bar className="aspect-[3/4] w-full" />
            <Bar className="mt-3 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </main>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <Bar className="mb-4 h-3 w-40" />
      <Bar className="mb-10 h-10 w-72" />
      <div className="divide-y divide-navy/10 border-t border-navy/10">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-5">
            <Bar className="h-4 w-1/3" />
            <Bar className="h-4 w-16" />
          </div>
        ))}
      </div>
    </main>
  );
}

export function TextSkeleton() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <Bar className="mb-4 h-3 w-40" />
      <Bar className="mb-10 h-10 w-72" />
      <div className="max-w-2xl space-y-3">
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-2/3" />
      </div>
    </main>
  );
}

export function DetailSkeleton() {
  return (
    <main className="grid gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[380px_1fr] lg:px-16">
      <Bar className="aspect-[3/4] w-full" />
      <div>
        <Bar className="mb-4 h-3 w-32" />
        <Bar className="mb-8 h-12 w-2/3" />
        <Bar className="h-24 w-full" />
      </div>
    </main>
  );
}
