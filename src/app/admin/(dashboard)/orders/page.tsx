import prisma from "@/lib/prisma";
import { 
  Search, Filter, Download, 
} from "lucide-react";
import { OrderList } from "@/components/admin/OrderList";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-foreground tracking-tight">Order Management</h1>
          <p className="text-text-secondary mt-1">Track, manage, and process all customer purchases.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-elevated hover:bg-background text-foreground rounded-xl font-bold text-sm border border-border-default transition-all">
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
            className="w-full bg-surface-elevated border border-border-default rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-primary outline-none transition-all text-foreground"
          />
        </div>
        <div className="md:col-span-3">
          <select className="w-full bg-surface-elevated border border-border-default rounded-2xl px-4 py-4 text-sm focus:border-primary outline-none transition-all appearance-none cursor-pointer text-foreground">
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

      {/* Order List (Client Component) */}
      <OrderList initialOrders={orders as any} />

      {/* Pagination (Simplified) */}
      <div className="flex items-center justify-between p-2">
        <button className="px-6 py-2.5 bg-surface-elevated text-text-muted rounded-xl text-sm font-bold hover:text-foreground transition-colors border border-border-default">
          Previous
        </button>
        <button className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
          Next Page
        </button>
      </div>
    </div>
  );
}
