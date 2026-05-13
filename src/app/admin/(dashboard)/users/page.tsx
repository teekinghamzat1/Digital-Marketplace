import prisma from "@/lib/prisma";
import { 
  Users, Search, Filter, 
} from "lucide-react";
import { UserManager } from "@/components/admin/UserManager";

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  });
}

export default async function UsersWallets() {
  const users = await getUsers();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-foreground tracking-tight">Users & Wallets</h1>
          <p className="text-text-secondary mt-1">Monitor account activity and manage financial balances.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="p-3 bg-surface-elevated/50 border border-border-default rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Users</p>
                <p className="text-sm font-bold text-foreground">{users.length}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search by username, email, or wallet reference..." 
            className="w-full bg-surface-elevated border border-border-default rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-primary outline-none transition-all text-foreground"
          />
        </div>
        <div className="md:col-span-4">
          <button className="w-full h-full flex items-center justify-center gap-2 px-4 py-4 bg-surface-elevated text-text-muted hover:text-foreground rounded-2xl font-bold text-sm border border-border-default transition-all">
            <Filter size={18} />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Main Content (Client Component) */}
      <UserManager initialUsers={users as any} />
    </div>
  );
}
