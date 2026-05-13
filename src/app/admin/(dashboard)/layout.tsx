import { redirect } from "next/navigation";
import { getAdminFromRequest } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminStyles } from "@/components/admin/styles";

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
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-primary/30">
      <AdminStyles />
      {/* Sidebar - handles its own responsiveness */}
      <AdminSidebar settings={settings} adminName={admin.username} />

      {/* Main Content Area */}
      <main className="lg:pl-[280px] pt-16 lg:pt-0 transition-all duration-300">
        <div className="min-h-screen p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
