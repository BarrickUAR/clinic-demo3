"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LottieIcon } from "./lottie-icon";

/**
 * Sayfa geçiş göstergesi.
 * İç linke tıklanınca başlar; 150 ms'den kısa geçişlerde hiç görünmez.
 * 600 ms'yi aşarsa köşede Lottie loader belirir.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [slow, setSlow] = useState(false);
  const timers = useRef<number[]>([]);
  const pending = useRef(false);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;
      clear();
      pending.current = true;
      timers.current.push(window.setTimeout(() => pending.current && setState("loading"), 150));
      timers.current.push(window.setTimeout(() => pending.current && setSlow(true), 600));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    clear();
    setSlow(false);
    setState((s) => (s === "loading" ? "done" : "idle"));
    const t = window.setTimeout(() => setState("idle"), 600);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <>
      <div className="nav-progress" data-state={state} aria-hidden="true" />
      <div
        aria-hidden="true"
        className={`fixed right-[var(--gutter)] top-[calc(var(--header-h)+0.75rem)] z-[70] grid size-10 place-items-center bg-surface transition-opacity duration-300 ${
          slow ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {slow ? <LottieIcon name="loader2" size={36} mode="loop" color="#1F6FD1" /> : null}
      </div>
    </>
  );
}
