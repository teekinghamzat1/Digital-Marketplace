import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileFooterNav } from "@/components/mobile-footer-nav";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { BrandThemeHandler } from "@/components/brand-theme-handler";
import { UserProvider } from "@/context/UserContext";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.seoTitle || settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.seoDescription || settings.siteDescription || "Premium digital account marketplace",
    keywords: settings.seoKeywords || "digital marketplace, verified accounts, buy accounts",
    icons: {
      icon: settings.favicon || "/favicon.ico",
    },
    openGraph: {
      title: settings.seoTitle || settings.siteName,
      description: settings.seoDescription || settings.siteDescription,
      siteName: settings.siteName,
      images: settings.ogImage ? [{ url: settings.ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seoTitle || settings.siteName,
      description: settings.seoDescription || settings.siteDescription,
      images: settings.ogImage ? [settings.ogImage] : [],
    }
  };
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem
          enableColorScheme={false}
          disableTransitionOnChange
        >
          <UserProvider>
            <BrandThemeHandler settings={settings} />
            <Navbar settings={settings} />
            <main className="flex-1">
              {children}
            </main>
            <Footer settings={settings} />
            <WhatsAppButton settings={settings} />
            <MobileFooterNav />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
