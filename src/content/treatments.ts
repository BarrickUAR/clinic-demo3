import type { Locale, PhotoKey } from "./site";

export type Zone = "front" | "premolar" | "molar" | "gum";

type L<T> = Record<Locale, T>;

export type Treatment = {
  id: string;
  slug: L<string>;
  name: L<string>;
  short: L<string>;
  duration: L<string>;
  sessions: L<string>;
  zones: Zone[];
  photo: PhotoKey;
  body: L<{
    what: string;
    forWhom: string[];
    steps: { t: string; d: string }[];
    after: string[];
    faq: { q: string; a: string }[];
  }>;
};

export const treatments: Treatment[] = [
  {
    id: "exam",
    slug: { tr: "muayene-ve-rontgen", en: "check-up-and-x-ray" },
    name: { tr: "Muayene ve Röntgen", en: "Check-up & X-ray" },
    short: {
      tr: "Her planın başlangıcı. Ağız içi muayene, dijital röntgen ve yazılı tedavi planı.",
      en: "Where every plan starts. Clinical exam, digital x-ray and a written treatment plan.",
    },
    duration: { tr: "30 dk", en: "30 min" },
    sessions: { tr: "1 seans", en: "1 visit" },
    zones: ["front", "premolar", "molar", "gum"],
    photo: "exam",
    body: {
      tr: {
        what: "İlk ziyarette dişleri, diş etlerini, çene eklemini ve mevcut dolgu ya da kaplamaları tek tek kontrol ediyoruz. Gerekirse düşük dozlu dijital röntgen çekiyor, bulguları ekranda sizinle birlikte inceliyoruz. Muayene bitiminde seçenekleri, süreleri ve tahmini maliyeti içeren yazılı bir plan alıyorsunuz.",
        forWhom: ["Son kontrolü üzerinden 6 aydan fazla geçenler", "Ağrı, hassasiyet ya da kanama fark edenler", "Başka bir klinikte önerilen tedavi için ikinci görüş isteyenler"],
        steps: [
          { t: "Ön görüşme", d: "Şikâyetinizi, sağlık geçmişinizi ve kullandığınız ilaçları konuşuyoruz." },
          { t: "Klinik muayene", d: "Dişler, diş eti cepleri ve ısırma düzeni kontrol edilir." },
          { t: "Dijital röntgen", d: "Gerekirse panoramik ya da periapikal görüntü alınır." },
          { t: "Yazılı plan", d: "Öncelik sırasına göre seçenekler ve maliyet paylaşılır." },
        ],
        after: ["Planı evde düşünüp karar vermeniz için zaman tanıyoruz.", "Röntgen görüntüleriniz talep ederseniz size e-posta ile iletilir."],
        faq: [
          { q: "Muayene ücretli mi?", a: "Muayene ve röntgen ücreti, aynı plan kapsamında tedaviye başlarsanız toplam tutardan düşülür." },
          { q: "Röntgen güvenli mi?", a: "Dijital sensörler klasik filme göre çok daha düşük doz kullanır. Hamilelik ihtimali varsa lütfen önceden belirtin." },
        ],
      },
      en: {
        what: "On your first visit we check each tooth, the gums, the jaw joint and any existing fillings or crowns. If needed we take a low-dose digital x-ray and review it with you on screen. You leave with a written plan covering options, timing and an estimated cost.",
        forWhom: ["Anyone whose last check-up was over 6 months ago", "People noticing pain, sensitivity or bleeding gums", "Patients wanting a second opinion on a proposed treatment"],
        steps: [
          { t: "Conversation", d: "We go over your concern, medical history and medication." },
          { t: "Clinical exam", d: "Teeth, gum pockets and bite are examined." },
          { t: "Digital x-ray", d: "A panoramic or periapical image if required." },
          { t: "Written plan", d: "Options in order of priority, with cost." },
        ],
        after: ["You can take the plan home and decide in your own time.", "Your x-rays can be emailed to you on request."],
        faq: [
          { q: "Is there a fee for the check-up?", a: "Yes, but it is deducted from the total if you start treatment under the same plan." },
          { q: "Are x-rays safe?", a: "Digital sensors use a fraction of the dose of film. Please tell us beforehand if you might be pregnant." },
        ],
      },
    },
  },
  {
    id: "root-canal",
    slug: { tr: "kanal-tedavisi", en: "root-canal-treatment" },
    name: { tr: "Kanal Tedavisi", en: "Root Canal Treatment" },
    short: {
      tr: "İltihaplanan sinir dokusunu temizleyip dişi çekmeden korumayı amaçlar.",
      en: "Cleans out inflamed nerve tissue so the tooth can be kept rather than extracted.",
    },
    duration: { tr: "60–90 dk", en: "60–90 min" },
    sessions: { tr: "1–2 seans", en: "1–2 visits" },
    zones: ["front", "premolar", "molar"],
    photo: "model",
    body: {
      tr: {
        what: "Derin çürük ya da kırık nedeniyle dişin içindeki sinir dokusu iltihaplandığında, kanallar temizlenip şekillendirilir ve sızdırmaz bir dolgu malzemesiyle kapatılır. İşlem lokal anestezi altında yapılır. Amaç, doğal dişi ağızda tutmaktır.",
        forWhom: ["Sıcak-soğukta uzun süren sızı", "Gece uyandıran ağrı", "Dişte renk değişimi ya da diş etinde şişlik"],
        steps: [
          { t: "Anestezi ve izolasyon", d: "Dişi tükürükten korumak için lastik örtü (rubber dam) kullanılır." },
          { t: "Kanalların temizlenmesi", d: "Kanal boyları ölçülür, döner aletlerle temizlenir." },
          { t: "Kanal dolgusu", d: "Kanallar sızdırmaz şekilde doldurulur." },
          { t: "Üst restorasyon", d: "Diş dolgu ya da kaplama ile güçlendirilir." },
        ],
        after: ["Birkaç gün hafif hassasiyet normaldir.", "Kalıcı restorasyon yapılana kadar o taraftan sert şey ısırmayın."],
        faq: [
          { q: "Kanal tedavisi kaç seans sürer?", a: "Çoğu dişte tek seans yeterlidir. İltihap yoğunsa iki seansa bölünebilir." },
          { q: "Tedaviden sonra kaplama şart mı?", a: "Azı dişlerinde çoğunlukla önerilir, çünkü kanal tedavili diş zamanla kırılgan hale gelebilir." },
        ],
      },
      en: {
        what: "When deep decay or a crack inflames the nerve inside a tooth, the canals are cleaned, shaped and sealed. The procedure is done under local anaesthetic, and the aim is to keep your natural tooth.",
        forWhom: ["Lingering pain with hot or cold", "Pain that wakes you at night", "Darkening of the tooth or gum swelling"],
        steps: [
          { t: "Anaesthesia & isolation", d: "A rubber dam keeps the tooth clean and dry." },
          { t: "Cleaning the canals", d: "Canal lengths are measured and cleaned with rotary files." },
          { t: "Sealing", d: "Canals are filled and sealed." },
          { t: "Final restoration", d: "The tooth is reinforced with a filling or crown." },
        ],
        after: ["Mild tenderness for a few days is normal.", "Avoid biting hard on that side until the final restoration."],
        faq: [
          { q: "How many visits does it take?", a: "Most teeth are done in one visit. Heavily infected teeth may need two." },
          { q: "Do I need a crown afterwards?", a: "Usually yes for back teeth, as treated teeth can become brittle over time." },
        ],
      },
    },
  },
  {
    id: "filling",
    slug: { tr: "estetik-dolgu", en: "tooth-coloured-fillings" },
    name: { tr: "Estetik Dolgu", en: "Tooth-coloured Fillings" },
    short: {
      tr: "Çürük dokuyu temizleyip diş renginde kompozit malzemeyle tamamlıyoruz.",
      en: "Decay is removed and the tooth rebuilt with a composite matched to its shade.",
    },
    duration: { tr: "30–60 dk", en: "30–60 min" },
    sessions: { tr: "1 seans", en: "1 visit" },
    zones: ["front", "premolar", "molar"],
    photo: "mirror",
    body: {
      tr: {
        what: "Kompozit dolgu, dişe katman katman yapıştırılan ve diş rengine uyumlanan bir malzemedir. Amalgama göre daha az sağlam doku kaldırmayı gerektirir. Ön dişlerde kırık ya da aralık kapatmada da kullanılır.",
        forWhom: ["Küçük ve orta büyüklükte çürükler", "Kırılan ya da aşınan diş kenarları", "Eski, renk değiştiren dolguların yenilenmesi"],
        steps: [
          { t: "Renk seçimi", d: "Gün ışığında diş rengi belirlenir." },
          { t: "Çürüğün temizlenmesi", d: "Yalnızca etkilenen doku kaldırılır." },
          { t: "Katmanlı uygulama", d: "Kompozit katmanlar halinde yerleştirilir ve ışıkla sertleştirilir." },
          { t: "Cila", d: "Isırma kontrol edilir, yüzey parlatılır." },
        ],
        after: ["Anestezi geçene kadar yemek yemeyin.", "İlk 48 saat koyu renkli içecekleri sınırlayın."],
        faq: [
          { q: "Dolgu ne kadar dayanır?", a: "Bakıma ve ısırma alışkanlıklarına bağlı olarak genellikle 5–10 yıl." },
          { q: "Eski amalgam dolgularımı değiştirmeli miyim?", a: "Sağlam ve sızdırmayan amalgamı yalnızca estetik nedenle değiştirmeyi önermiyoruz; muayenede birlikte değerlendiriyoruz." },
        ],
      },
      en: {
        what: "A composite filling is bonded to the tooth in layers and matched to its shade. It requires removing less healthy tissue than amalgam and is also used to repair chips or close small gaps at the front.",
        forWhom: ["Small to medium cavities", "Chipped or worn edges", "Replacing old, discoloured fillings"],
        steps: [
          { t: "Shade matching", d: "The shade is chosen in daylight." },
          { t: "Removing decay", d: "Only affected tissue is removed." },
          { t: "Layering", d: "Composite is placed in layers and light-cured." },
          { t: "Polish", d: "Bite is checked and the surface polished." },
        ],
        after: ["Don't eat until the anaesthetic wears off.", "Limit dark drinks for the first 48 hours."],
        faq: [
          { q: "How long do fillings last?", a: "Typically 5–10 years, depending on care and bite habits." },
          { q: "Should I replace my old amalgam fillings?", a: "We don't recommend replacing sound, sealed amalgam for looks alone; we assess it together at the exam." },
        ],
      },
    },
  },
  {
    id: "whitening",
    slug: { tr: "dis-beyazlatma", en: "teeth-whitening" },
    name: { tr: "Diş Beyazlatma", en: "Teeth Whitening" },
    short: {
      tr: "Hekim kontrolünde, diş yapısına zarar vermeden birkaç ton açma.",
      en: "Supervised whitening that lifts the shade by a few tones without harming enamel.",
    },
    duration: { tr: "60 dk", en: "60 min" },
    sessions: { tr: "1 seans + ev", en: "1 visit + home" },
    zones: ["front"],
    photo: "smile",
    body: {
      tr: {
        what: "Beyazlatma öncesinde dişler ve diş etleri kontrol edilir, varsa çürük ve diş taşı tedavi edilir. Ardından klinikte uygulama ve kişiye özel plaklarla ev uygulaması birlikte planlanır. Dolgu ve kaplamalar beyazlamaz; bu yüzden planlamada dikkate alınır.",
        forWhom: ["Çay, kahve ve sigaraya bağlı renklenme", "Yaşa bağlı sararma", "Sağlıklı diş ve diş eti yapısına sahip yetişkinler"],
        steps: [
          { t: "Ön kontrol", d: "Mevcut renk kaydedilir, hassasiyet değerlendirilir." },
          { t: "Diş eti koruması", d: "Diş etleri koruyucu bariyerle kapatılır." },
          { t: "Klinik uygulama", d: "Jel, aralıklarla uygulanır." },
          { t: "Ev plakları", d: "Sonucu desteklemek için kişiye özel plaklar verilir." },
        ],
        after: ["İlk 48 saat renkli yiyecek ve içeceklerden kaçının.", "Geçici hassasiyet görülebilir; hassasiyet macunu önerilir."],
        faq: [
          { q: "Sonuç ne kadar kalıcı?", a: "Alışkanlıklara bağlı olarak 1–2 yıl. Kısa ev uygulamalarıyla tazelenebilir." },
          { q: "Dişlere zarar verir mi?", a: "Hekim kontrolünde ve doğru konsantrasyonda uygulandığında mineye kalıcı zarar vermez." },
        ],
      },
      en: {
        what: "Before whitening we check the teeth and gums and treat any decay or tartar. We then combine an in-clinic session with custom trays for home use. Fillings and crowns don't whiten, so they are factored into the plan.",
        forWhom: ["Staining from tea, coffee or smoking", "Age-related yellowing", "Adults with healthy teeth and gums"],
        steps: [
          { t: "Baseline", d: "Your current shade is recorded and sensitivity assessed." },
          { t: "Gum protection", d: "A barrier protects the gums." },
          { t: "In-clinic session", d: "Gel is applied in timed cycles." },
          { t: "Home trays", d: "Custom trays to maintain the result." },
        ],
        after: ["Avoid strongly coloured food and drinks for 48 hours.", "Temporary sensitivity is possible; a desensitising paste helps."],
        faq: [
          { q: "How long does it last?", a: "1–2 years depending on habits, and it can be refreshed with short home top-ups." },
          { q: "Does it damage teeth?", a: "Supervised whitening at the right concentration does not permanently harm enamel." },
        ],
      },
    },
  },
  {
    id: "zirconia",
    slug: { tr: "zirkonyum-kaplama", en: "zirconia-crowns" },
    name: { tr: "Zirkonyum Kaplama", en: "Zirconia Crowns" },
    short: {
      tr: "Metal içermeyen, ışık geçirgenliği doğal dişe yakın kaplamalar.",
      en: "Metal-free crowns with translucency close to natural teeth.",
    },
    duration: { tr: "2–3 hafta", en: "2–3 weeks" },
    sessions: { tr: "2–3 seans", en: "2–3 visits" },
    zones: ["front", "premolar", "molar"],
    photo: "consult",
    body: {
      tr: {
        what: "Zirkonyum, ağır hasar görmüş ya da kanal tedavisi yapılmış dişleri korumak ve görünümlerini düzeltmek için kullanılan dayanıklı bir seramiktir. Metal alt yapı olmadığı için diş eti kenarında koyu çizgi oluşmaz.",
        forWhom: ["Büyük dolgulu ya da kırık dişler", "Kanal tedavisi sonrası azı dişleri", "Renk ve form bozukluğu olan ön dişler"],
        steps: [
          { t: "Planlama", d: "Fotoğraf ve ölçülerle hedef form belirlenir." },
          { t: "Hazırlık ve ölçü", d: "Diş hazırlanır, dijital ya da klasik ölçü alınır; geçici kaplama takılır." },
          { t: "Prova", d: "Uyum, renk ve ısırma kontrol edilir." },
          { t: "Yapıştırma", d: "Kaplama kalıcı olarak simante edilir." },
        ],
        after: ["İlk gün yapışkan gıdalardan kaçının.", "Diş ipi ya da arayüz fırçası kullanmaya devam edin."],
        faq: [
          { q: "Zirkonyum ile porselen arasındaki fark ne?", a: "Zirkonyum daha dayanıklıdır, özellikle arka dişlerde tercih edilir. Ön dişlerde estetik ihtiyaca göre birlikte değerlendirilir." },
          { q: "Ömrü ne kadar?", a: "İyi bakımla 10–15 yıl ve üzeri." },
        ],
      },
      en: {
        what: "Zirconia is a strong ceramic used to protect heavily damaged or root-treated teeth and to improve their appearance. With no metal core, there is no dark line at the gum edge.",
        forWhom: ["Teeth with large fillings or fractures", "Back teeth after root canal treatment", "Front teeth with shape or colour issues"],
        steps: [
          { t: "Planning", d: "Photos and records define the target shape." },
          { t: "Preparation & impression", d: "The tooth is prepared, scanned or impressed, and a temporary placed." },
          { t: "Try-in", d: "Fit, shade and bite are checked." },
          { t: "Cementation", d: "The crown is bonded permanently." },
        ],
        after: ["Avoid sticky food on the first day.", "Keep flossing or using interdental brushes."],
        faq: [
          { q: "Zirconia or porcelain?", a: "Zirconia is stronger and preferred for back teeth. For front teeth we decide together based on aesthetics." },
          { q: "How long do they last?", a: "10–15 years or more with good care." },
        ],
      },
    },
  },
  {
    id: "veneers",
    slug: { tr: "porselen-lamina", en: "porcelain-veneers" },
    name: { tr: "Porselen Lamina", en: "Porcelain Veneers" },
    short: {
      tr: "Ön yüzeye yapıştırılan ince porselen yapraklarla form ve renk düzenleme.",
      en: "Thin porcelain shells bonded to the front surface to refine shape and colour.",
    },
    duration: { tr: "2–3 hafta", en: "2–3 weeks" },
    sessions: { tr: "3 seans", en: "3 visits" },
    zones: ["front"],
    photo: "care",
    body: {
      tr: {
        what: "Lamina, dişin yalnızca ön yüzeyinden çok az aşındırma yapılarak hazırlanan ince porselen yapraklardır. Uygulamadan önce ağız içi prova (mock-up) ile sonuç birlikte değerlendirilir; karar ancak bu aşamadan sonra verilir.",
        forWhom: ["Beyazlatmaya yanıt vermeyen renklenmeler", "Küçük aralıklar ve form bozuklukları", "Aşınmış ön diş kenarları"],
        steps: [
          { t: "Gülüş analizi", d: "Fotoğraf ve video ile yüz oranları değerlendirilir." },
          { t: "Prova (mock-up)", d: "Hedef form ağız içinde geçici olarak denenir." },
          { t: "Hazırlık ve ölçü", d: "Minimal hazırlık yapılır, ölçü alınır." },
          { t: "Yapıştırma", d: "Laminalar tek tek yerleştirilir." },
        ],
        after: ["Tırnak yeme, kalem ısırma gibi alışkanlıklardan kaçının.", "Gece diş sıkıyorsanız koruyucu plak önerilir."],
        faq: [
          { q: "Dişlerim çok kesilir mi?", a: "Çoğu vakada yalnızca minede 0,3–0,7 mm hazırlık yapılır." },
          { q: "Lamina herkes için uygun mu?", a: "Ciddi diş sıkma, yoğun çürük ya da diş eti hastalığı varsa önce bunlar tedavi edilir." },
        ],
      },
      en: {
        what: "Veneers are thin porcelain shells requiring minimal preparation of the front surface. Before committing, we trial the result in your mouth with a mock-up; the decision comes after that step.",
        forWhom: ["Discolouration that doesn't respond to whitening", "Small gaps and shape irregularities", "Worn front edges"],
        steps: [
          { t: "Smile analysis", d: "Facial proportions assessed with photo and video." },
          { t: "Mock-up", d: "The planned shape is trialled in the mouth." },
          { t: "Preparation & impression", d: "Minimal preparation, then impressions." },
          { t: "Bonding", d: "Veneers are placed one by one." },
        ],
        after: ["Avoid habits like nail or pen biting.", "A night guard is advised if you clench or grind."],
        faq: [
          { q: "Will my teeth be heavily reduced?", a: "In most cases preparation is 0.3–0.7 mm, within the enamel." },
          { q: "Are veneers suitable for everyone?", a: "Heavy grinding, active decay or gum disease are treated first." },
        ],
      },
    },
  },
  {
    id: "gum",
    slug: { tr: "dis-eti-tedavisi", en: "gum-treatment" },
    name: { tr: "Diş Eti Tedavisi", en: "Gum Treatment" },
    short: {
      tr: "Diş taşı temizliği, kök yüzeyi düzleştirme ve düzenli bakım takibi.",
      en: "Scaling, root planing and a regular maintenance schedule.",
    },
    duration: { tr: "45–60 dk", en: "45–60 min" },
    sessions: { tr: "1–2 seans", en: "1–2 visits" },
    zones: ["gum"],
    photo: "tools",
    body: {
      tr: {
        what: "Diş eti kanaması, diş taşı ve bakterilerin oluşturduğu iltihabın ilk işaretidir. Ultrasonik temizlik ve gerektiğinde diş eti altındaki kök yüzeylerinin düzleştirilmesiyle iltihap kontrol altına alınır. Ardından kişiye özel bir kontrol aralığı belirlenir.",
        forWhom: ["Fırçalarken kanayan diş etleri", "Ağız kokusu", "Diş eti çekilmesi ya da sallanan dişler"],
        steps: [
          { t: "Cep ölçümü", d: "Her dişin çevresindeki cep derinliği kaydedilir." },
          { t: "Detertraj", d: "Ultrasonik aletlerle diş taşı temizlenir." },
          { t: "Kök düzleştirme", d: "Gerekirse anestezi altında derin temizlik yapılır." },
          { t: "Takip", d: "4–6 hafta sonra iyileşme yeniden ölçülür." },
        ],
        after: ["İlk günlerde hafif hassasiyet olabilir.", "Arayüz fırçası kullanımı iyileşmeyi hızlandırır."],
        faq: [
          { q: "Diş taşı temizliği mineye zarar verir mi?", a: "Hayır. Ultrasonik uçlar yalnızca diş taşını kırar, mineyi aşındırmaz." },
          { q: "Ne sıklıkla yaptırmalıyım?", a: "Çoğu kişi için 6 ayda bir; diş eti hastalığı öyküsü varsa 3–4 ayda bir." },
        ],
      },
      en: {
        what: "Bleeding gums are the first sign of inflammation caused by tartar and bacteria. Ultrasonic cleaning and, where needed, root planing below the gumline bring it under control. We then set a personal recall interval.",
        forWhom: ["Gums that bleed when brushing", "Persistent bad breath", "Receding gums or loose teeth"],
        steps: [
          { t: "Pocket charting", d: "Pocket depth around every tooth is recorded." },
          { t: "Scaling", d: "Tartar removed with ultrasonic instruments." },
          { t: "Root planing", d: "Deep cleaning under anaesthetic if required." },
          { t: "Review", d: "Healing re-measured after 4–6 weeks." },
        ],
        after: ["Mild sensitivity for a few days is possible.", "Interdental brushes speed up healing."],
        faq: [
          { q: "Does scaling damage enamel?", a: "No. Ultrasonic tips break up tartar without wearing enamel." },
          { q: "How often should I have it done?", a: "Every 6 months for most people; every 3–4 months with a history of gum disease." },
        ],
      },
    },
  },
  {
    id: "extraction",
    slug: { tr: "dis-cekimi", en: "tooth-extraction" },
    name: { tr: "Diş Çekimi", en: "Tooth Extraction" },
    short: {
      tr: "Kurtarılamayan dişler ve sorun çıkaran 20 yaş dişleri için planlı çekim.",
      en: "Planned removal of non-restorable teeth and troublesome wisdom teeth.",
    },
    duration: { tr: "30–60 dk", en: "30–60 min" },
    sessions: { tr: "1 seans", en: "1 visit" },
    zones: ["molar"],
    photo: "instruments",
    body: {
      tr: {
        what: "Çekim, dişi korumanın mümkün olmadığı durumlarda son seçenektir. Röntgenle kök yapısı değerlendirilir, işlem lokal anestezi altında ve dokuyu koruyan tekniklerle yapılır. Gerekirse boşluğun nasıl tamamlanacağı da aynı planda konuşulur.",
        forWhom: ["Kurtarılamayacak kadar hasar görmüş dişler", "Ağrı ya da iltihap yapan 20 yaş dişleri", "Ortodontik planlama gereği çekimler"],
        steps: [
          { t: "Değerlendirme", d: "Röntgenle kök formu ve komşu yapılar incelenir." },
          { t: "Anestezi", d: "Bölge tamamen uyuşturulur." },
          { t: "Çekim", d: "Diş, çevre kemiği koruyarak çıkarılır." },
          { t: "Bakım talimatı", d: "Yazılı bakım önerileri verilir, gerekirse dikiş atılır." },
        ],
        after: ["İlk 2 saat bir şey yemeyin, ilk gün sıcak içecek ve sigaradan kaçının.", "Ertesi gün ılık tuzlu suyla nazikçe çalkalayın."],
        faq: [
          { q: "Her 20 yaş dişi çekilmeli mi?", a: "Hayır. Sağlıklı ve doğru konumda sürmüş 20 yaş dişleri yerinde bırakılabilir." },
          { q: "Çekimden sonra iş yerine dönebilir miyim?", a: "Basit çekimlerde çoğu kişi aynı gün günlük işine döner." },
        ],
      },
      en: {
        what: "Extraction is the last option when a tooth can't be saved. Root form is assessed on x-ray and the tooth is removed under local anaesthetic using tissue-preserving techniques. Replacing the gap is discussed in the same plan if needed.",
        forWhom: ["Teeth damaged beyond repair", "Painful or infected wisdom teeth", "Extractions required for orthodontic planning"],
        steps: [
          { t: "Assessment", d: "Root form and nearby structures checked on x-ray." },
          { t: "Anaesthesia", d: "The area is fully numbed." },
          { t: "Removal", d: "The tooth is removed while preserving bone." },
          { t: "Aftercare", d: "Written instructions, stitches if needed." },
        ],
        after: ["No food for 2 hours; avoid hot drinks and smoking on day one.", "Rinse gently with warm salt water from the next day."],
        faq: [
          { q: "Must every wisdom tooth come out?", a: "No. Healthy, well-positioned wisdom teeth can stay." },
          { q: "Can I go back to work afterwards?", a: "After simple extractions most people return to normal activity the same day." },
        ],
      },
    },
  },
];

export const findTreatment = (locale: Locale, slug: string) =>
  treatments.find((t) => t.slug[locale] === slug);
