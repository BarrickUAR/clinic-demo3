"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export type MegaItem = { id: string; name: string; short: string; meta: string; href: string };

/**
 * Header'daki "Tedaviler" mega menüsü — fotoğraflı bento grid.
 * Fotoğraflar sunucuda hazırlanıp `photos` ile gelir, menü ilk kez açılınca DOM'a girer
 * (kapalıyken hiçbir görsel indirilmez).
 */
export function MegaMenu({
  label,
  href,
  items,
  photos,
  intro,
}: {
  label: string;
  href: string;
  items: MegaItem[];
  photos: React.ReactNode[];
  intro: { title: string; body: string; all: string; book: string; bookHref: string };
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timer = useRef(0);
  const root = useRef<HTMLLIElement>(null);
  const id = useId();
  const pathname = usePathname();

  const show = () => {
    window.clearTimeout(timer.current);
    setMounted(true);
    setOpen(true);
  };
  const hide = (delay = 160) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), delay);
  };

  // sayfa değişince kapat (render sırasında; efekt içinde setState yok)
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLElement>("[data-mega-trigger]")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const [lead, ...rest] = items;
  const leadPhoto = photos[0];

  return (
    <li
      ref={root}
      className="static"
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide(0);
      }}
    >
      <span className="inline-flex items-center gap-1">
        <Link href={href} className={`link-u py-1 ${open ? "text-steel" : ""}`}>
          {label}
        </Link>
        <button
          type="button"
          data-mega-trigger
          aria-expanded={open}
          aria-controls={id}
          aria-label={label}
          onClick={() => (open ? setOpen(false) : show())}
          className="grid size-6 place-items-center text-stone hover:text-steel"
        >
          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" className={`transition-transform duration-300 ${open ? "rotate-180 text-steel" : ""}`}>
            <path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </span>

      <div
        id={id}
        className={`mega absolute inset-x-0 top-full border-b border-line bg-white shadow-[0_40px_60px_-50px_rgb(16_35_60/0.6)] ${open ? "is-open" : ""}`}
        aria-hidden={!open}
        inert={!open}
      >
        {mounted ? (
          <div className="shell grid grid-cols-12 gap-6 py-8">
            {/* giriş */}
            <div className="col-span-3 flex flex-col border-r border-line pr-6">
              <p className="font-display text-[1.625rem] font-medium leading-tight tracking-[-0.02em] text-graphite">{intro.title}</p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">{intro.body}</p>
              <div className="mt-auto flex flex-col gap-2 pt-6">
                <Link href={href} className="btn btn-ghost min-h-11 justify-between text-[0.875rem]">
                  {intro.all} <span className="arrow">→</span>
                </Link>
                <Link href={intro.bookHref} className="btn btn-primary min-h-11 justify-between text-[0.875rem]">
                  {intro.book} <span className="arrow">→</span>
                </Link>
              </div>
            </div>

            {/* bento */}
            <ul className="col-span-9 grid auto-rows-[112px] grid-cols-4 gap-3">
              {lead ? (
                <li className="mega-item col-span-2 row-span-2" style={{ "--d": "0ms" } as React.CSSProperties}>
                  <Link href={lead.href} className="mega-card group relative block h-full overflow-hidden bg-ice-2">
                    <span className="mega-img absolute inset-0">{leadPhoto}</span>
                    <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 bg-white p-4">
                      <span className="min-w-0">
                        <span className="block font-display text-[1.25rem] font-medium leading-tight tracking-[-0.015em] text-graphite group-hover:text-steel">{lead.name}</span>
                        <span className="mt-1 line-clamp-1 block text-[0.8125rem] text-stone">{lead.short}</span>
                      </span>
                      <span className="mega-arrow grid size-9 shrink-0 place-items-center rounded-full border border-line text-stone">→</span>
                    </span>
                  </Link>
                </li>
              ) : null}
              {rest.map((it, i) => (
                <li key={it.id} className="mega-item" style={{ "--d": `${(i + 1) * 35}ms` } as React.CSSProperties}>
                  <Link href={it.href} className="mega-card group flex h-full items-stretch gap-3 overflow-hidden border border-line bg-white p-2 hover:border-ice hover:bg-ice-2">
                    <span className="mega-img relative w-[76px] shrink-0 overflow-hidden bg-ice-2">{photos[i + 1]}</span>
                    <span className="flex min-w-0 flex-col justify-center py-1 pr-1">
                      <span className="text-[0.9375rem] font-medium leading-tight text-graphite group-hover:text-steel">{it.name}</span>
                      <span className="mt-1.5 text-[0.75rem] text-steel tnum">{it.meta}</span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="mega-item" style={{ "--d": `${items.length * 35}ms` } as React.CSSProperties}>
                <Link href={href} className="group flex h-full flex-col justify-between bg-steel p-4 text-white hover:bg-steel-deep">
                  <span className="text-[0.9375rem] font-medium leading-tight">{intro.all}</span>
                  <span className="self-end text-[1.25rem] transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            </ul>
          </div>
        ) : null}
      </div>
    </li>
  );
}
