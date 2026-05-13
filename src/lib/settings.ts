import { prisma } from "./prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { SiteSettings, DEFAULT_SETTINGS } from "./settings-client";

export * from "./settings-client";

/**
 * Fetch site settings directly from the DB.
 * SERVER ONLY
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    // Add a 5s timeout to the database fetch to prevent hanging the whole app
    const timeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Settings fetch timeout")), 5000)
    );

    const rows = await Promise.race([
      prisma.siteSetting.findMany(),
      timeout
    ]) as any[];

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
      logoLight: get("logoLight", "logo_light_url", DEFAULT_SETTINGS.logoLight),
      logoDark: get("logoDark", "logo_dark_url", DEFAULT_SETTINGS.logoDark),
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
      if (typeof socialRaw === "string" && socialRaw !== "[object Object]") {
        try {
          settings.socialLinks = JSON.parse(socialRaw);
        } catch (e) {
          console.warn("Failed to parse social links JSON string:", socialRaw);
        }
      } else if (typeof socialRaw === "object" && socialRaw !== null) {
        settings.socialLinks = socialRaw;
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
 * SERVER ONLY
 */
export function invalidateSettingsCache() {
  revalidateTag('site-settings', 'max');
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
