/**
 * Tek kaynak: klinik kimliği ve iletişim bilgileri.
 * Müşteriye uyarlarken yalnızca bu dosyayı değiştirmek yeterli.
 * (Demo içerik — tüm veriler kurgusaldır.)
 */
export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://mira-dental-demo.vercel.app",
  brand: "Mira",
  name: { tr: "Mira Ağız ve Diş Sağlığı", en: "Mira Dental Studio" },
  descriptor: { tr: "Ağız ve Diş Sağlığı", en: "Dental Studio" },
  dentist: {
    name: "Dt. Ece Arman",
    givenName: "Ece",
    familyName: "Arman",
  },
  phone: { display: "0212 555 01 47", href: "+902125550147" },
  whatsapp: { display: "0532 555 01 47", href: "905325550147" },
  email: "randevu@miradis.com.tr",
  address: {
    street: "Teşvikiye Cad. No: 42, Kat 3",
    district: "Şişli",
    city: "İstanbul",
    postalCode: "34365",
    country: "TR",
  },
  geo: { lat: 41.0503, lng: 28.9939 },
  mapsUrl: "https://maps.google.com/?q=41.0503,28.9939",
  /** 0 = Pazar. Saatler İstanbul saatine göre. */
  hours: [
    { days: [1, 2, 3, 4, 5], open: "09:00", close: "19:00" },
    { days: [6], open: "10:00", close: "16:00" },
  ],
  timeZone: "Europe/Istanbul",
  instagram: "https://www.instagram.com/",
  established: 2019,
  agency: { name: "DevPixel", url: "https://devpixel.com.tr" },
} as const;

export type Locale = "tr" | "en";
export const locales: Locale[] = ["tr", "en"];

export const img = (id: string) => `https://images.unsplash.com/photo-${id}`;

/** Unsplash (Unsplash License) — soğuk tonlu, tutarlı seçki */
export const photos = {
  hero: { src: img("1728342057953-94bfad8f0e7e"), alt: { tr: "Pencere ışığı alan beyaz tedavi koltuğu", en: "White treatment chair by a bright window" } },
  room: { src: img("1704455306251-b4634215d98f"), alt: { tr: "Sade, aydınlık tedavi odası", en: "A calm, bright treatment room" } },
  room2: { src: img("1704455306925-1401c3012117"), alt: { tr: "Tedavi ünitesi ve ekipman", en: "Treatment unit and equipment" } },
  room3: { src: img("1629909613654-28e377c37b09"), alt: { tr: "Modern tedavi odası", en: "Modern treatment room" } },
  waiting: { src: img("1762625570087-6d98fca29531"), alt: { tr: "Bekleme alanı", en: "Waiting area" } },
  mirror: { src: img("1606811856475-5e6fcdc6e509"), alt: { tr: "Ayna ve sond, steril tepside", en: "Mirror and explorer on a sterile tray" } },
  mirror2: { src: img("1698749778813-ad5f2814e50f"), alt: { tr: "Ağız aynası, arkada tedavi koltuğu", en: "Dental mirror with the chair behind" } },
  dentist: { src: img("1681939282741-9ace0a227977"), alt: { tr: "Diş hekimi portresi", en: "Portrait of the dentist" } },
  consult: { src: img("1777331903190-341a3dd0441b"), alt: { tr: "Hekim ve hasta tedavi planını konuşuyor", en: "Dentist and patient discussing a plan" } },
  xray: { src: img("1777444969135-caf869407707"), alt: { tr: "Röntgen filmlerini inceleyen hekim", en: "Dentist reviewing x-rays" } },
  model: { src: img("1777793389944-f7165259a05c"), alt: { tr: "Diş modeli üzerinde kök kanalı anlatımı", en: "Explaining a root canal on a tooth model" } },
  tools: { src: img("1771442873038-dda05b6ca447"), alt: { tr: "Muayene aletleri", en: "Examination instruments" } },
  exam: { src: img("1606811971618-4486d14f3f99"), alt: { tr: "Ayna ve sond ile muayene", en: "Examination with mirror and probe" } },
  smile: { src: img("1654373535457-383a0a4d00f9"), alt: { tr: "Yakın plan diş görünümü", en: "Close-up of teeth" } },
  instruments: { src: img("1642844744022-d76a9af3711a"), alt: { tr: "Ünite üzerindeki el aletleri", en: "Handpieces on the unit" } },
  care: { src: img("1681939282781-341ac4f61996"), alt: { tr: "Hekim hastaya bakım anlatıyor", en: "Dentist explaining home care" } },
} as const;

export type PhotoKey = keyof typeof photos;
