import { redirect } from "next/navigation";
import { getAdminFromRequest } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminStyles } from "@/components/admin/styles";
import { AdminHeader } from "@/components/admin/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    redirect("/admin/login");
  }

  const settings = await getSettings();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-300">
      <AdminStyles />
      
      {/* Sidebar - Fixed on desktop */}
      <AdminSidebar settings={settings} adminName={admin.username} />

      {/* Header - Fixed on top */}
      <AdminHeader adminName={admin.username} />

      {/* Main Content Area */}
      <main className="admin-main overflow-x-hidden">
        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
