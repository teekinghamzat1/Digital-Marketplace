"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { SiteSettings } from "@/lib/settings-client";

export function WhatsAppButton({ settings: propSettings }: { settings?: SiteSettings }) {
  const pathname = usePathname();
  const [fetchedSettings, setFetchedSettings] = useState<SiteSettings | undefined>(undefined);

  useEffect(() => {
    if (!propSettings) {
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => setFetchedSettings(data))
        .catch(() => { });
    }
  }, [propSettings]);

  const settings = propSettings || fetchedSettings;

  if (pathname.startsWith("/admin")) return null;
  if (!settings?.whatsapp) return null;

  const whatsappNumber = settings.whatsapp.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 left-8 z-[90] group flex items-center gap-3 transition-all duration-500 hover:scale-105 active:scale-95"
      aria-label="Contact on WhatsApp"
    >
      <div className="relative">
        <div className="absolute -inset-4 bg-success/20 rounded-full blur-xl group-hover:bg-success/30 animate-pulse transition-all"></div>
        <div className="relative bg-success text-white p-4 rounded-2xl shadow-2xl shadow-success/40 border border-white/20 group-hover:rotate-12 transition-transform duration-500">
          <MessageCircle size={28} />
        </div>
      </div>
      <div className="bg-surface/80 backdrop-blur-md border border-border-default py-2.5 px-5 rounded-2xl shadow-xl opacity-0 translate-x-[-20px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 pointer-events-none">
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest leading-none mb-1">Need Help?</p>
        <p className="text-sm font-bold text-foreground leading-none">Chat with Admin</p>
      </div>
    </a>
  );
}
