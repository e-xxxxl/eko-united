import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import VideoThumb from "@/components/VideoThumb";
import { watchUrl } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Videos",
  description: "Match highlights, interviews and behind the scenes from Eko United FC, on YouTube.",
};

type Video = {
  _id: string;
  title: string;
  videoId: string;
  publishedAt: string;
};

async function getVideos(): Promise<Video[]> {
  return (await apiFetch<Video[]>("/videos", 600)) || [];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

function PlayBadge({ large = false }: { large?: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/50 backdrop-blur-md transition-transform duration-500 ease-smooth group-hover:scale-110 ${
        large ? "h-20 w-20 sm:h-24 sm:w-24" : "h-14 w-14"
      }`}
    >
      <svg viewBox="0 0 24 24" className={large ? "ml-1 h-8 w-8 sm:h-9 sm:w-9" : "ml-0.5 h-6 w-6"} fill="white">
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
      </svg>
    </span>
  );
}

export default async function VideosPage() {
  const videos = await getVideos();
  const [featured, ...rest] = videos;

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Eko United TV</p>
      <h1 className="display-title font-display mb-10">Videos</h1>

      {videos.length === 0 ? (
        <p className="text-navy/50">Videos will appear here once the club adds them.</p>
      ) : (
        <>
          <a
            href={watchUrl(featured.videoId)}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
            className="group relative block aspect-video overflow-hidden rounded-2xl bg-navy-dark"
          >
            <VideoThumb id={featured.videoId} title={featured.title} large />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/25 to-transparent" />
            <PlayBadge large />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">Latest video</p>
              <p className="font-display line-clamp-2 max-w-3xl text-2xl leading-tight text-white sm:text-4xl">
                {featured.title}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/65">
                {formatDate(featured.publishedAt)} · Watch on YouTube
              </p>
            </div>
          </a>

          {rest.length > 0 && (
            <div data-reveal-stagger className="mt-10 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((video) => (
                <a
                  key={video._id}
                  href={watchUrl(video.videoId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <span className="relative block aspect-video overflow-hidden rounded-xl bg-navy-dark">
                    <VideoThumb id={video.videoId} title={video.title} />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark/50 to-transparent" />
                    <PlayBadge />
                  </span>
                  <p className="mt-4 line-clamp-2 font-display text-lg leading-snug text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan">
                    {video.title}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-navy/40">
                    {formatDate(video.publishedAt)} · Watch on YouTube
                  </p>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
