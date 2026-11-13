"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

// Reads QR codes from the device camera. Works the same on iPhone, Android and
// a laptop because it decodes the picture itself (jsQR) instead of leaning on
// the browser's own barcode support, which iPhones and most desktop browsers
// do not have. Frames are shrunk before decoding so an ordinary phone keeps up.
//
// `paused` keeps the camera running but stops reading, so a result can sit on
// screen without the same ticket being picked up again.
export default function QrScanner({
  facing,
  paused = false,
  onScan,
  onFailure,
}: {
  facing: "environment" | "user";
  paused?: boolean;
  onScan: (value: string) => void;
  onFailure?: (message: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const pausedRef = useRef(paused);
  const [state, setState] = useState<"starting" | "scanning" | "error">("starting");
  const [message, setMessage] = useState("");

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    let lastTick = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function fail(text: string) {
      if (stopped) return;
      setState("error");
      setMessage(text);
      onFailure?.(text);
    }

    async function start() {
      setState("starting");
      if (!navigator.mediaDevices?.getUserMedia) {
        fail(
          window.isSecureContext
            ? "This browser cannot use the camera. Type the ticket number instead."
            : "The camera only works on a secure (https) page."
        );
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute("playsinline", "true"); // iPhone: stay inline instead of going fullscreen
        await video.play();
        setState("scanning");
        raf = requestAnimationFrame(tick);
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          fail("Camera access is blocked. Allow the camera for this site in your browser settings, then try again.");
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          fail("No camera was found on this device. Type the ticket number instead.");
        } else {
          fail("The camera could not be started. Close other apps using it, or type the ticket number instead.");
        }
      }
    }

    function tick(now: number) {
      if (stopped) return;
      raf = requestAnimationFrame(tick);
      // About 8 reads a second is plenty and keeps phones cool.
      if (now - lastTick < 120 || pausedRef.current) return;
      lastTick = now;
      const video = videoRef.current;
      if (!video || !ctx || video.readyState < 2 || !video.videoWidth) return;

      const scale = Math.min(1, 640 / video.videoWidth);
      const w = Math.round(video.videoWidth * scale);
      const h = Math.round(video.videoHeight * scale);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      const code = jsQR(frame.data, w, h, { inversionAttempts: "dontInvert" });
      if (code?.data) onScanRef.current(code.data);
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // onFailure is only a notification; restarting the camera for it would be wrong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-dark">
      <video ref={videoRef} className="aspect-square w-full object-cover sm:aspect-[4/3]" muted playsInline />
      {state === "scanning" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-3/5 w-3/5 rounded-3xl border-4 border-cyan/80 shadow-[0_0_0_9999px_rgba(6,23,51,0.45)]" />
        </div>
      )}
      {state === "starting" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Starting the camera…</div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-navy-dark p-6 text-center text-sm leading-relaxed text-white/80">
          {message}
        </div>
      )}
    </div>
  );
}
