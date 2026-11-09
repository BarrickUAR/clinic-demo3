import Link from "next/link";
import { getDict } from "@/content/dict";
import { site, type Locale } from "@/content/site";
import { href } from "@/lib/routes";
import { LottieIcon } from "./lottie-icon";
import { Photo } from "./ui";

/** Kesikli, kıvrık bağlantı oku (dekoratif). */
function Curve({ d, className }: { d: string; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 120" fill="none" className={`cta-curve pointer-events-none absolute hidden lg:block ${className ?? ""}`}>
      <path d={d} stroke="#1F6FD1" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="4 6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Randevu CTA'sı: buz mavisi panel, ortada başlık + adım kartı,
 * iki yanda kesikli oklarla bağlanan yüzen kartlar, altta butonlar.
 */
export function CtaBand({ locale }: { locale: Locale }) {
  const h = getDict(locale).home;

  return (
    <section className="py-20 lg:py-28" aria-labelledby="band-title">
      <div className="shell">
        <div data-reveal className="cta-panel relative overflow-hidden border border-ice bg-ice-2 px-5 pb-12 pt-14 sm:px-10 lg:px-16 lg:pb-16 lg:pt-20">
          {/* başlık */}
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <p className="text-[0.875rem] font-medium text-steel">{h.bandLabel}</p>
            <h2 id="band-title" className="t-h1 mt-4 text-[clamp(2.25rem,4.4vw,3.75rem)]!">
              {h.bandTitle}
            </h2>
            <p className="t-lead mx-auto mt-5 max-w-lg">{h.bandBody}</p>
          </div>

          {/* sahne */}
          <div className="relative mx-auto mt-12 max-w-5xl lg:mt-14">
            {/* sol: hekim kartı */}
            <figure className="cta-float cta-float-l absolute left-0 top-6 z-0 hidden w-[200px] -rotate-3 border border-line bg-white p-2 shadow-[0_24px_50px_-30px_rgb(16_35_60/0.55)] lg:block">
              <Photo k="consult" locale={locale} reveal={false} sizes="200px" className="aspect-[4/3]" />
              <figcaption className="px-1.5 pb-1 pt-2.5">
                <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-mist">{h.bandHekim}</span>
                <span className="block text-[0.9375rem] font-medium text-graphite">{site.dentist.name}</span>
              </figcaption>
            </figure>
            <Curve d="M8 10 C 60 110, 140 118, 196 70" className="left-[150px] top-[150px] w-[190px]" />

            {/* sağ: sıradaki uygun saat */}
            <div className="cta-float cta-float-r absolute right-0 top-0 z-0 hidden w-[210px] rotate-3 border border-line bg-white p-4 shadow-[0_24px_50px_-30px_rgb(16_35_60/0.55)] lg:block">
              <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-mist">{h.bandSlotLabel}</span>
              <span className="mt-2 block font-display text-[1.375rem] font-medium tracking-[-0.02em] text-steel tnum">{h.bandSlot}</span>
              <span className="mt-3 grid grid-cols-6 gap-1" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i} className={`h-5 ${i === 4 ? "bg-steel" : [1, 2, 7, 9].includes(i) ? "bg-line" : "bg-ice"}`} />
                ))}
              </span>
            </div>
            <Curve d="M194 12 C 150 100, 70 116, 4 64" className="right-[160px] top-[110px] w-[190px]" />

            {/* orta: adım kartı */}
            <div className="relative z-10 mx-auto max-w-sm border border-line bg-white shadow-[0_30px_60px_-36px_rgb(16_35_60/0.55)]">
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <span className="text-[0.875rem] font-medium text-graphite">{h.bandFlow}</span>
                <span className="text-[0.75rem] font-medium text-steel tnum">2 / 3</span>
              </div>
              <ol className="px-5 py-2">
                {h.bandSteps.map((step, i) => {
                  const done = i < 2;
                  return (
                    <li key={step} className="cta-step flex items-center gap-3 border-b border-line py-3 text-[0.9375rem] last:border-0" style={{ "--d": `${300 + i * 260}ms` } as React.CSSProperties}>
                      <span
                        aria-hidden="true"
                        className={`grid size-6 shrink-0 place-items-center rounded-full ${done ? "bg-steel text-white" : "border border-dashed border-steel/60"}`}
                      >
                        {done ? (
                          <svg width="12" height="12" viewBox="0 0 12 12">
                            <path d="m2.8 6.2 2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span className="cta-spin size-3 rounded-full border-[1.5px] border-steel/25 border-t-steel" />
                        )}
                      </span>
                      <span className={done ? "text-graphite" : "font-medium text-steel"}>{step}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* butonlar */}
          <div className="relative z-10 mt-10 flex flex-col items-center gap-4 lg:mt-12">
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={href("contact", locale)} className="btn btn-primary min-w-52">
                {h.bandForm} <span className="arrow">→</span>
              </Link>
              <a href={`tel:${site.phone.href}`} className="btn btn-ghost min-w-52 bg-white tnum">
                {site.phone.display}
                <LottieIcon name="phone" size={22} mode="hover" color="#10233C" />
              </a>
              <a href={`https://wa.me/${site.whatsapp.href}`} target="_blank" rel="noopener" className="btn btn-ghost bg-white">
                WhatsApp
                <LottieIcon name="whatsapp" size={24} mode="hover" color="#10233C" />
              </a>
            </div>
            <p className="text-[0.8125rem] text-stone">{h.bandNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
