import type { Locale } from "@/content/site";
import { site } from "@/content/site";

/** Demo işaret: Logoipsum (logoipsum.com) #64, tek renk. */
export function LogoMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 0H16V12.0632C15.9663 14.2434 14.1885 16 12.0005 16H0V24H8.68629C10.808 24 12.8429 23.1571 14.3431 21.6569L21.6569 14.3431C23.1571 12.8429 24 10.808 24 8.68629V0Z" />
      <path d="M16 40H24V27.9368C24.0337 25.7566 25.8115 24 27.9995 24H40V16H31.3137C29.192 16 27.1571 16.8429 25.6569 18.3431L18.3431 25.6569C16.8429 27.1571 16 29.192 16 31.3137V40Z" />
    </svg>
  );
}

export function Logo({ locale, className = "" }: { locale: Locale; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={22} className="text-steel" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.375rem] font-semibold tracking-[-0.03em]">{site.brand}</span>
        <span className="t-code mt-1 text-[0.5625rem] tracking-[0.2em] text-stone">{site.descriptor[locale]}</span>
      </span>
    </span>
  );
}
