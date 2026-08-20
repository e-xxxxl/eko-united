export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-end px-6 pb-16 pt-32 sm:px-10 lg:px-16">
      <div className="animate-pulse space-y-4">
        <div className="h-3 w-48 rounded-sm bg-navy/10" />
        <div className="h-16 w-96 max-w-full rounded-sm bg-navy/10" />
      </div>
    </main>
  );
}
