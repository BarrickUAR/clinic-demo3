import { getDict } from "@/content/dict";
import type { Locale } from "@/content/site";

export function HoursList({ locale, className = "", dark = false }: { locale: Locale; className?: string; dark?: boolean }) {
  const h = getDict(locale).hours;
  const rows: [string, string][] = [
    [h.weekdays, "09:00 – 19:00"],
    [h.saturday, "10:00 – 16:00"],
    [h.sunday, h.closed],
  ];
  return (
    <dl className={`tnum ${className}`}>
      {rows.map(([k, v]) => (
        <div key={k} className={`flex justify-between gap-6 py-1 ${dark ? "" : "rule-b last:border-0"}`}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
