import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

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
  // Legacy alias kept for backward compat
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

/**
 * Fetch site settings directly from the DB.
 * Handles both camelCase and snake_case keys to support legacy or manual DB entries.
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = rows.reduce((acc, r) => {
      acc[r.key] = r.value;
      return acc;
    }, {} as Record<string, string>);

    // Helper to get value checking both camel and snake case
    const get = (camel: string, snake: string, fallback: string) => {
      return map[camel] ?? map[snake] ?? fallback;
    };

    const copyrightText =
      get("copyrightText", "copyright_text", "") ||
      get("footerCopyright", "footer_copyright", "") ||
      DEFAULT_SETTINGS.copyrightText;

    const settings: SiteSettings = {
      siteName: get("siteName", "site_name", DEFAULT_SETTINGS.siteName),
      siteDescription: get("siteDescription", "site_description", DEFAULT_SETTINGS.siteDescription),
      siteLogo: get("siteLogo", "site_logo", DEFAULT_SETTINGS.siteLogo),
      favicon: get("favicon", "favicon", DEFAULT_SETTINGS.favicon),
      primaryColor: get("primaryColor", "primary_color", DEFAULT_SETTINGS.primaryColor),
      secondaryColor: get("secondaryColor", "secondary_color", DEFAULT_SETTINGS.secondaryColor),
      accentColor: get("accentColor", "accent_color", DEFAULT_SETTINGS.accentColor),
      backgroundColor: get("backgroundColor", "background_color", DEFAULT_SETTINGS.backgroundColor),
      textColor: get("textColor", "text_color", DEFAULT_SETTINGS.textColor),
      footerContact: get("footerContact", "footer_contact", DEFAULT_SETTINGS.footerContact),
      address: get("address", "address", DEFAULT_SETTINGS.address),
      email: get("email", "email", DEFAULT_SETTINGS.email),
      whatsapp: get("whatsapp", "whatsapp", DEFAULT_SETTINGS.whatsapp),
      telegram: get("telegram", "telegram", DEFAULT_SETTINGS.telegram),
      copyrightText,
      footerCopyright: copyrightText,
      socialLinks: DEFAULT_SETTINGS.socialLinks,
    };

    const socialRaw = map.socialLinks || map.social_links;
    if (socialRaw) {
      try {
        settings.socialLinks = JSON.parse(socialRaw);
      } catch (e) {
        console.warn("Failed to parse social links JSON:", socialRaw);
      }
    }

    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Called by the admin settings API after a successful save.
 */
export function invalidateSettingsCache() {
  revalidatePath("/", "layout");
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
  const entries = Object.entries(settings);
  if (entries.length === 0) return [];

  // Use transaction to avoid connection pool exhaustion
  return prisma.$transaction(
    entries.map(([key, value]) => {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      return prisma.siteSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    })
  );
}
