import Link from "next/link";
import { getDict } from "@/content/dict";
import type { Locale } from "@/content/site";
import { treatments, type Zone } from "@/content/treatments";
import { treatmentHref } from "@/lib/routes";
import { Jaw3D } from "./jaw3d/jaw-3d";
import { Odontogram } from "./odontogram";

const jawCaptions: Record<"tr" | "en", Record<string, string>> = {
  tr: {
    exam: "Tüm dişler ve diş eti tek tek kontrol edilir",
    "root-canal": "Örnek: sol alt birinci büyük azı — kanal içi temizlenir",
    filling: "Örnek: sol alt ikinci küçük azı — çürük alınıp doldurulur",
    whitening: "Gülüşte görünen ön dişler bir iki ton açılır",
    zirconia: "Örnek: sağ alt birinci büyük azıya kaplama oturur",
    veneers: "Üst ön altı dişin ön yüzeyine ince lamina",
    gum: "Dişleri saran diş eti dokusu tedavi edilir",
    extraction: "Örnek: sol alt 20 yaş dişi",
  },
  en: {
    exam: "Every tooth and the gums are checked one by one",
    "root-canal": "Example: lower left first molar — the canal is cleaned",
    filling: "Example: lower left second premolar — decay removed and filled",
    whitening: "The front teeth you show when smiling, a shade or two lighter",
    zirconia: "Example: a crown seated on the lower right first molar",
    veneers: "Thin shells on the six upper front teeth",
    gum: "The gum tissue around the teeth is treated",
    extraction: "Example: lower left wisdom tooth",
  },
};

const jawLabels = {
  tr: {
    zones: { front: "Ön dişler", premolar: "Küçük azılar", molar: "Büyük azılar", gum: "Diş eti" },
    drag: "Sürükleyerek döndürün · bir dişin üzerine gelin",
    tooth: "Diş",
    upper: "Üst",
    lower: "Alt",
    right: "sağ",
    left: "sol",
    views: { front: "Ön", upper: "Üst çene", lower: "Alt çene", side: "Yan" },
    xray: "Röntgen",
    viewLabel: "Görünüm",
    kinds: { 1: "orta kesici", 2: "yan kesici", 3: "köpek dişi", 4: "1. küçük azı", 5: "2. küçük azı", 6: "1. büyük azı", 7: "2. büyük azı", 8: "20 yaş dişi" },
  },
  en: {
    zones: { front: "Front teeth", premolar: "Premolars", molar: "Molars", gum: "Gums" },
    drag: "Drag to rotate · hover a tooth",
    tooth: "Tooth",
    upper: "Upper",
    lower: "Lower",
    right: "right",
    left: "left",
    views: { front: "Front", upper: "Upper", lower: "Lower", side: "Side" },
    xray: "X-ray",
    viewLabel: "View",
    kinds: { 1: "central incisor", 2: "lateral incisor", 3: "canine", 4: "first premolar", 5: "second premolar", 6: "first molar", 7: "second molar", 8: "wisdom tooth" },
  },
};

/** Tedavi listesi + 3D çene. Satır hover/focus → çenede ilgili dişler gösterilir. */
export function TreatmentBoard({ locale }: { locale: Locale }) {
  const h = getDict(locale).home;
  const zones: Zone[] = ["front", "premolar", "molar", "gum"];

  return (
    <div className="board grid-12 gap-y-10">
      <div className="col-span-12 lg:col-span-7">
        <ol className="board-list grid gap-3 sm:grid-cols-2">
          {treatments.map((t, i) => (
            <li
              key={t.id}
              data-zones={t.zones.join(" ")}
              data-treatment={t.id}
              data-name={t.name[locale]}
              data-caption={jawCaptions[locale][t.id]}
              data-meta={`${t.duration[locale]} · ${t.sessions[locale]}`}
              data-href={treatmentHref(t.slug[locale], locale)}
              data-reveal
              style={{ "--d": `${i * 40}ms` } as React.CSSProperties}
              className="board-row relative h-full"
            >
              <Link
                href={treatmentHref(t.slug[locale], locale)}
                className="board-link relative flex h-full flex-col overflow-hidden border border-line bg-white p-5 lg:p-6"
              >
                <span aria-hidden="true" className="board-bar absolute inset-x-0 top-0 h-[3px] bg-steel" />
                <span className="flex items-start justify-between gap-4">
                  <span className="board-name t-h3 block text-[1.125rem]!">{t.name[locale]}</span>
                  <span aria-hidden="true" className="board-arrow -mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line text-stone">
                    →
                  </span>
                </span>
                <span className="mt-2 line-clamp-2 text-[0.875rem] leading-snug text-stone">{t.short[locale]}</span>
                <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-[0.8125rem]">
                  <span className="font-medium text-steel tnum">
                    {t.duration[locale]} · {t.sessions[locale]}
                  </span>
                  <span className="truncate text-right text-mist">{t.zones.length > 2 ? (locale === "tr" ? "Tüm ağız" : "Whole mouth") : t.zones.map((z) => h.zones[z]).join(", ")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <div className="overflow-hidden border border-line bg-ice-2">
            <Jaw3D labels={jawLabels[locale]} pick={h.boardPick} more={h.boardMore} hint={h.boardHint}>
              <div className="mx-auto max-w-[400px] px-6 py-8">
                <Odontogram
                  labels={{
                    upper: h.mapUpper.toLocaleUpperCase(locale),
                    lower: h.mapLower.toLocaleUpperCase(locale),
                    title: `${h.boardLabel} — ${zones.map((z) => h.zones[z]).join(", ")}`,
                  }}
                />
              </div>
            </Jaw3D>
            <ul className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4" aria-label={h.boardLabel}>
              {zones.map((z) => (
                <li key={z}>
                  <button
                    type="button"
                    data-zone={z}
                    aria-describedby="board-hint"
                    className="zone zone-chip flex w-full cursor-default items-center gap-2 bg-white px-4 py-3 text-left text-[0.875rem] text-graphite"
                  >
                    <span aria-hidden="true" className="chip-dot h-3.5 w-[3px] bg-line-dark" />
                    {h.zones[z]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
