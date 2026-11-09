"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AnimationItem } from "lottie-web";

/**
 * Hafif Lottie oynatıcı.
 * - lottie-web "light" (yalnızca SVG renderer) dinamik import edilir; ilk yükte JS'e girmez.
 * - Görünür olunca + tarayıcı boşta iken yüklenir → LCP/TBT etkilenmez.
 * - Animasyon renkleri çalışma anında paletle değiştirilir.
 * - Yüklenene kadar sabit boyutlu statik SVG (fallback) gösterilir → CLS = 0.
 */

type Mode = "hover" | "loop" | "once" | "controlled";
type RGB = [number, number, number];

type Props = {
  name: string;
  size: number;
  mode?: Mode;
  /** controlled: true → ileri oynat (son kareye), false → geri */
  active?: boolean;
  /** ana renk (koyu tonlar bu renge çevrilir) */
  color?: string;
  /** açık tonlar (beyaza yakın) bu renge çevrilir */
  light?: string;
  /** controlled modda kullanılacak kare aralığı */
  segment?: [number, number];
  speed?: number;
  fallback?: ReactNode;
  className?: string;
};

let lottieMod: Promise<typeof import("lottie-web").default> | null = null;
const loadLottie = () =>
  (lottieMod ??= import("lottie-web/build/player/lottie_light").then(
    (m) => (m.default ?? m) as unknown as typeof import("lottie-web").default,
  ));

const jsonCache = new Map<string, Promise<unknown>>();
const loadJson = (name: string) => {
  if (!jsonCache.has(name)) jsonCache.set(name, fetch(`/lottie/${name}.json`).then((r) => r.json()));
  return jsonCache.get(name)!;
};

const hexToRgb = (hex: string): RGB => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const lum = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

function recolor(node: unknown, dark: RGB, light: RGB) {
  const map = (c: number[]) => {
    const target = lum(c) > 0.82 ? light : dark;
    c[0] = target[0];
    c[1] = target[1];
    c[2] = target[2];
  };
  const walk = (n: unknown) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if ((o.ty === "fl" || o.ty === "st") && o.c && typeof o.c === "object") {
      const c = o.c as { a?: number; k: unknown };
      if (c.a === 1 && Array.isArray(c.k)) {
        for (const kf of c.k as { s?: number[]; e?: number[] }[]) {
          if (kf.s) map(kf.s);
          if (kf.e) map(kf.e);
        }
      } else if (Array.isArray(c.k) && typeof c.k[0] === "number") {
        map(c.k as number[]);
      }
    }
    for (const v of Object.values(o)) if (v && typeof v === "object") walk(v);
  };
  walk(node);
}

const idle = (cb: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(cb, { timeout: 1200 });
  else setTimeout(cb, 200);
};

export function LottieIcon({
  name,
  size,
  mode = "hover",
  active,
  color = "#10233C",
  light = "#FFFFFF",
  segment,
  speed = 1,
  fallback,
  className = "",
}: Props) {
  const host = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  const anim = useRef<AnimationItem | null>(null);
  const [ready, setReady] = useState(false);
  const reduced = useRef(false);

  // load when visible + idle
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;

    const start = () =>
      idle(async () => {
        const [lottie, raw] = await Promise.all([loadLottie(), loadJson(name)]);
        if (cancelled || !box.current) return;
        const data = structuredClone(raw);
        recolor(data, hexToRgb(color), hexToRgb(light));
        const a = lottie.loadAnimation({
          container: box.current,
          renderer: "svg",
          loop: mode === "loop",
          autoplay: false,
          animationData: data,
          rendererSettings: { preserveAspectRatio: "xMidYMid meet", progressiveLoad: true },
        });
        a.setSpeed(speed);
        anim.current = a;
        a.addEventListener("DOMLoaded", () => {
          if (cancelled) return;
          const first = segment?.[0] ?? 0;
          a.goToAndStop(first, true);
          setReady(true);
          if (reduced.current) return;
          if (mode === "loop" || mode === "once") a.play();
        });
      });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      anim.current?.destroy();
      anim.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, color, light, mode]);

  // hover trigger: closest interactive ancestor
  useEffect(() => {
    if (mode !== "hover") return;
    const trigger = host.current?.closest("a,button,label,[data-lottie-trigger]") ?? host.current;
    if (!trigger) return;
    const onEnter = () => {
      const a = anim.current;
      if (!a || reduced.current) return;
      a.setDirection(1);
      a.goToAndPlay(0, true);
    };
    trigger.addEventListener("pointerenter", onEnter);
    trigger.addEventListener("focus", onEnter);
    return () => {
      trigger.removeEventListener("pointerenter", onEnter);
      trigger.removeEventListener("focus", onEnter);
    };
  }, [mode]);

  // controlled
  useEffect(() => {
    if (mode !== "controlled" || !ready) return;
    const a = anim.current;
    if (!a) return;
    const [s, e] = segment ?? [0, a.totalFrames - 1];
    if (reduced.current) {
      a.goToAndStop(active ? e : s, true);
      return;
    }
    a.playSegments(active ? [s, e] : [e, s], true);
  }, [active, ready, mode, segment]);

  return (
    <span
      ref={host}
      aria-hidden="true"
      className={`lottie-host ${className}`}
      style={{ width: size, height: size }}
    >
      <span ref={box} style={{ width: size, height: size, opacity: ready ? 1 : 0 }} />
      {!ready && fallback ? (
        <span style={{ width: size, height: size, display: "grid", placeItems: "center" }}>{fallback}</span>
      ) : null}
    </span>
  );
}
