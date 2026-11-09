"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { JawApi, ToothInfo, View, Zone } from "./scene";

type Labels = {
  zones: Record<Zone, string>;
  drag: string;
  tooth: string;
  upper: string;
  lower: string;
  right: string;
  left: string;
  kinds: Record<number, string>; // 1..8 → isim
  views: Record<View, string>;
  xray: string;
  viewLabel: string;
};

type Focus = { id: string; name: string; caption: string; meta: string; href: string };

/**
 * SVG haritayı 3D çeneye yükseltir (progressive enhancement).
 * - Bölüm görünür olunca + tarayıcı boşta iken three.js dinamik yüklenir.
 * - WebGL yoksa SVG kalır. SVG sayfada yer kaplamaya devam eder → CLS yok.
 * - Satır hover/focus → seçili tedavi çenede gösterilir ve imleç tahtadan çıkana kadar kalır
 *   (kullanıcı modele geçip döndürebilsin diye).
 * - 3D'de hover edilen diş → .board[data-active-zone] (CSS ilgili satırları vurgular).
 */
export function Jaw3D({
  children,
  labels,
  pick,
  more,
  hint,
}: {
  children: React.ReactNode;
  labels: Labels;
  pick: string;
  more: string;
  hint: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<JawApi | null>(null);
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState<ToothInfo | null>(null);
  const [focus, setFocusInfo] = useState<Focus | null>(null);
  const [view, setView] = useState<View>("front");
  const [xray, setXray] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const board = el.closest<HTMLElement>(".board");
    let cancelled = false;

    const test = document.createElement("canvas");
    const webgl = !!(test.getContext("webgl2") || test.getContext("webgl"));

    const start = () => {
      const run = async () => {
        const { createJaw } = await import("./scene");
        if (cancelled) return;
        api.current = createJaw(cv, {
          reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onReady: () => setReady(true),
          onHover: (i) => {
            setInfo(i);
            if (board) {
              if (i) board.dataset.activeZone = i.zone;
              else delete board.dataset.activeZone;
            }
          },
        });
        if (currentRow) api.current.setFocus(currentRow.dataset.treatment!);
      };
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 1500 });
      else setTimeout(run, 300);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          if (webgl) start();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);

    // satır / etiket hover → 3D vurgu
    const zonesOf = (t: EventTarget | null): Zone[] | null => {
      const n = (t as Element | null)?.closest?.<HTMLElement>(".zone-chip");
      return n?.dataset.zone ? [n.dataset.zone as Zone] : null;
    };
    const rowOf = (t: EventTarget | null) => (t as Element | null)?.closest?.<HTMLElement>("[data-treatment]") ?? null;
    let currentRow: HTMLElement | null = null;

    const activate = (row: HTMLElement | null) => {
      if (row === currentRow) return;
      currentRow?.removeAttribute("data-active");
      currentRow = row;
      if (row) {
        row.dataset.active = "";
        board?.setAttribute("data-focus", "");
        api.current?.setHighlight([]);
        api.current?.setFocus(row.dataset.treatment!);
        setFocusInfo({
          id: row.dataset.treatment!,
          name: row.dataset.name ?? "",
          caption: row.dataset.caption ?? "",
          meta: row.dataset.meta ?? "",
          href: row.dataset.href ?? "#",
        });
      } else {
        board?.removeAttribute("data-focus");
        api.current?.setFocus(null);
        setFocusInfo(null);
      }
    };

    // kartlardan çıkınca kısa bir gecikmeyle sıfırla; bu sürede başka karta ya da 3D panele girilirse iptal
    let resetTimer = 0;
    const cancelReset = () => window.clearTimeout(resetTimer);
    const scheduleReset = () => {
      cancelReset();
      resetTimer = window.setTimeout(() => activate(null), 320);
    };
    const inPanel = (t: EventTarget | null) => !!(t as Element | null)?.closest?.(".jaw-panel");

    const over = (e: Event) => {
      const row = rowOf(e.target);
      if (row) {
        cancelReset();
        return activate(row);
      }
      if (inPanel(e.target)) return cancelReset();
      const z = zonesOf(e.target);
      if (z) {
        activate(null);
        api.current?.setHighlight(z);
      }
    };
    const out = (e: Event) => {
      const to = ((e as PointerEvent).relatedTarget ?? (e as FocusEvent).relatedTarget) as Node | null;
      if (!zonesOf(to)) api.current?.setHighlight([]);
      if (currentRow && !rowOf(to) && !inPanel(to)) scheduleReset();
    };
    // tahtadan tamamen çıkınca odak sıfırlanır
    const leave = () => {
      cancelReset();
      activate(null);
    };
    const blur = (e: FocusEvent) => {
      if (!board?.contains(e.relatedTarget as Node | null)) activate(null);
    };

    board?.addEventListener("pointerover", over);
    board?.addEventListener("pointerout", out);
    board?.addEventListener("pointerleave", leave);
    board?.addEventListener("focusin", over);
    board?.addEventListener("focusout", blur);

    return () => {
      cancelled = true;
      window.clearTimeout(resetTimer);
      io.disconnect();
      board?.removeEventListener("pointerover", over);
      board?.removeEventListener("pointerout", out);
      board?.removeEventListener("pointerleave", leave);
      board?.removeEventListener("focusin", over);
      board?.removeEventListener("focusout", blur);
      api.current?.dispose();
      api.current = null;
    };
  }, []);

  const describe = (i: ToothInfo) => {
    if (i.zone === "gum") return labels.zones.gum;
    const q = Math.floor(i.n / 10);
    const pos = `${q <= 2 ? labels.upper : labels.lower} ${q === 1 || q === 4 ? labels.right : labels.left}`;
    return `${pos} · ${labels.kinds[i.n % 10]}`;
  };

  return (
    <div ref={wrap} className="jaw-panel">
      {/* seçili tedavi kartı */}
      <div className="flex min-h-[5.75rem] items-center justify-between gap-4 border-b border-line bg-white px-5 py-4 sm:px-6" aria-live="polite">
        {focus ? (
          <div key={focus.id} className="jaw-card min-w-0">
            <p className="font-display text-[1.25rem] font-medium leading-tight tracking-[-0.01em] text-graphite">{focus.name}</p>
            <p className="mt-1 text-[0.875rem] leading-snug text-stone">{focus.caption}</p>
            <p className="mt-1.5 text-[0.8125rem] font-medium text-steel tnum">{focus.meta}</p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="font-display text-[1.25rem] font-medium leading-tight tracking-[-0.01em] text-graphite">{pick}</p>
            <p id="board-hint" className="mt-1 max-w-sm text-[0.875rem] leading-snug text-stone">
              {hint}
            </p>
          </div>
        )}
        {focus ? (
          <Link href={focus.href} className="btn btn-ghost hidden min-h-10 shrink-0 whitespace-nowrap bg-white px-4 text-[0.875rem] sm:inline-flex">
            {more} <span className="arrow">→</span>
          </Link>
        ) : null}
      </div>

      {/* sahne */}
      <div className="relative">
        <div className={`transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`} aria-hidden={ready || undefined}>
          {children}
        </div>
        <canvas
          ref={canvas}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />
        {/* görünüm + röntgen kontrolleri */}
        <div
          className={`absolute inset-x-3 top-3 flex flex-wrap items-center justify-between gap-2 transition-opacity duration-500 sm:inset-x-4 sm:top-4 ${
            ready ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div role="group" aria-label={labels.viewLabel} className="flex rounded-full border border-line bg-white/90 p-0.5 shadow-[0_6px_18px_-12px_rgb(16_35_60/0.35)]">
            {(Object.keys(labels.views) as View[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => {
                  setView(v);
                  api.current?.setView(v);
                }}
                className={`rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors duration-300 ${
                  view === v ? "bg-steel text-white" : "text-stone hover:text-steel"
                }`}
              >
                {labels.views[v]}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={xray}
            onClick={() => {
              setXray(!xray);
              api.current?.setXray(!xray);
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.75rem] font-medium shadow-[0_6px_18px_-12px_rgb(16_35_60/0.35)] transition-colors duration-300 ${
              xray ? "border-steel bg-steel text-white" : "border-line bg-white/90 text-stone hover:text-steel"
            }`}
          >
            <span aria-hidden="true" className={`relative inline-block h-3.5 w-6 rounded-full transition-colors ${xray ? "bg-white/35" : "bg-line-dark"}`}>
              <span className={`absolute top-0.5 size-2.5 rounded-full bg-white transition-[left] duration-300 ${xray ? "left-3" : "left-0.5"}`} />
            </span>
            {labels.xray}
          </button>
        </div>
        <div
          className={`pointer-events-none absolute bottom-4 left-5 text-[0.8125rem] transition-opacity duration-300 sm:left-6 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          {info ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium text-graphite shadow-[0_6px_18px_-10px_rgb(16_35_60/0.4)]">
              {describe(info)}
            </span>
          ) : (
            <span className="text-stone">{labels.drag}</span>
          )}
        </div>
      </div>
    </div>
  );
}
