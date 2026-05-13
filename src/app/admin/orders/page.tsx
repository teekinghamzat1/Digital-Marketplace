import prisma from "@/lib/prisma";
import { 
  ShoppingBag, Search, Filter, Download, 
  ChevronRight, MoreVertical, Eye, Calendar,
  User as UserIcon, Package as PackageIcon, ExternalLink
} from "lucide-react";
import { format } from "date-fns";

async function getOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      product: true
    }
  });
}

export default async function OrdersManagement() {
  const orders = await getOrders();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-white tracking-tight">Order Management</h1>
          <p className="text-text-secondary mt-1">Track, manage, and process all customer purchases.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm border border-white/5 transition-all">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer, or Product..." 
            className="w-full bg-surface border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="md:col-span-3">
          <select className="w-full bg-surface border border-white/5 rounded-2xl px-4 py-4 text-sm focus:border-primary outline-none transition-all appearance-none cursor-pointer">
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <button className="w-full h-full flex items-center justify-center gap-2 px-4 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
            <Filter size={18} />
            More Filters
          </button>
        </div>
      </div>

      {/* Status Filter Tabs (Mobile Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All Orders', 'Pending', 'Completed', 'Failed', 'Refunded'].map((tab, idx) => (
          <button 
            key={idx}
            className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              idx === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-elevated text-text-muted hover:text-white border border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders View */}
      <div className="vault-card overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Product</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="group hover:bg-white/2 transition-all">
                  <td className="px-6 py-5">
                    <div className="font-mono text-xs text-primary font-bold">#{order.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-raised border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                        {order.user.username.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{order.user.username}</p>
                        <p className="text-[10px] text-text-muted truncate">{order.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <PackageIcon size={14} className="text-text-muted" />
                      <span className="text-sm text-text-secondary">{order.product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-white">₦{Number(order.totalAmount).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`status-badge ${
                      order.status === 'completed' ? 'bg-success/15 text-success' : 
                      order.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar size={12} />
                      <span className="text-[11px] font-bold">{format(order.createdAt, 'MMM d, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="lg:hidden divide-y divide-white/5">
          {orders.map((order) => (
            <div key={order.id} className="p-5 active:bg-white/5 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-xs text-primary font-bold">#{order.id.slice(0, 8)}</div>
                <span className={`status-badge ${
                  order.status === 'completed' ? 'bg-success/15 text-success' : 
                  order.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-3 mb-5">
                 <div className="flex items-center gap-3">
                   <PackageIcon size={16} className="text-text-muted" />
                   <div>
                      <p className="text-sm font-bold text-white">{order.product.name}</p>
                      <p className="text-xs text-text-muted">{order.quantity} Account(s)</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <UserIcon size={16} className="text-text-muted" />
                   <p className="text-sm text-text-secondary">{order.user.username}</p>
                 </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar size={14} />
                  <span className="text-[11px] font-bold">{format(order.createdAt, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white mr-2">₦{Number(order.totalAmount).toLocaleString()}</span>
                  <button className="p-2.5 bg-surface-raised border border-white/5 rounded-xl text-primary shadow-lg">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="p-16 text-center text-text-muted">
            <ShoppingBag size={64} className="mx-auto mb-6 opacity-10" />
            <h3 className="text-lg font-bold text-white mb-2">No Orders Found</h3>
            <p className="text-sm max-w-xs mx-auto">Wait for customers to start purchasing your digital products.</p>
          </div>
        )}
      </div>

      {/* Pagination (Simplified for Mobile) */}
      <div className="flex items-center justify-between p-2">
        <button className="px-6 py-2.5 bg-surface-elevated text-text-muted rounded-xl text-sm font-bold hover:text-white transition-colors border border-white/5">
          Previous
        </button>
        <div className="hidden md:flex items-center gap-2">
          <span className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl font-bold">1</span>
          <span className="w-10 h-10 flex items-center justify-center hover:bg-white/5 text-text-muted rounded-xl font-bold cursor-pointer">2</span>
          <span className="w-10 h-10 flex items-center justify-center hover:bg-white/5 text-text-muted rounded-xl font-bold cursor-pointer">3</span>
        </div>
        <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
          Next Page
        </button>
      </div>
    </div>
  );
}
