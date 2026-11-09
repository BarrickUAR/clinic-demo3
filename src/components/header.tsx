import Link from "next/link";
import { getDict } from "@/content/dict";
import { site, type Locale } from "@/content/site";
import { href } from "@/lib/routes";
import { LiveStatus } from "./live-status";
import { LocaleSwitch } from "./locale-switch";
import { MegaMenu } from "./mega-menu";
import { Photo } from "./ui";
import { treatments } from "@/content/treatments";
import { treatmentHref } from "@/lib/routes";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export function Header({ locale }: { locale: Locale }) {
  const d = getDict(locale).nav;
  const items = [
    { href: href("treatments", locale), label: d.treatments },
    { href: href("dentist", locale), label: d.dentist },
    { href: href("clinic", locale), label: d.clinic },
    { href: href("contact", locale), label: d.contact },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-line bg-porcelain/95 backdrop-blur-[6px] supports-[backdrop-filter]:bg-porcelain/85"
      style={{ viewTransitionName: "site-header" }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[80] focus:bg-graphite focus:px-4 focus:py-2 focus:text-porcelain"
      >
        {d.skip}
      </a>
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href={href("home", locale)} aria-label={`${site.name[locale]} — ${d.home}`} className="shrink-0">
          <Logo locale={locale} />
        </Link>

        <nav aria-label={locale === "tr" ? "Ana menü" : "Main navigation"} className="hidden self-stretch lg:flex lg:items-center">
          <ul className="flex items-center gap-8 text-[0.9375rem]">
            <MegaMenu
              label={d.treatments}
              href={items[0].href}
              items={treatments.map((x) => ({
                id: x.id,
                name: x.name[locale],
                short: x.short[locale],
                meta: `${x.duration[locale]} · ${x.sessions[locale]}`,
                href: treatmentHref(x.slug[locale], locale),
              }))}
              photos={treatments.map((x, i) => (
                <Photo key={x.id} k={x.photo} locale={locale} reveal={false} sizes={i === 0 ? "560px" : "96px"} className="h-full w-full" />
              ))}
              intro={{ title: d.treatments, body: d.megaBody, all: d.megaAll, book: d.book, bookHref: href("contact", locale) }}
            />
            {items.slice(1).map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="link-u py-1">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-5">
          <LocaleSwitch locale={locale} label={d.toLang} className="hidden sm:inline-flex" />
          <Link href={href("contact", locale)} className="btn btn-primary hidden min-h-11 whitespace-nowrap lg:inline-flex">
            {d.book} <span className="arrow">→</span>
          </Link>
          <MobileMenu
            items={items}
            labels={{ menu: d.menu, close: d.close }}
            cta={{ href: href("contact", locale), label: d.book }}
            footer={
              <div className="flex items-center justify-between gap-4">
                <LiveStatus locale={locale} />
                <LocaleSwitch locale={locale} label={d.toLang} />
              </div>
            }
          />
        </div>
      </div>
    </header>
  );
}
