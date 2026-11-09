import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { photos, type Locale, type PhotoKey } from "@/content/site";

/** Bölüm üst başlığı (eyebrow) */
export function Eyebrow({ label, className = "" }: { label: string; className?: string }) {
  return (
    <p className={`text-[0.875rem] font-medium tracking-[0.01em] text-steel ${className}`}>
      {label}
    </p>
  );
}

export function SectionHead({
  label,
  title,
  aside,
  as: As = "h2",
}: {
  label: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="grid-12 gap-y-5 pb-10 lg:pb-14">
      <div className="col-span-12 lg:col-span-8">
        <Eyebrow label={label} />
        <As data-reveal className={`mt-5 max-w-3xl ${As === "h1" ? "t-h1" : "t-h2"}`}>
          {title}
        </As>
      </div>
      {aside ? (
        <div data-reveal style={{ "--d": "120ms" } as React.CSSProperties} className="col-span-12 self-end lg:col-span-4 lg:justify-self-end">
          {aside}
        </div>
      ) : null}
    </div>
  );
}

export function Photo({
  k,
  locale,
  sizes,
  priority = false,
  className = "",
  reveal = true,
  ratio,
}: {
  k: PhotoKey;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  className?: string;
  reveal?: boolean;
  ratio?: string;
}) {
  const p = photos[k];
  return (
    <div
      data-reveal={reveal ? "img" : undefined}
      className={`img-ph relative overflow-hidden ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <Image
        src={`${p.src}?auto=format&fit=crop&w=1600&q=80`}
        alt={p.alt[locale]}
        fill
        sizes={sizes}
        priority={priority}
        quality={70}
        className="object-cover"
      />
    </div>
  );
}

export function ArrowLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-3 text-[0.9375rem] font-medium ${className}`}>
      <span className="link-u">{children}</span>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

/** Sayfa içeriği geçiş animasyonu (React ViewTransition). Header sabit kalır. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
