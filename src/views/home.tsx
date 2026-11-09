import Link from "next/link";
import { Faq } from "@/components/faq";
import { HeroVideo } from "@/components/hero-video";
import { LottieIcon } from "@/components/lottie-icon";
import { ClinicRooms } from "@/components/clinic-rooms";
import { CtaBand } from "@/components/cta-band";
import { QuickBooking } from "@/components/quick-booking";
import { TreatmentBoard } from "@/components/treatment-board";
import { ArrowLink, Eyebrow, JsonLd, PageTransition, Photo, SectionHead } from "@/components/ui";
import { getDict } from "@/content/dict";
import { site, type Locale, type PhotoKey } from "@/content/site";
import { treatments } from "@/content/treatments";
import { href } from "@/lib/routes";
import { clinicLd, dentistLd, faqLd, websiteLd } from "@/lib/seo";

/** Pexels — "Video of a Dental Clinic" (Pavel Danilyuk), Pexels lisansı ile ücretsiz. */
const heroVideo = {
  poster: "https://images.pexels.com/videos/6763242/aching-tooth-clinic-computer-dentist-6763242.jpeg?auto=compress&cs=tinysrgb&w=1600",
  sources: {
    sd: "https://videos.pexels.com/video-files/6763242/6763242-sd_960_540_25fps.mp4",
    hd: "https://videos.pexels.com/video-files/6763242/6763242-hd_1280_720_25fps.mp4",
  },
};

