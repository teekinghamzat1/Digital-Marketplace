import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MobileFooterNav } from "@/components/mobile-footer-nav";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { UserProvider } from "@/context/UserContext";
import { getSettings } from "@/lib/settings";

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
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: "Premium digital account marketplace",
    icons: {
      icon: settings.favicon || "/favicon.ico",
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
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${settings.primaryColor};
            --color-primary-hover: ${settings.primaryColor}dd;
            --color-secondary: ${settings.secondaryColor};
          }
        `}} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            {children}
            <WhatsAppButton />
            <MobileFooterNav />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
