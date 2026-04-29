"use client";

import { useState, useEffect } from "react";
import { Users, Wallet, Ban, CheckCircle, Search } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [walletData, setWalletData] = useState({ amount: "", type: "credit", description: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    if (!confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.username}?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}/toggle-status`, { 
      method: "POST",
      credentials: "include" 
    });
    if (res.ok) fetchUsers();
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/users/${selectedUser.id}/adjust-wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(walletData)
    });

    if (res.ok) {
      setWalletModalOpen(false);
      setWalletData({ amount: "", type: "credit", description: "" });
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground">User Management</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-elevated border border-border-default rounded-lg pl-10 pr-4 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-surface-elevated rounded-lg"></div>
          <div className="h-12 bg-surface-elevated rounded-lg"></div>
        </div>
      ) : (
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-elevated border-b border-border-default">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Orders</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-surface-elevated/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{user.username}</div>
                    <div className="text-xs text-text-muted">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-foreground">₦{Number(user.walletBalance).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{user._count.orders}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setSelectedUser(user); setWalletModalOpen(true); }}
                      className="text-text-secondary hover:text-primary transition-colors" 
                      title="Adjust Wallet"
                    >
                      <Wallet size={18} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user)} 
                      className={`transition-colors ${user.isActive ? 'text-text-secondary hover:text-error' : 'text-error hover:text-success'}`}
                      title={user.isActive ? 'Ban User' : 'Unban User'}
                    >
                      {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wallet Adjustment Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="vault-card w-full max-w-md p-8">
            <h2 className="text-2xl font-bold mb-2 font-[family-name:var(--font-syne)]">Adjust Wallet</h2>
            <p className="text-text-secondary text-sm mb-6">Modifying balance for <span className="font-bold text-foreground">{selectedUser?.username}</span></p>
            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Amount (₦)</label>
                  <input 
                    type="number" 
                    value={walletData.amount} 
                    onChange={(e) => setWalletData({...walletData, amount: e.target.value})}
                    className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground font-bold" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">Action</label>
                  <select 
                    value={walletData.type} 
                    onChange={(e) => setWalletData({...walletData, type: e.target.value})}
                    className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground"
                  >
                    <option value="credit">Add Funds</option>
                    <option value="debit">Deduct Funds</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5">Reason / Description</label>
                <input 
                  type="text" 
                  value={walletData.description} 
                  onChange={(e) => setWalletData({...walletData, description: e.target.value})}
                  className="w-full bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground"
                  placeholder="e.g. Refund for order #123"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setWalletModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-border-default font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-bold">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
