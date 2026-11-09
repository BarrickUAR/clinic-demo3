import Link from "next/link";
import { getDict } from "@/content/dict";
import { site, type Locale } from "@/content/site";
import { href } from "@/lib/routes";
import { LottieIcon } from "./lottie-icon";

/** Mobilde altta sabit, ince eylem çubuğu (yüzen balon yok). */
export function MobileBar({ locale }: { locale: Locale }) {
  const t = getDict(locale).mobileBar;
  const cell = "flex h-14 flex-1 items-center justify-center gap-2 text-[0.875rem] font-medium";
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-porcelain/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-[6px] lg:hidden">
      <a href={`tel:${site.phone.href}`} className={cell}>
        <LottieIcon name="phone" size={22} mode="hover" color="#10233C" />
        {t.call}
      </a>
      <a href={`https://wa.me/${site.whatsapp.href}`} target="_blank" rel="noopener" className={`${cell} border-x border-line`}>
        <LottieIcon name="whatsapp" size={22} mode="hover" color="#10233C" />
        {t.whatsapp}
      </a>
      <Link href={href("contact", locale)} className={`${cell} bg-steel text-white`}>
        {t.book} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