export function HomeView({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const h = t.home;

  return (
    <PageTransition>
      <JsonLd data={[websiteLd(locale), clinicLd(locale), dentistLd(locale), faqLd(t.faq)]} />

      {/* ───────── Hero ───────── */}
      <section
        aria-labelledby="hero-title"
        className="relative isolate flex min-h-[calc(100svh-var(--header-h))] flex-col overflow-hidden lg:max-h-[960px]"
      >
        {/* tam ekran arka plan videosu */}
        <div className="absolute inset-0 -z-10">
          <HeroVideo
            poster={heroVideo.poster}
            sources={heroVideo.sources}
            alt={h.video.alt}
            labels={{ pause: h.video.pause, play: h.video.play }}
          />
          {/* okunurluk için soldan sağa açılan düz beyaz örtü (ışık/glow değil) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-white/80 md:bg-transparent md:bg-[linear-gradient(90deg,rgb(255_255_255/0.94)_0%,rgb(255_255_255/0.86)_38%,rgb(255_255_255/0.35)_68%,rgb(255_255_255/0.05)_100%)]"
          />
        </div>

        <div className="pointer-events-none flex flex-1 flex-col justify-center pb-10 pt-14 lg:pb-12 lg:pt-16">
          <div className="shell grid-12">
            <div className="pointer-events-auto col-span-12 md:col-span-8 lg:col-span-6">
              <h1 id="hero-title" className="t-sign line-in text-[clamp(2.75rem,5.4vw,5.5rem)]!">
                {h.title.map((line, i) => (
                  <span key={line} style={{ "--i": i } as React.CSSProperties} className={i === 1 ? "text-steel" : undefined}>
                    {line}
                  </span>
                ))}
              </h1>
              <p className="t-lead mt-8 max-w-lg lg:mt-10">{h.lead}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href={href("contact", locale)} className="btn btn-primary min-w-48">
                  {h.ctaBook} <span className="arrow">→</span>
                </Link>
                <a href={`tel:${site.phone.href}`} className="btn btn-ghost min-w-48 bg-white/70">
                  {h.ctaCall}
                  <LottieIcon name="phone" size={22} mode="hover" color="#10233C" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* yatay hızlı randevu — hero'nun alt kenarında */}
        <div className="shell pb-8 lg:pb-10">
          <QuickBooking
            s={h.quick}
            locale={locale}
            phone={site.phone}
            privacyHref={href("privacy", locale)}
            options={treatments.map((x) => ({ id: x.id, name: x.name[locale] }))}
          />
        </div>
      </section>

      {/* ───────── Tedavi rehberi ───────── */}
      <section className="shell py-24 lg:py-32" aria-labelledby="board-title">
        <SectionHead
          label={h.boardLabel}
          title={<span id="board-title">{h.boardTitle}</span>}
          aside={<ArrowLink href={href("treatments", locale)}>{h.boardAll}</ArrowLink>}
        />
        <TreatmentBoard locale={locale} />
      </section>

      {/* ───────── Hekim ───────── */}
      <section className="bg-surface py-24 lg:py-32" aria-labelledby="dentist-title">
        <div className="shell grid-12 items-center gap-y-12">
          <div className="col-span-12 sm:col-span-8 lg:col-span-5">
            <Photo k="dentist" locale={locale} sizes="(min-width: 1024px) 40vw, 90vw" ratio="4 / 5" />
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <Eyebrow label={h.dentistLabel} />
            <h2 id="dentist-title" data-reveal className="t-h2 mt-6">
              {h.dentistTitle}
            </h2>
            <p data-reveal className="t-lead mt-6 max-w-xl">
              {h.dentistBody}
            </p>
            <dl className="mt-10 rule-t">
              {t.dentist.timeline.slice(0, 3).map(([y, d], i) => (
                <div key={y} data-reveal style={{ "--d": `${i * 60}ms` } as React.CSSProperties} className="grid grid-cols-[7rem_1fr] gap-4 rule-b py-4 text-[0.9375rem]">
                  <dt className="font-medium text-steel tnum">{y}</dt>
                  <dd className="text-graphite">{d}</dd>
                </div>
              ))}
            </dl>
            <ArrowLink href={href("dentist", locale)} className="mt-8 text-steel">
              {h.dentistLink}
            </ArrowLink>
          </div>
        </div>
      </section>

      {/* ───────── Klinik ───────── */}
      <section className="py-24 lg:py-32" aria-labelledby="clinic-title">
        <div className="shell">
          <SectionHead
            label={h.clinicLabel}
            title={<span id="clinic-title">{h.clinicTitle}</span>}
            aside={<ArrowLink href={href("clinic", locale)}>{h.clinicLink}</ArrowLink>}
          />
        </div>
        <div className="shell">
          <p data-reveal className="t-lead -mt-4 mb-12 max-w-2xl lg:-mt-6 lg:mb-14">
            {h.clinicLead}
          </p>
          <ClinicRooms
            rooms={h.clinicRooms}
            label={h.clinicPick}
            floor={h.clinicFloor}
            photos={h.clinicRooms.map((r) => (
              <Photo key={r.id} k={r.id as PhotoKey} locale={locale} reveal={false} sizes="(min-width: 1024px) 58vw, 92vw" className="h-full w-full" />
            ))}
          />

          {/* sayılar */}
          <dl className="mt-12 grid grid-cols-2 border-y border-line lg:grid-cols-4">
            {h.clinicStats.map(([v, k], i) => (
              <div
                key={k}
                data-reveal
                style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
                className={`flex flex-col gap-1.5 px-1 py-5 sm:px-6 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
              >
                <dt className="order-2 text-[0.875rem] leading-snug text-stone">{k}</dt>
                <dd className="order-1 font-display text-[clamp(1.75rem,2.6vw,2.375rem)] font-medium leading-none tracking-[-0.03em] text-steel tnum">{v}</dd>
              </div>
            ))}
          </dl>

        </div>
      </section>

      {/* ───────── İlk ziyaret ───────── */}
      <section className="bg-ice-2 py-24 lg:py-32" aria-labelledby="visit-title">
        <div className="shell">
          <SectionHead label={h.visitLabel} title={<span id="visit-title">{h.visitTitle}</span>} />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {h.visit.map(([time, title, desc], i) => (
              <li key={title} data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties} className="flex flex-col border border-line bg-white p-6 lg:p-7">
                <span className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-full bg-ice font-medium text-steel tnum">{i + 1}</span>
                  <span className="text-[0.8125rem] font-medium text-stone tnum">{time}</span>
                </span>
                <span className="t-h3 mt-8">{title}</span>
                <span className="mt-3 text-[0.9375rem] leading-relaxed text-stone">{desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── SSS ───────── */}
      <section className="shell py-24 lg:py-32" aria-labelledby="faq-title">
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <Eyebrow label={h.faqLabel} />
            <h2 id="faq-title" data-reveal className="t-h2 mt-5">
              {h.faqTitle}
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <Faq items={t.faq} name="home-faq" />
          </div>
        </div>
      </section>

      {/* ───────── Randevu CTA ───────── */}
      <CtaBand locale={locale} />
    </PageTransition>
  );
}
