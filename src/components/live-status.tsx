"use client";

import { useEffect, useState } from "react";
import { site, type Locale } from "@/content/site";

const S = {
  tr: {
    open: (t: string) => `Şu an açık · ${t}'a kadar`,
    closed: (d: string, t: string) => `Kapalı · ${d} ${t}'da açılıyor`,
    today: "bugün",
    tomorrow: "yarın",
    days: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
    idle: "Pzt–Cmt açık",
  },
  en: {
    open: (t: string) => `Open now · until ${t}`,
    closed: (d: string, t: string) => `Closed · opens ${d} at ${t}`,
    today: "today",
    tomorrow: "tomorrow",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    idle: "Open Mon–Sat",
  },
};

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function compute(locale: Locale) {
  const s = S[locale];
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: site.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.find((p) => p.type === "weekday")!.value);
  const now = Number(parts.find((p) => p.type === "hour")!.value) * 60 + Number(parts.find((p) => p.type === "minute")!.value);
  const slot = (d: number) => site.hours.find((h) => (h.days as readonly number[]).includes(d));

  const today = slot(wd);
  if (today && now >= toMin(today.open) && now < toMin(today.close)) return { open: true, text: s.open(today.close) };
  for (let i = 0; i < 7; i++) {
    const d = (wd + i) % 7;
    const sl = slot(d);
    if (!sl) continue;
    if (i === 0 && now >= toMin(sl.open)) continue;
    const label = i === 0 ? s.today : i === 1 ? s.tomorrow : s.days[d];
    return { open: false, text: s.closed(label, sl.open) };
  }
  return { open: false, text: s.idle };
}

export function LiveStatus({ locale, className = "" }: { locale: Locale; className?: string }) {
  const [st, setSt] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    const tick = () => setSt(compute(locale));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [locale]);

  return (
    <span className={`inline-flex items-center gap-2 text-[0.8125rem] tnum text-stone ${className}`} aria-live="polite">
      <span className="min-w-[13.5rem]">{st ? st.text : S[locale].idle}</span>
    </span>
  );
}
