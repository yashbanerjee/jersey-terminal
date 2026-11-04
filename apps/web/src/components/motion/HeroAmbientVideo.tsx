"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dark ambient stadium loop behind the hero.
 * Prefers `/bg/stadium-loop.mp4` (or `.webm`) when present; otherwise a
 * Ken-Burns pan on the still stadium photo so the hero always feels alive.
 */
export function HeroAmbientVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 768px)").matches;
    // Skip video decode on phones — still photo is enough and far cheaper.
    if (reduced || mobile) return;

    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        await video.play();
        setHasVideo(true);
      } catch {
        setHasVideo(false);
      }
    };

    const onCanPlay = () => {
      setHasVideo(true);
      void tryPlay();
    };
    const onError = () => setHasVideo(false);

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);
    // Probe — if src 404s, error fires and we keep the photo loop
    video.load();

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Still / Ken Burns fallback — always mounted under the video */}
      <div className={`jt-hero-kenburns absolute inset-0 ${hasVideo ? "opacity-0" : "opacity-100"}`}>
        <div
          className="jt-hero-kenburns-img absolute inset-[-8%] bg-cover bg-center"
          style={{ backgroundImage: "url(/bg/stadium-night.jpg)" }}
        />
      </div>

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          hasVideo ? "opacity-[0.34]" : "opacity-0"
        }`}
        poster="/bg/stadium-night.jpg"
        muted
        playsInline
        loop
        preload="metadata"
        // Drop a file at public/bg/stadium-loop.mp4 to enable real video.
      >
        <source src="/bg/stadium-loop.webm" type="video/webm" />
        <source src="/bg/stadium-loop.mp4" type="video/mp4" />
      </video>

      {/* Keep copy readable */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,7,0.55)_0%,rgba(5,6,7,0.35)_40%,rgba(5,6,7,0.75)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(180,255,26,0.12),transparent_55%)]" />
    </div>
  );
}
