"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/content/site";
import { counterpart } from "@/lib/routes";

/**
 * TR/EN anahtarı — iki seçenekli segment; seçili dilin altındaki çelik mavi zemin kayar.
 * Diller ayrı root layout'larda olduğu için geçiş tam sayfa yüklemesiyle yapılır.
 */
export function LocaleSwitch({ locale, label, className = "" }: { locale: Locale; label: string; className?: string }) {
  const pathname = usePathname();
  const [cur, setCur] = useState<Locale>(locale);
  const target = counterpart(pathname);

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setCur(target.locale as Locale);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => window.location.assign(target.path), reduce ? 0 : 280);
  };

  return (
    <a
      href={target.path}
      hrefLang={target.locale}
      lang={target.locale}
      onClick={go}
      aria-label={label}
      className={`group relative inline-flex h-9 items-center rounded-full border border-line bg-white p-[3px] text-[0.75rem] font-semibold tracking-[0.04em] transition-colors hover:border-ice ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute bottom-[3px] top-[3px] w-[calc(50%-3px)] rounded-full bg-steel transition-[left] duration-300 ease-[cubic-bezier(.2,.7,.2,1)] ${
          cur === "tr" ? "left-[3px]" : "left-1/2"
        }`}
      />
      {(["tr", "en"] as const).map((l) => (
        <span
          key={l}
          aria-hidden="true"
          className={`relative z-10 grid h-full w-9 place-items-center rounded-full transition-colors duration-300 ${
            cur === l ? "text-white" : "text-stone group-hover:text-steel"
          }`}
        >
          {l.toUpperCase()}
        </span>
      ))}
    </a>
  );
}
