import Link from "next/link";
import { getDict } from "@/content/dict";
import { site, type Locale } from "@/content/site";
import { href } from "@/lib/routes";
import { HoursList } from "./hours";
import { LocationMap } from "./location-map";
import { LogoMark } from "./logo";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const f = t.footer;
  const year = site.established; // statik; yıl bilgisi build'e bağlı kalmasın
  const nav = [
    [href("treatments", locale), t.nav.treatments],
    [href("dentist", locale), t.nav.dentist],
    [href("clinic", locale), t.nav.clinic],
    [href("contact", locale), t.nav.contact],
    [href("privacy", locale), t.privacyPage.title],
  ] as const;
  const head = "mb-3 text-[0.8125rem] font-medium text-steel";

  return (
    <footer className="border-t border-line bg-ice-2 pb-24 text-graphite lg:pb-0">
      <div className="shell pt-12 lg:pt-14">
        <div className="grid-12 gap-y-10">
          {/* marka + iletişim */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <Link href={href("home", locale)} aria-label={site.name[locale]} className="inline-flex items-center gap-2.5 text-graphite">
              <LogoMark size={28} className="text-steel" />
              <span className="font-display text-[1.375rem] font-medium tracking-[-0.02em]">{site.brand}</span>
            </Link>
            <p className="mt-3 max-w-xs text-[0.9375rem] leading-relaxed text-stone">{f.tagline}</p>
            <ul className="mt-5 space-y-1.5 text-[0.9375rem] tnum">
              <li>
                <a href={`tel:${site.phone.href}`} className="link-u font-medium text-steel">
                  {site.phone.display}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${site.whatsapp.href}`} rel="noopener" target="_blank" className="link-u">
                  WhatsApp · {site.whatsapp.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="link-u">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          {/* sayfalar */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-2">
            <h2 className={head}>{f.nav}</h2>
            <ul className="space-y-1.5 text-[0.9375rem]">
              {nav.map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="link-u">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* saatler */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-2">
            <h2 className={head}>{f.hours}</h2>
            <HoursList locale={locale} className="text-[0.875rem] text-graphite" dark />
          </div>

          {/* konum kartı */}
          <div className="col-span-12 lg:col-span-5">
            <h2 className={head}>{f.find}</h2>
            <div className="grid overflow-hidden border border-line bg-white sm:grid-cols-[0.85fr_1.15fr]">
              <div className="border-b border-line sm:border-b-0 sm:border-r [&>a]:aspect-auto! [&>a]:h-full [&>a]:min-h-[190px] [&>a]:border-0">
                <LocationMap locale={locale} label={t.home.bandMap} />
              </div>
              <div className="flex flex-col px-4 py-3.5">
                <address className="text-[0.9375rem] font-medium not-italic leading-snug text-graphite">
                  {site.address.street}
                  <span className="block font-normal text-stone">
                    {site.address.postalCode} {site.address.district} / {site.address.city}
                  </span>
                </address>
                <dl className="mt-3 space-y-1 border-t border-line pt-3 text-[0.8125rem] leading-snug">
                  {f.reach.map(([k, v]) => (
                    <div key={k}>
                      <dt className="inline font-medium text-steel">{k}: </dt>
                      <dd className="inline text-graphite">{v}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`}
                  target="_blank"
                  rel="noopener"
                  className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[0.875rem] font-medium text-steel hover:text-steel-deep"
                >
                  {f.directions} <span className="arrow">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line py-5 text-[0.8125rem] text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year}–2026 {site.name[locale]}. {f.rights} <span className="block sm:inline">{f.demo}</span>
          </p>
          <p>
            {f.credit}:{" "}
            <a href={site.agency.url} target="_blank" rel="noopener" className="link-u text-steel">
              {site.agency.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
