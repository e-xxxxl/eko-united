export default function Loading() {
  return (
    <main>
      <div className="aspect-video w-full animate-pulse bg-navy/10 sm:aspect-[21/9]" />
      <article className="mx-auto max-w-3xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-24 rounded-sm bg-navy/10" />
          <div className="h-10 w-3/4 rounded-sm bg-navy/10" />
          <div className="mt-8 h-4 w-full rounded-sm bg-navy/10" />
          <div className="h-4 w-full rounded-sm bg-navy/10" />
          <div className="h-4 w-2/3 rounded-sm bg-navy/10" />
        </div>
      </article>
    </main>
  );
}
