import { site, type Locale } from "@/content/site";
import { LottieIcon } from "./lottie-icon";

/**
 * Yönlendirme tabelası tarzı şematik konum haritası (inline SVG).
 * Harita iframe'i yüklenmez → sıfır üçüncü taraf istek, sıfır CLS.
 */
export function LocationMap({ locale, label }: { locale: Locale; label: string }) {
  const L = locale === "tr"
    ? { street: "TEŞVİKİYE CAD.", cross: "VALİKONAĞI CAD.", metro: "Osmanbey M2", park: "Maçka Parkı", walk: "6 dk" }
    : { street: "TEŞVİKİYE AVE.", cross: "VALİKONAĞI AVE.", metro: "Osmanbey M2", park: "Maçka Park", walk: "6 min" };

  return (
    <a
      href={site.mapsUrl}
      target="_blank"
      rel="noopener"
      className="group relative block aspect-[4/3] w-full overflow-hidden border border-line bg-[#EAF1F8]"
      aria-label={label}
    >
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g stroke="#DCE6EF" strokeWidth="1" fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={`h${i}`} d={`M-20 ${30 + i * 34} L420 ${10 + i * 34}`} />
          ))}
        </g>
        {/* ana caddeler */}
        <path d="M-20 196 L420 156" stroke="#FFFFFF" strokeWidth="14" fill="none" />
        <path d="M150 -20 L238 320" stroke="#FFFFFF" strokeWidth="10" fill="none" />
        {/* park */}
        <path d="M290 10 h110 v90 h-80 z" fill="#DCEBDF" />
        {/* yürüme rotası */}
        <path d="M86 268 L120 196 L206 182" stroke="#1F6FD1" strokeWidth="2" strokeDasharray="3 5" fill="none" className="transition-[stroke-dashoffset] duration-[1.4s] group-hover:[stroke-dashoffset:-48]" />
        {/* metro */}
        <g transform="translate(86 268)">
          <rect x="-9" y="-9" width="18" height="18" fill="#1F6FD1" />
          <text x="0" y="1" fill="#FFFFFF" fontSize="10" fontWeight="600" textAnchor="middle" dominantBaseline="central">M</text>
        </g>
        <g fill="#5F6B79" fontSize="8.5" letterSpacing="1.4">
          <text x="246" y="166" transform="rotate(-5.2 246 166)">{L.street}</text>
          <text x="196" y="40" transform="rotate(75.5 196 40)">{L.cross}</text>
          <text x="302" y="60">{L.park.toLocaleUpperCase(locale)}</text>
          <text x="104" y="286">{L.metro} · {L.walk}</text>
        </g>
      </svg>
      {/* konum işareti */}
      <span className="absolute left-[51.5%] top-[60.6%] flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <span className="flex items-center gap-2 whitespace-nowrap border border-line bg-porcelain py-1.5 pl-1.5 pr-3 shadow-[0_1px_0_rgb(27_36_48/0.04)] text-[0.8125rem] font-medium text-graphite">
          <LottieIcon name="location" size={24} mode="loop" color="#1F6FD1" />
          {site.brand} · {locale === "tr" ? "Kat 3" : "Floor 3"}
        </span>
        <span className="h-5 w-px bg-steel" />
      </span>
      <span className="absolute bottom-3 right-3 bg-porcelain px-3 py-1.5 text-[0.8125rem] font-medium text-graphite">
        {label} <span className="arrow">↗</span>
      </span>
    </a>
  );
}
