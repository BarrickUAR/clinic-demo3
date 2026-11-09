"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { LottieIcon } from "./lottie-icon";

type Strings = {
  title: string;
  sub: string;
  orCall: string;
  treatment: string;
  any: string;
  day: string;
  today: string;
  tomorrow: string;
  time: string;
  times: string[];
  name: string;
  namePh: string;
  phone: string;
  phonePh: string;
  submit: string;
  consent: string;
  consentLink: string;
  perks: string[];
  success: string;
  successSub: string;
  summary: string;
  again: string;
  errName: string;
  errPhone: string;
};

type Props = {
  s: Strings;
  locale: "tr" | "en";
  options: { id: string; name: string }[];
  phone: { display: string; href: string };
  privacyHref: string;
};

/** 0532 555 01 47 biçimi */
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)].filter(Boolean).join(" ");
};

/** Önümüzdeki 6 açık gün (Pazar kapalı). İstemcide hesaplanır → hidrasyon farkı olmaz. */
function nextDays(locale: "tr" | "en", today: string, tomorrow: string) {
  const out: { value: string; label: string }[] = [];
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
  const d = new Date();
  for (let i = 0; out.length < 6 && i < 10; i++) {
    const x = new Date(d.getTime() + i * 86400000);
    if (x.getDay() === 0) continue;
    const label = i === 0 ? `${today} · ${fmt.format(x)}` : i === 1 ? `${tomorrow} · ${fmt.format(x)}` : fmt.format(x);
    out.push({ value: x.toISOString().slice(0, 10), label });
  }
  return out;
}

type Day = { value: string; label: string };
const EMPTY: Day[] = [];
const noop = () => () => {};
let cache: { key: string; days: Day[] } | null = null;
function cachedDays(locale: "tr" | "en", today: string, tomorrow: string) {
  const key = `${locale}|${new Date().toDateString()}`;
  if (cache?.key !== key) cache = { key, days: nextDays(locale, today, tomorrow) };
  return cache.days;
}

function Chevron() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-stone transition-transform duration-300 group-focus-within:rotate-180 group-focus-within:text-steel">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" className="shrink-0 text-steel">
      <circle cx="7" cy="7" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <path d="m4.3 7.2 1.8 1.8 3.6-3.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Hero altındaki yatay hızlı randevu formu (demo — veri gönderilmez). */
