import type { Viewport } from "next";
import { fontClasses } from "@/app/fonts";
import type { Locale } from "@/content/site";
import { Footer } from "./footer";
import { Header } from "./header";
import { MobileBar } from "./mobile-bar";
import { NavProgress } from "./nav-progress";
import { RevealObserver } from "./reveal-observer";

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

/** İki dilin root layout'u da bu kabuğu kullanır. */
export function RootHtml({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={locale} className={fontClasses} suppressHydrationWarning>
      <head>
        {/* reveal animasyonları yalnızca JS varken gizler */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">
        <NavProgress />
        <Header locale={locale} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer locale={locale} />
        <MobileBar locale={locale} />
        <RevealObserver />
      </body>
    </html>
  );
}
