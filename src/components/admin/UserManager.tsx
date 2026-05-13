"use client";

import { 
  Users, Search, Filter, MoreVertical, 
  Wallet, Calendar, User as UserIcon,
  CheckCircle2, XCircle, ChevronRight,
  ArrowUpRight, ArrowDownLeft, ShoppingBag
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

import { 
  Users, Search, Filter, MoreVertical, 
  Wallet, Calendar, User as UserIcon,
  CheckCircle2, XCircle, ChevronRight,
  ArrowUpRight, ArrowDownLeft, ShoppingBag
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { WalletManager } from "./WalletManager";

interface User {
  id: string;
  username: string;
  email: string;
  walletBalance: any;
  isActive: boolean;
  createdAt: Date;
  _count: { orders: number };
}

export function UserManager({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleWalletUpdate = () => {
    // Refresh user list to show new balances
    window.location.reload();
  };

  return (
    <>
      <div className="vault-card overflow-hidden border-border-default">
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated/50 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                <th className="px-6 py-5">User Profile</th>
                <th className="px-6 py-5">Wallet Balance</th>
                <th className="px-6 py-5">Orders</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Joined</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-surface-elevated/30 transition-all">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border-default flex items-center justify-center text-xs font-bold text-primary uppercase overflow-hidden">
                        {user.username.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{user.username}</p>
                        <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-foreground">
                      <Wallet size={14} className="text-primary" />
                      <span className="text-sm font-bold">₦{Number(user.walletBalance).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-text-secondary">{user._count.orders} Purchase(s)</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`status-badge inline-block ${user.isActive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar size={12} />
                      <span className="text-[11px] font-bold">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-2.5 bg-primary/10 text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-border-default">
          {users.map((user) => (
            <div key={user.id} className="p-6 active:bg-surface-elevated transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border-default flex items-center justify-center text-sm font-bold text-primary uppercase">
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
              <div className="grid grid-cols-2 gap-4 py-4 bg-surface-elevated/50 rounded-2xl px-4 border border-border-default">
                 <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-base font-bold text-foreground">₦{Number(user.walletBalance).toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Joined</p>
                    <p className="text-xs font-bold text-text-secondary">{format(new Date(user.createdAt), 'MMM yyyy')}</p>
                 </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    <ShoppingBag size={12} className="text-primary" />
                    {user._count.orders} Orders Total
                 </div>
                 <button 
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs border border-primary/20"
                  onClick={() => setSelectedUser(user)}
                 >
                    Manage Wallet
                    <ArrowUpRight size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="p-20 text-center text-text-muted">
            <Users size={64} className="mx-auto mb-6 opacity-10 text-foreground" />
            <p>No customers found matching your criteria.</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <WalletManager 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onUpdate={handleWalletUpdate} 
        />
      )}
    </>
  );
}
