"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings, Save, Globe, Palette, Phone, Share2, 
  Image as ImageIcon, X, Eye, Check, Loader2,
  Shield, Search, Trash2, Upload
} from "lucide-react";
import { SiteSettings, getLogoForMode } from "@/lib/settings-client";

// ─── Tiny inline color picker swatch ────────────────────────────────────────
function ColorSwatch({
  label, value, onChange
}: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 p-3 bg-surface-elevated border border-border-default hover:border-primary/50 rounded-xl transition-all w-full group"
        >
          <div
            className="w-8 h-8 rounded-lg shadow-inner border border-white/20 transition-transform group-hover:scale-110 shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-sm text-foreground flex-1 text-left">{value}</span>
          <Eye size={14} className="text-text-muted" />
        </button>

        {open && (
          <div className="absolute top-full mt-2 left-0 z-50 bg-surface border border-border-default rounded-2xl shadow-2xl p-4 w-64 animate-in fade-in zoom-in-95 duration-200">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-36 rounded-xl cursor-pointer border-none bg-transparent"
              style={{ padding: 0 }}
            />
            <div className="mt-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md border border-border-default" style={{ backgroundColor: value }} />
              <span className="font-mono text-sm text-foreground flex-1">{value}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Check size={14} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-8 gap-1.5">
              {["#E87722","#ef4444","#8b5cf6","#3b82f6","#10b981","#f59e0b","#ec4899","#0ea5e9",
                "#1f2937","#111827","#ffffff","#f9fafb","#6366f1","#14b8a6","#84cc16","#fb923c"].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange(c)}
                  className="w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live Theme Preview Strip ─────────────────────────────────────────────────
function ThemePreview({ colors, settings }: { colors: Record<string, string>, settings: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Light Preview */}
      <div className="vault-card bg-white p-4 space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Light Mode Preview</p>
        <div className="flex items-center justify-between border-b pb-3">
          <div className="h-6 w-24 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
             {getLogoForMode(settings, 'light') ? (
               <img src={getLogoForMode(settings, 'light')!} alt="Logo" className="h-full w-auto object-contain" />
             ) : (
               <span className="text-[10px] font-bold text-slate-400">{settings.siteName}</span>
             )}
          </div>
          <div className="flex gap-2">
             <div className="w-4 h-4 rounded-full bg-slate-100" />
             <div className="w-8 h-4 rounded-md bg-slate-100" />
          </div>
        </div>
        <button className="w-full py-2 rounded-lg text-sm font-bold text-white shadow-lg" style={{ backgroundColor: colors.primaryColor }}>
          Primary Button
        </button>
      </div>

      {/* Dark Preview */}
      <div className="vault-card bg-[#0f0f0f] p-4 space-y-4 border-white/10">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Dark Mode Preview</p>
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="h-6 w-24 bg-white/5 rounded flex items-center justify-center overflow-hidden">
             {getLogoForMode(settings, 'dark') ? (
               <img src={getLogoForMode(settings, 'dark')!} alt="Logo" className="h-full w-auto object-contain" />
             ) : (
               <span className="text-[10px] font-bold text-white/30">{settings.siteName}</span>
             )}
          </div>
          <div className="flex gap-2">
             <div className="w-4 h-4 rounded-full bg-white/10" />
             <div className="w-8 h-4 rounded-md bg-white/10" />
          </div>
        </div>
        <button className="w-full py-2 rounded-lg text-sm font-bold text-white shadow-lg shadow-primary/20" style={{ backgroundColor: colors.primaryColor }}>
          Primary Button
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all placeholder:text-text-muted text-sm font-medium";

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<string>("branding");
  const [settings, setSettings] = useState<any>({
    siteName: "", siteDescription: "", siteLogo: "", logoLight: "", logoDark: "", favicon: "",
    primaryColor: "#E87722", secondaryColor: "#fb923c",
    accentColor: "#f59e0b", backgroundColor: "#0f0f0f", textColor: "#ffffff",
    email: "", whatsapp: "", telegram: "", footerContact: "", address: "",
    copyrightText: "",
    socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "" },
    seoTitle: "", seoDescription: "", seoKeywords: "", ogImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.socialLinks && typeof data.socialLinks === "string") {
          try { data.socialLinks = JSON.parse(data.socialLinks); } catch { data.socialLinks = {}; }
        }
        setSettings((prev: any) => ({ ...prev, ...data, socialLinks: { ...prev.socialLinks, ...(data.socialLinks || {}) } }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: any) => setSettings((p: any) => ({ ...p, [key]: value }));
  const setSocial = (k: string, v: string) => setSettings((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast("success", "Website settings updated successfully!");
      } else {
        const d = await res.json();
        showToast("error", d.error || "Save failed");
      }
    } catch (err: any) {
      showToast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("error", "Max file size is 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => set(key, reader.result as string);
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-surface-elevated rounded-xl" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-surface-elevated rounded-2xl" />)}
    </div>
  );

  const tabs = [
    { id: "branding", label: "Branding", icon: Globe },
    { id: "contact", label: "Contact & Footer", icon: Phone },
    { id: "visual", label: "Visual Style", icon: Palette },
    { id: "seo", label: "SEO & Meta", icon: Search },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="max-w-5xl space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-foreground tracking-tight">Site Settings</h1>
          <p className="text-text-secondary mt-1">Configure your platform's global properties and identity.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="hidden md:flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Update Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-elevated rounded-2xl overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-text-muted hover:text-foreground hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-white text-sm animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "bg-success" : "bg-error"
        }`}>
          {toast.type === "success" ? <Check size={18} /> : <X size={18} />}
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {activeTab === "branding" && (
          <section className="vault-card p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Site Name">
                <input value={settings.siteName} onChange={e => set("siteName", e.target.value)} className={inputCls} placeholder="Digital Marketplace" />
              </Field>
              <Field label="Support Email">
                <input type="email" value={settings.email} onChange={e => set("email", e.target.value)} className={inputCls} placeholder="support@marketplace.com" />
              </Field>
            </div>
            <Field label="Site Description">
              <textarea value={settings.siteDescription} onChange={e => set("siteDescription", e.target.value)} className={`${inputCls} h-24 resize-none`} placeholder="The most trusted digital marketplace..." />
            </Field>

            {/* Dual Logo Upload */}
            <div className="space-y-6">
               <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Brand Logos</p>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Light Logo */}
                  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Light Mode Logo</span>
                        <span className="text-[10px] text-text-muted">Shown on dark backgrounds</span>
                     </div>
                     <div className="h-32 bg-white/5 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                        {settings.logoLight ? (
                           <>
                             <img src={settings.logoLight} alt="Light logo" className="h-full w-auto object-contain p-4" />
                             <button type="button" onClick={() => set("logoLight", "")} className="absolute top-2 right-2 p-1.5 bg-danger text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                               <X size={14} />
                             </button>
                           </>
                        ) : (
                           <div className="text-center text-text-muted">
                              <ImageIcon size={24} className="mx-auto mb-2 opacity-20" />
                              <p className="text-[10px] font-bold">No Image</p>
                           </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleLogoUpload("logoLight", e)} />
                     </div>
                  </div>

                  {/* Dark Logo */}
                  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Dark Mode Logo</span>
                        <span className="text-[10px] text-text-muted">Shown on light backgrounds</span>
                     </div>
                     <div className="h-32 bg-white/5 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                        {settings.logoDark ? (
                           <>
                             <img src={settings.logoDark} alt="Dark logo" className="h-full w-auto object-contain p-4" />
                             <button type="button" onClick={() => set("logoDark", "")} className="absolute top-2 right-2 p-1.5 bg-danger text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                               <X size={14} />
                             </button>
                           </>
                        ) : (
                           <div className="text-center text-text-muted">
                              <ImageIcon size={24} className="mx-auto mb-2 opacity-20" />
                              <p className="text-[10px] font-bold">No Image</p>
                           </div>
                        )}
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleLogoUpload("logoDark", e)} />
                     </div>
                  </div>
               </div>
               <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-start gap-3">
                  <ImageIcon size={16} className="text-primary mt-0.5" />
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                     <span className="font-bold text-primary">Pro Tip:</span> If a specific variant is missing, the other will be used as a fallback. For transparent headers, upload a PNG with contrasting colors.
                  </p>
               </div>
            </div>
          </section>
        )}

        {activeTab === "contact" && (
          <section className="vault-card p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="WhatsApp Number">
                <input value={settings.whatsapp} onChange={e => set("whatsapp", e.target.value)} className={inputCls} placeholder="+2348012345678" />
              </Field>
              <Field label="Telegram Link">
                <input value={settings.telegram} onChange={e => set("telegram", e.target.value)} className={inputCls} placeholder="https://t.me/yourchannel" />
              </Field>
            </div>
            <Field label="Address">
              <textarea value={settings.address} onChange={e => set("address", e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Lagos, Nigeria" />
            </Field>
            <Field label="Footer Contact Info">
              <textarea value={settings.footerContact} onChange={e => set("footerContact", e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Business hours, additional notes..." />
            </Field>
            <Field label="Copyright Text">
              <div className="space-y-2">
                <input value={settings.copyrightText} onChange={e => set("copyrightText", e.target.value)} className={inputCls} placeholder={`© ${new Date().getFullYear()} {site_name}. All rights reserved.`} />
                <p className="text-[10px] text-text-muted">Use <code className="text-primary">{`{site_name}`}</code> as a placeholder for dynamic updates.</p>
              </div>
            </Field>
            
            <div className="pt-4 space-y-4">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Social Media Links</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["facebook", "twitter", "instagram", "linkedin"].map(p => (
                  <div key={p} className="relative group">
                    <input
                      value={settings.socialLinks[p] || ""}
                      onChange={e => setSocial(p, e.target.value)}
                      className={`${inputCls} pl-10`}
                      placeholder={`https://${p}.com/yourpage`}
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                      <Share2 size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "visual" && (
          <section className="vault-card p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ColorSwatch label="Primary Color" value={settings.primaryColor} onChange={v => set("primaryColor", v)} />
              <ColorSwatch label="Secondary Color" value={settings.secondaryColor} onChange={v => set("secondaryColor", v)} />
              <ColorSwatch label="Accent Color" value={settings.accentColor} onChange={v => set("accentColor", v)} />
              <ColorSwatch label="Background" value={settings.backgroundColor} onChange={v => set("backgroundColor", v)} />
              <ColorSwatch label="Text Color" value={settings.textColor} onChange={v => set("textColor", v)} />
            </div>
            
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Live Multi-Mode Preview</p>
              <ThemePreview colors={settings} settings={settings} />
            </div>
          </section>
        )}

        {activeTab === "seo" && (
          <section className="vault-card p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Global SEO Title">
                <input value={settings.seoTitle} onChange={e => set("seoTitle", e.target.value)} className={inputCls} placeholder="Marketplace | Buy Accounts Instantly" />
              </Field>
              <Field label="SEO Keywords">
                <input value={settings.seoKeywords} onChange={e => set("seoKeywords", e.target.value)} className={inputCls} placeholder="digital, marketplace, accounts, verified" />
              </Field>
            </div>
            <Field label="Meta Description">
              <textarea value={settings.seoDescription} onChange={e => set("seoDescription", e.target.value)} className={`${inputCls} h-24 resize-none`} placeholder="The best platform for purchasing verified digital assets..." />
            </Field>

            <div className="space-y-4">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Social Share Image (OG Image)</p>
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-4">
                <div className="h-48 bg-white/5 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative group">
                  {settings.ogImage ? (
                    <>
                      <img src={settings.ogImage} alt="OG Image" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => set("ogImage", "")} className="absolute top-4 right-4 p-2 bg-danger text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-text-muted">
                      <ImageIcon size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-wider">No OG Image Uploaded</p>
                      <p className="text-[10px] mt-1">Recommended size: 1200x630px</p>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleLogoUpload("ogImage", e)} />
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-start gap-3">
              <Search size={16} className="text-primary mt-0.5" />
              <p className="text-[11px] text-text-secondary leading-relaxed">
                <span className="font-bold text-primary">SEO Note:</span> Meta tags are automatically injected into the platform's header. Changes may take a few days to reflect on Google search results after saving.
              </p>
            </div>
          </section>
        )}

        {/* Floating Mobile Save Button */}
        <div className="fixed bottom-8 left-0 right-0 px-4 md:hidden z-50 pointer-events-none">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/40 border border-white/20 pointer-events-auto"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
