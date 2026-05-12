"use client";

import { useEffect } from "react";
import { SiteSettings } from "@/lib/settings";

export function BrandThemeHandler({ settings }: { settings: SiteSettings }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", settings.primaryColor);
    root.style.setProperty("--color-primary-hover", `${settings.primaryColor}dd`);
    root.style.setProperty("--color-secondary", settings.secondaryColor);
    if (settings.accentColor) root.style.setProperty("--color-accent", settings.accentColor);
    if (settings.backgroundColor) root.style.setProperty("--color-background", settings.backgroundColor);
    if (settings.textColor) root.style.setProperty("--color-text", settings.textColor);
  }, [settings]);

  return null;
}
