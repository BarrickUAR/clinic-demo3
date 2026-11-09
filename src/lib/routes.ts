import type { Locale } from "@/content/site";
import { treatments } from "@/content/treatments";

export const routes = {
  home: { tr: "/", en: "/en" },
  dentist: { tr: "/hekimimiz", en: "/en/dentist" },
  treatments: { tr: "/tedaviler", en: "/en/treatments" },
  clinic: { tr: "/klinik", en: "/en/clinic" },
  contact: { tr: "/iletisim", en: "/en/contact" },
  privacy: { tr: "/kvkk", en: "/en/privacy" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

export const href = (key: RouteKey, locale: Locale) => routes[key][locale];

export const treatmentHref = (slug: string, locale: Locale) =>
  `${routes.treatments[locale]}/${slug}`;

/** Bir yoldaki karşılığı diğer dilde bulur (dil anahtarı için). */
export function counterpart(pathname: string): { locale: Locale; path: string } {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const from: Locale = clean === "/en" || clean.startsWith("/en/") ? "en" : "tr";
  const to: Locale = from === "tr" ? "en" : "tr";

  for (const key of Object.keys(routes) as RouteKey[]) {
    if (routes[key][from] === clean) return { locale: to, path: routes[key][to] };
  }
  const base = routes.treatments[from] + "/";
  if (clean.startsWith(base)) {
    const slug = clean.slice(base.length);
    const t = treatments.find((x) => x.slug[from] === slug);
    if (t) return { locale: to, path: treatmentHref(t.slug[to], to) };
  }
  return { locale: to, path: routes.home[to] };
}
