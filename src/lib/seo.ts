import type { Metadata } from "next";
import { getDict } from "@/content/dict";
import { photos, site, type Locale } from "@/content/site";
import { treatments, type Treatment } from "@/content/treatments";
import { routes, treatmentHref, type RouteKey } from "./routes";

export const abs = (path: string) => new URL(path, site.url).toString();

type Alt = { tr: string; en: string };

export function pageMeta({
  locale,
  title,
  description,
  paths,
  absoluteTitle = false,
  image,
}: {
  locale: Locale;
  title: string;
  description: string;
  paths: Alt;
  absoluteTitle?: boolean;
  image?: string;
}): Metadata {
  const path = paths[locale];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
      languages: { "tr-TR": paths.tr, "en-US": paths.en, "x-default": paths.tr },
    },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      siteName: site.name[locale],
      locale: locale === "tr" ? "tr_TR" : "en_US",
      alternateLocale: locale === "tr" ? ["en_US"] : ["tr_TR"],
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const routeMeta = (key: RouteKey, locale: Locale, title: string, description: string, absoluteTitle = false) =>
  pageMeta({ locale, title, description, paths: routes[key], absoluteTitle });

export function baseMetadata(locale: Locale): Metadata {
  const t = getDict(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.home.metaTitle, template: `%s · ${site.name[locale]}` },
    description: t.home.metaDesc,
    applicationName: site.name[locale],
    authors: [{ name: site.agency.name, url: site.agency.url }],
    creator: site.agency.name,
    formatDetection: { telephone: true, address: true, email: true },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    category: "health",
  };
}

/* ───────────── JSON-LD ───────────── */

const clinicId = abs("/#clinic");
const dentistId = abs("/#dentist");

export function clinicLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["Dentist", "MedicalClinic"],
    "@id": clinicId,
    name: site.name[locale],
    url: abs(routes.home[locale]),
    image: `${photos.room.src}?w=1200&q=80`,
    logo: abs("/icon.svg"),
    telephone: site.phone.href,
    email: site.email,
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    paymentAccepted: "Cash, Credit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.district,
      addressRegion: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "19:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "10:00", closes: "16:00" },
    ],
    medicalSpecialty: "Dentistry",
    availableService: treatments.map((t) => ({
      "@type": "MedicalProcedure",
      name: t.name[locale],
      url: abs(treatmentHref(t.slug[locale], locale)),
    })),
    employee: { "@id": dentistId },
    inLanguage: locale === "tr" ? "tr-TR" : "en-US",
    foundingDate: String(site.established),
  };
}

export function dentistLd(locale: Locale) {
  const d = getDict(locale).dentist;
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": dentistId,
    name: site.dentist.name,
    givenName: site.dentist.givenName,
    familyName: site.dentist.familyName,
    description: d.intro,
    medicalSpecialty: "Dentistry",
    image: `${photos.dentist.src}?w=800&q=80`,
    url: abs(routes.dentist[locale]),
    worksFor: { "@id": clinicId },
    alumniOf: { "@type": "CollegeOrUniversity", name: "İstanbul Üniversitesi Diş Hekimliği Fakültesi" },
    knowsLanguage: ["tr", "en"],
    memberOf: { "@type": "Organization", name: "Türk Diş Hekimleri Birliği" },
  };
}

export function procedureLd(t: Treatment, locale: Locale) {
  const b = t.body[locale];
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: t.name[locale],
    description: t.short[locale],
    url: abs(treatmentHref(t.slug[locale], locale)),
    procedureType: "https://schema.org/TherapeuticProcedure",
    howPerformed: b.steps.map((s) => `${s.t}: ${s.d}`).join(" "),
    followup: b.after.join(" "),
    image: `${photos[t.photo].src}?w=1200&q=80`,
    provider: { "@id": clinicId },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function websiteLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs("/#website"),
    url: abs(routes.home[locale]),
    name: site.name[locale],
    inLanguage: locale === "tr" ? "tr-TR" : "en-US",
    publisher: { "@id": clinicId },
  };
}
