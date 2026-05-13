export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  siteLogo: string; // fallback logo
  logoLight: string; // for white/light backgrounds
  logoDark: string;  // for dark backgrounds
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  footerContact: string;
  address: string;
  email: string;
  whatsapp: string;
  telegram: string;
  copyrightText: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  // Legacy alias kept for backward compat
  footerCopyright: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Digital Marketplace",
  siteDescription: "The most trusted digital marketplace for verified accounts.",
  siteLogo: "",
  logoLight: "",
  logoDark: "",
  favicon: "/favicon.ico",
  primaryColor: "#E87722",
  secondaryColor: "#fb923c",
  accentColor: "#f59e0b",
  backgroundColor: "#0f0f0f",
  textColor: "#ffffff",
  footerContact: "",
  address: "",
  email: "support@marketplace.com",
  whatsapp: "",
  telegram: "",
  copyrightText: `© ${new Date().getFullYear()} Digital Marketplace. All rights reserved.`,
  socialLinks: {},
  footerCopyright: `© ${new Date().getFullYear()} Digital Marketplace. All rights reserved.`,
};

/**
 * Global helper to get the correct logo based on the theme.
 * Pure function, safe for client/server.
 */
export function getLogoForMode(settings: SiteSettings, mode: 'dark' | 'light' | string | undefined) {
  if (!settings) return null;
  if (mode === 'dark') {
    return settings.logoDark || settings.logoLight || settings.siteLogo || null;
  }
  return settings.logoLight || settings.logoDark || settings.siteLogo || null;
}
