import { prisma } from "./prisma";
import { unstable_cache, revalidateTag } from "next/cache";

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  siteLogo: string;
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
  // Legacy field alias kept for backward compat
  footerCopyright: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Digital Marketplace",
  siteDescription: "The most trusted digital marketplace for verified accounts.",
  siteLogo: "",
  favicon: "/favicon.ico",
  primaryColor: "#f97316",
  secondaryColor: "#fb923c",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  footerContact: "",
  address: "",
  email: "support@marketplace.com",
  whatsapp: "",
  telegram: "",
  copyrightText: `© ${new Date().getFullYear()} Digital Marketplace. All rights reserved.`,
  socialLinks: {},
  footerCopyright: `© ${new Date().getFullYear()} Digital Marketplace. All rights reserved.`,
};

const SETTINGS_TAG = "site_settings";

async function _fetchSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = rows.reduce((acc, r) => {
      acc[r.key] = r.value;
      return acc;
    }, {} as Record<string, string>);

    const copyrightText =
      map.copyrightText ||
      map.footerCopyright ||
      DEFAULT_SETTINGS.copyrightText;

    return {
      siteName: map.siteName || DEFAULT_SETTINGS.siteName,
      siteDescription: map.siteDescription || DEFAULT_SETTINGS.siteDescription,
      siteLogo: map.siteLogo || DEFAULT_SETTINGS.siteLogo,
      favicon: map.favicon || DEFAULT_SETTINGS.favicon,
      primaryColor: map.primaryColor || DEFAULT_SETTINGS.primaryColor,
      secondaryColor: map.secondaryColor || DEFAULT_SETTINGS.secondaryColor,
      accentColor: map.accentColor || DEFAULT_SETTINGS.accentColor,
      backgroundColor: map.backgroundColor || DEFAULT_SETTINGS.backgroundColor,
      textColor: map.textColor || DEFAULT_SETTINGS.textColor,
      footerContact: map.footerContact || DEFAULT_SETTINGS.footerContact,
      address: map.address || DEFAULT_SETTINGS.address,
      email: map.email || DEFAULT_SETTINGS.email,
      whatsapp: map.whatsapp || DEFAULT_SETTINGS.whatsapp,
      telegram: map.telegram || DEFAULT_SETTINGS.telegram,
      copyrightText,
      footerCopyright: copyrightText,
      socialLinks: map.socialLinks
        ? JSON.parse(map.socialLinks)
        : DEFAULT_SETTINGS.socialLinks,
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return DEFAULT_SETTINGS;
  }
}

// Cached version — revalidated whenever admin saves
export const getSettings = unstable_cache(
  _fetchSettings,
  [SETTINGS_TAG],
  { tags: [SETTINGS_TAG], revalidate: 3600 }
);

export function invalidateSettingsCache() {
  revalidateTag(SETTINGS_TAG);
}

export async function updateSetting(key: string, value: string) {
  return prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function updateMultipleSettings(
  settings: Partial<Record<keyof SiteSettings, any>>
) {
  const promises = Object.entries(settings).map(([key, value]) => {
    const stringValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    return updateSetting(key, stringValue);
  });
  return Promise.all(promises);
}
