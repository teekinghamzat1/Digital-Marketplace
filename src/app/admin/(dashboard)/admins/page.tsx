import prisma from "@/lib/prisma";
import { ShieldAlert } from "lucide-react";
import { AdminManager } from "@/components/admin/AdminManager";

async function getAdmins() {
  return await prisma.admin.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
    }
  });
}

export default async function AdminsPage() {
  const admins = await getAdmins();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-foreground tracking-tight">Administrators</h1>
          <p className="text-text-secondary mt-1">Manage system administrators and their access.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="p-3 bg-surface-elevated/50 border border-border-default rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldAlert size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Admins</p>
                <p className="text-sm font-bold text-foreground">{admins.length}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content (Client Component) */}
      <AdminManager initialAdmins={admins as any} />
    </div>
  );
}
