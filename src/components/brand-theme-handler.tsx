"use client";

import { useEffect } from "react";

interface BrandThemeHandlerProps {
  primaryColor: string;
  secondaryColor: string;
}

export function BrandThemeHandler({ primaryColor, secondaryColor }: BrandThemeHandlerProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--color-primary-hover", `${primaryColor}dd`);
    root.style.setProperty("--color-secondary", secondaryColor);
  }, [primaryColor, secondaryColor]);

  return null;
}
