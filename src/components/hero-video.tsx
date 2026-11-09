"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  poster: string;
  alt: string;
  sources: { sd: string; hd: string };
  labels: { pause: string; play: string };
};

/**
 * Hero video paneli.
 * - Poster next/image ile sunucuda render edilir (LCP = poster, video değil).
 * - Video, sayfa yüklenip tarayıcı boşta kalınca eklenir; Save-Data veya
 *   "hareketi azalt" tercihinde hiç yüklenmez.
 * - Yavaş oynar (0.8x), ekran dışındayken durur, kullanıcı durdurabilir (WCAG 2.2.2).
 */
export function HeroVideo({ poster, alt, sources, labels }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) return;

    const pick = () => setSrc(window.innerWidth < 768 ? sources.sd : sources.hd);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => (w.requestIdleCallback ? w.requestIdleCallback(pick, { timeout: 2500 }) : setTimeout(pick, 1200));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, [sources.hd, sources.sd]);

  useEffect(() => {
    const v = video.current;
    const el = box.current;
    if (!v || !el || !src) return;
    v.playbackRate = 0.8;
    const io = new IntersectionObserver(([e]) => {
      if (userPaused.current) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
      setPaused(false);
    } else {
      userPaused.current = true;
      v.pause();
      setPaused(true);
    }
  };

  return (
    <div ref={box} className="hero-media relative h-full w-full overflow-hidden bg-ice">
      <Image src={poster} alt={alt} fill priority sizes="100vw" quality={70} className="object-cover" />
      {src ? (
        <video
          ref={video}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setShown(true)}
          onLoadedMetadata={(e) => (e.currentTarget.playbackRate = 0.8)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ${shown ? "opacity-100" : "opacity-0"}`}
        />
      ) : null}
      {src ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? labels.play : labels.pause}
          className={`absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-graphite transition-opacity duration-500 hover:bg-white hover:text-steel ${
            shown ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {paused ? (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3.5 2.2v9.6L11.6 7z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <rect x="3" y="2.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
              <rect x="8.4" y="2.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  );
}