export function QuickBooking({ s, locale, options, phone, privacyHref }: Props) {
  const uid = useId();
  // gün listesi yalnızca istemcide hesaplanır (sunucuda boş) → hidrasyon farkı olmaz
  const days = useSyncExternalStore(noop, () => cachedDays(locale, s.today, s.tomorrow), () => EMPTY);
  const [tel, setTel] = useState("");
  const [sent, setSent] = useState<null | { treatment: string; day: string; time: string; name: string }>(null);
  const [err, setErr] = useState<{ name?: string; phone?: string }>({});


  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const digits = tel.replace(/\D/g, "");
    const next = {
      name: name.length < 2 ? s.errName : undefined,
      phone: digits.length < 10 ? s.errPhone : undefined,
    };
    setErr(next);
    if (next.name || next.phone) {
      (e.currentTarget.querySelector(next.name ? "[name=name]" : "[name=phone]") as HTMLElement | null)?.focus();
      return;
    }
    const tId = String(f.get("treatment") ?? "");
    const dayV = String(f.get("day") ?? "");
    setSent({
      treatment: options.find((o) => o.id === tId)?.name ?? s.any,
      day: days.find((d) => d.value === dayV)?.label ?? "",
      time: String(f.get("time") ?? ""),
      name,
    });
  };

  const field = "group relative flex min-w-0 flex-col gap-1 px-5 py-3.5 transition-colors duration-300 focus-within:bg-ice-2 lg:py-4";
  const label = "text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-mist transition-colors group-focus-within:text-steel";
  const input =
    "w-full min-w-0 bg-transparent pr-5 text-[0.9375rem] font-medium text-graphite outline-none placeholder:font-normal placeholder:text-mist";
  const sep = "border-b border-line lg:border-b-0 lg:border-r";

  return (
    <div className="border border-line bg-white shadow-[0_30px_60px_-40px_rgb(16_35_60/0.5)]">
      {/* başlık satırı */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-line px-5 py-3">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-display text-[1.0625rem] font-medium text-graphite">{s.title}</span>
          <span className="hidden text-[0.8125rem] text-stone md:inline">{s.sub}</span>
        </p>
        <a href={`tel:${phone.href}`} className="group/tel inline-flex items-center gap-2 text-[0.8125rem] text-stone">
          {s.orCall}
          <span className="font-medium text-steel tnum group-hover/tel:text-steel-deep">{phone.display}</span>
          <LottieIcon name="phone" size={18} mode="hover" color="#1F6FD1" />
        </a>
      </div>

      {sent ? (
        <div className="flex flex-wrap items-center justify-between gap-6 px-5 py-5" role="status">
          <div className="flex items-center gap-4">
            <LottieIcon name="success" size={48} mode="once" color="#1F6FD1" />
            <div>
              <p className="font-medium text-graphite">{s.success}</p>
              <p className="text-[0.8125rem] text-stone">{s.successSub}</p>
            </div>
          </div>
          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[0.8125rem]">
            <div>
              <dt className="text-mist">{s.treatment}</dt>
              <dd className="font-medium text-graphite">{sent.treatment}</dd>
            </div>
            {sent.day ? (
              <div>
                <dt className="text-mist">{s.day}</dt>
                <dd className="font-medium text-graphite">{sent.day}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-mist">{s.time}</dt>
              <dd className="font-medium text-graphite">{sent.time}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => {
              setSent(null);
              setTel("");
            }}
            className="btn btn-ghost min-h-11 px-5 text-[0.875rem]"
          >
            {s.again}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate aria-label={s.title} className="grid md:grid-cols-2 lg:grid-cols-[1.3fr_1.15fr_1fr_1.05fr_1.1fr_auto]">
          <label className={`${field} ${sep} md:border-r`}>
            <span className={label}>{s.treatment}</span>
            <span className="relative">
              <select name="treatment" defaultValue="" className={`${input} cursor-pointer appearance-none`}>
                <option value="">{s.any}</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <Chevron />
            </span>
          </label>
          <label className={`${field} ${sep}`}>
            <span className={label}>{s.day}</span>
            <span className="relative">
              <select name="day" className={`${input} cursor-pointer appearance-none`} disabled={!days.length}>
                {days.length ? (
                  days.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))
                ) : (
                  <option>—</option>
                )}
              </select>
              <Chevron />
            </span>
          </label>
          <label className={`${field} ${sep} md:border-r`}>
            <span className={label}>{s.time}</span>
            <span className="relative">
              <select name="time" defaultValue={s.times[0]} className={`${input} cursor-pointer appearance-none`}>
                {s.times.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <Chevron />
            </span>
          </label>
          <label className={`${field} ${sep}`}>
            <span className={label}>{s.name}</span>
            <input
              name="name"
              autoComplete="name"
              placeholder={s.namePh}
              aria-invalid={!!err.name}
              aria-describedby={err.name ? `${uid}-name` : undefined}
              onChange={() => err.name && setErr((x) => ({ ...x, name: undefined }))}
              className={input}
            />
            {err.name ? (
              <span id={`${uid}-name`} className="text-[0.75rem] text-[#c2410c]">
                {err.name}
              </span>
            ) : null}
          </label>
          <label className={`${field} border-b border-line md:col-span-2 lg:col-span-1 lg:border-b-0`}>
            <span className={label}>{s.phone}</span>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={s.phonePh}
              value={tel}
              onChange={(e) => {
                setTel(formatPhone(e.target.value));
                if (err.phone) setErr((x) => ({ ...x, phone: undefined }));
              }}
              aria-invalid={!!err.phone}
              aria-describedby={err.phone ? `${uid}-phone` : undefined}
              className={`${input} tnum`}
            />
            {err.phone ? (
              <span id={`${uid}-phone`} className="text-[0.75rem] text-[#c2410c]">
                {err.phone}
              </span>
            ) : null}
          </label>
          <div className="p-2 md:col-span-2 lg:col-span-1 lg:p-2.5">
            <button type="submit" className="btn btn-primary h-full min-h-14 w-full justify-center whitespace-nowrap lg:px-7">
              {s.submit} <span className="arrow">→</span>
            </button>
          </div>
        </form>
      )}

      {/* alt bilgi satırı */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line bg-ice-2/70 px-5 py-2.5 text-[0.75rem] text-stone">
        <ul className="flex flex-wrap gap-x-6 gap-y-1.5">
          {s.perks.map((p) => (
            <li key={p} className="inline-flex items-center gap-2">
              <Check />
              {p}
            </li>
          ))}
        </ul>
        <p>
          {s.consent}{" "}
          <Link href={privacyHref} className="link-u font-medium text-steel">
            {s.consentLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
