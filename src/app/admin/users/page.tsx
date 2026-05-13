import prisma from "@/lib/prisma";
import { 
  Users, Search, Filter, MoreVertical, 
  Wallet, Calendar, User as UserIcon,
  CheckCircle2, XCircle, ChevronRight,
  ArrowUpRight, ArrowDownLeft
} from "lucide-react";
import { format } from "date-fns";

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
          <h1 className="text-3xl font-bold font-syne text-white tracking-tight">Users & Wallets</h1>
          <p className="text-text-secondary mt-1">Monitor account activity and manage financial balances.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Users</p>
                <p className="text-sm font-bold text-white">{users.length}</p>
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
            className="w-full bg-surface border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="md:col-span-4">
          <button className="w-full h-full flex items-center justify-center gap-2 px-4 py-4 bg-surface-elevated text-text-muted hover:text-white rounded-2xl font-bold text-sm border border-white/5 transition-all">
            <Filter size={18} />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Users View */}
      <div className="vault-card overflow-hidden">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                <th className="px-6 py-5">User Profile</th>
                <th className="px-6 py-5">Wallet Balance</th>
                <th className="px-6 py-5">Orders</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-white/2 transition-all">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-raised border border-white/10 flex items-center justify-center text-xs font-bold text-primary uppercase overflow-hidden">
                        {user.username.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{user.username}</p>
                        <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-white">
                      <Wallet size={14} className="text-primary" />
                      <span className="text-sm font-bold">₦{Number(user.walletBalance).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-text-secondary">{user._count.orders} Purchase(s)</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`status-badge ${user.isActive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar size={12} />
                      <span className="text-[11px] font-bold">{format(user.createdAt, 'MMM d, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2.5 bg-primary/10 text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-white/5">
          {users.map((user) => (
            <div key={user.id} className="p-6 active:bg-white/5 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-white/10 flex items-center justify-center text-sm font-bold text-primary uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground truncate">{user.username}</h3>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                </div>
                <span className={`status-badge ${user.isActive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                  {user.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 bg-white/2 rounded-2xl px-4 border border-white/5">
                 <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-base font-bold text-white">₦{Number(user.walletBalance).toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Joined</p>
                    <p className="text-xs font-bold text-text-secondary">{format(user.createdAt, 'MMM yyyy')}</p>
                 </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    <ShoppingBagIcon size={12} className="text-primary" />
                    {user._count.orders} Orders Total
                 </div>
                 <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs border border-primary/20">
                    Manage Wallet
                    <ArrowUpRight size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="p-20 text-center text-text-muted">
            <Users size={64} className="mx-auto mb-6 opacity-10" />
            <p>No customers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const ShoppingBagIcon = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
