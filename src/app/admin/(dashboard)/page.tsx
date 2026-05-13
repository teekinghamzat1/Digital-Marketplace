import prisma from "@/lib/prisma";
import { 
  TrendingUp, TrendingDown, DollarSign, 
  ShoppingBag, Users, MessageSquareWarning,
  ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { format } from "date-fns";

async function getStats() {
  const [totalRevenue, totalOrders, activeUsers, openTickets, recentOrders, recentUsers] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'completed' }
    }),
    prisma.order.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.contactTicket.count({ where: { status: 'open' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, product: true }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    revenue: Number(totalRevenue._sum.totalAmount || 0),
    orders: totalOrders,
    users: activeUsers,
    tickets: openTickets,
    recentOrders,
    recentUsers
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "TOTAL REVENUE", value: `₦${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", trend: "+12.5%", positive: true },
    { label: "TOTAL ORDERS", value: stats.orders, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", trend: "+5.2%", positive: true },
    { label: "ACTIVE USERS", value: stats.users, icon: Users, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", trend: "+8.1%", positive: true },
    { label: "OPEN TICKETS", value: stats.tickets, icon: MessageSquareWarning, color: "text-danger", bg: "bg-danger/10", border: "border-danger/20", trend: "-2", positive: false, isUrgent: stats.tickets > 0 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-syne text-white tracking-tight">Overview Dashboard</h1>
        <p className="text-text-secondary mt-1">Real-time performance metrics and recent activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card, i) => (
          <div key={i} className="vault-card p-5 md:p-6 relative group overflow-hidden">
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-30 ${card.color.replace('text', 'bg')}`} />
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${card.positive ? 'text-success' : 'text-danger'}`}>
                {card.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">{card.label}</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{card.value}</h3>
            {card.isUrgent && (
              <span className="absolute top-4 right-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Charts & Activity Split */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Orders Table */}
        <div className="xl:col-span-3 vault-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold font-syne flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" />
              Recent Orders
            </h2>
            <button className="text-xs font-bold text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-primary">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{order.user.username}</p>
                      <p className="text-[10px] text-text-muted">{order.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{order.product.name}</td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${
                        order.status === 'completed' ? 'bg-success/15 text-success' : 
                        order.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">₦{Number(order.totalAmount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stats.recentOrders.length === 0 && (
            <div className="p-12 text-center text-text-muted">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
              <p>No orders recorded yet.</p>
            </div>
          )}
        </div>

        {/* Recent Users List */}
        <div className="xl:col-span-2 vault-card">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold font-syne flex items-center gap-2">
              <Users size={20} className="text-green-400" />
              New Signups
            </h2>
            <Clock size={16} className="text-text-muted" />
          </div>
          <div className="p-6 space-y-6">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-surface-raised rounded-full flex items-center justify-center text-primary font-bold border border-white/5 group-hover:border-primary/50 transition-all">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{user.username}</p>
                  <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">₦{Number(user.walletBalance).toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">Balance</p>
                </div>
              </div>
            ))}
            {stats.recentUsers.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <p>No users found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
