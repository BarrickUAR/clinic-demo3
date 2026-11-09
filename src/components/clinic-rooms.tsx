"use client";

import { useId, useState } from "react";

type Room = { id: string; name: string; short: string; desc: string; specs: string[] };

/**
 * Klinik alanları: solda alan listesi (sekme), sağda büyük fotoğraf.
 * Fotoğraflar sunucuda render edilip `photos` ile gelir; burada yalnızca görünürlük değişir.
 */
export function ClinicRooms({
  rooms,
  photos,
  label,
  floor,
}: {
  rooms: Room[];
  photos: React.ReactNode[];
  label: string;
  floor: string;
}) {
  const [active, setActive] = useState(0);
  const uid = useId();

  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (active + d + rooms.length) % rooms.length;
    setActive(n);
    document.getElementById(`${uid}-t${n}`)?.focus();
  };

  return (
    <div className="grid-12 gap-y-8">
      {/* alan listesi */}
      <div className="col-span-12 lg:col-span-5">
        <div role="tablist" aria-label={label} aria-orientation="vertical" onKeyDown={onKey} className="border-t border-line">
          {rooms.map((r, i) => {
            const on = i === active;
            return (
              <div key={r.id} className={`room-row relative border-b border-line ${on ? "is-on" : ""}`}>
                <span aria-hidden="true" className="room-bar absolute inset-y-0 left-0 w-[3px] bg-steel" />
                <button
                  id={`${uid}-t${i}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls={`${uid}-p`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  className="group flex w-full items-center justify-between gap-6 py-4 pl-6 pr-1 text-left"
                >
                  <span className="min-w-0">
                    <span className={`block font-display text-[1.375rem] font-medium leading-tight tracking-[-0.015em] transition-colors duration-300 ${on ? "text-steel" : "text-graphite group-hover:text-steel"}`}>
                      {r.name}
                    </span>
                    <span className="mt-1 block text-[0.875rem] text-stone">{r.short}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                      on ? "-rotate-45 border-steel bg-steel text-white" : "border-line text-stone"
                    }`}
                  >
                    →
                  </span>
                </button>
                {/* açılan detay */}
                <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="pb-5 pl-6 pr-4">
                      <p className="max-w-md text-[0.9375rem] leading-relaxed text-graphite/85">{r.desc}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {r.specs.map((s) => (
                          <li key={s} className="inline-flex items-center gap-2 rounded-full border border-ice bg-ice-2 px-3 py-1.5 text-[0.8125rem] text-steel-deep">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* fotoğraf sahnesi */}
      <div className="col-span-12 lg:col-span-7">
        <div id={`${uid}-p`} role="tabpanel" aria-labelledby={`${uid}-t${active}`} className="relative aspect-[4/3] overflow-hidden bg-ice-2 lg:aspect-auto lg:h-full lg:min-h-[440px]">
          {photos.map((p, i) => (
            <div
              key={rooms[i]?.id ?? i}
              aria-hidden={i !== active}
              className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] ${
                i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            >
              {p}
            </div>
          ))}
          {/* alt bilgi şeridi */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 sm:inset-x-4 sm:bottom-4">
            <span key={active} className="room-tag inline-flex items-center gap-2.5 bg-white px-3.5 py-2 text-[0.875rem] font-medium text-graphite shadow-[0_10px_30px_-18px_rgb(16_35_60/0.6)]">
              <span className="text-steel">{floor}</span>
              <span aria-hidden="true" className="h-3.5 w-px bg-line" />
              {rooms[active]?.name}
            </span>
            <span className="bg-white/90 px-3 py-2 text-[0.8125rem] font-medium text-stone tnum" aria-hidden="true">
              <span className="text-steel">{active + 1}</span> / {rooms.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
