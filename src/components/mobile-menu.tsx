"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LottieIcon } from "./lottie-icon";

type Item = { href: string; label: string };

/** Mobil tam ekran menü — LottieFiles "Hamburger menu to X" (Darren Samuels). */
export function MobileMenu({
  items,
  labels,
  cta,
  footer,
}: {
  items: Item[];
  labels: { menu: string; close: string };
  cta: { href: string; label: string };
  footer: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // sayfa değişince kapat (render sırasında; efekt içinde setState yok)
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.menu}
        className="relative z-[61] -mr-2 inline-flex size-11 items-center justify-center lg:hidden"
      >
        <LottieIcon
          name="menu"
          size={34}
          mode="controlled"
          active={open}
          segment={[0, 38]}
          speed={1.6}
          color="#10233C"
          fallback={
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="M0 1h22M0 7h22M0 13h22" stroke="#10233C" strokeWidth="1.5" />
            </svg>
          }
        />
      </button>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-[60] flex flex-col bg-porcelain pt-[var(--header-h)] transition-[opacity,visibility] duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="shell flex-1 overflow-y-auto">
          <ul>
            {items.map((it, i) => (
              <li key={it.href} className="rule-b">
                <Link
                  href={it.href}
                  className="flex items-baseline justify-between gap-4 py-5"
                  style={{
                    transition: "transform .6s var(--ease-out-soft), opacity .5s",
                    transitionDelay: open ? `${80 + i * 50}ms` : "0ms",
                    transform: open ? "none" : "translateY(12px)",
                    opacity: open ? 1 : 0,
                  }}
                >
                  <span className="t-h2">{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={cta.href} className="btn btn-primary mt-8 w-full">
            {cta.label} <span className="arrow">→</span>
          </Link>
        </nav>
        <div className="shell rule-t py-5 text-sm text-stone">{footer}</div>
      </div>
    </>
  );
}
