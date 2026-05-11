import { prisma } from "./prisma";

export type SiteSettings = {
  siteName: string;
  siteLogo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  footerContact: string;
  email: string;
  whatsapp: string;
  telegram: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  footerCopyright: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Digital Marketplace",
  siteLogo: "/logo.png",
  favicon: "/favicon.ico",
  primaryColor: "#f97316", // Orange-500
  secondaryColor: "#fb923c", // Orange-400
  footerContact: "123 Marketplace Ave, Digital City",
  email: "support@marketplace.com",
  whatsapp: "+1234567890",
  telegram: "https://t.me/marketplace",
  socialLinks: {},
  footerCopyright: `© ${new Date().getFullYear()} Digital Marketplace. All rights reserved.`,
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      siteName: settingsMap.siteName || DEFAULT_SETTINGS.siteName,
      siteLogo: settingsMap.siteLogo || DEFAULT_SETTINGS.siteLogo,
      favicon: settingsMap.favicon || DEFAULT_SETTINGS.favicon,
      primaryColor: settingsMap.primaryColor || DEFAULT_SETTINGS.primaryColor,
      secondaryColor: settingsMap.secondaryColor || DEFAULT_SETTINGS.secondaryColor,
      footerContact: settingsMap.footerContact || DEFAULT_SETTINGS.footerContact,
      email: settingsMap.email || DEFAULT_SETTINGS.email,
      whatsapp: settingsMap.whatsapp || DEFAULT_SETTINGS.whatsapp,
      telegram: settingsMap.telegram || DEFAULT_SETTINGS.telegram,
      socialLinks: settingsMap.socialLinks ? JSON.parse(settingsMap.socialLinks) : DEFAULT_SETTINGS.socialLinks,
      footerCopyright: settingsMap.footerCopyright || DEFAULT_SETTINGS.footerCopyright,
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSetting(key: string, value: string) {
  return prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function updateMultipleSettings(settings: Partial<Record<keyof SiteSettings, any>>) {
  const promises = Object.entries(settings).map(([key, value]) => {
    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
    return updateSetting(key, stringValue);
  });
  return Promise.all(promises);
}
