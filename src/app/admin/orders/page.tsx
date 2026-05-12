"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ExternalLink,
  User,
  ShoppingBag,
  Calendar,
  CreditCard,
  ChevronLeft,
  Loader2,
  RefreshCw
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?page=${page}&status=${status}&search=${search}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, status, search]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const result = await Swal.fire({
      title: "Update Status?",
      text: `Are you sure you want to mark this order as ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      confirmButtonColor: "var(--primary)",
      background: "var(--surface)",
      color: "var(--foreground)"
    });

    if (result.isConfirmed) {
      setIsUpdating(orderId);
      try {
        const res = await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status: newStatus }),
          credentials: "include"
        });
        if (res.ok) {
          fetchOrders();
          Swal.fire({
            title: "Success",
            text: "Order status updated",
            icon: "success",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            background: "var(--surface)",
            color: "var(--foreground)"
          });
        }
      } catch (err) {
        Swal.fire("Error", "Failed to update status", "error");
      } finally {
        setIsUpdating(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-full text-xs font-black uppercase">Completed</span>;
      case "pending":
        return <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-black uppercase">Pending</span>;
      case "failed":
        return <span className="px-3 py-1 bg-error/10 text-error border border-error/20 rounded-full text-xs font-black uppercase">Failed</span>;
      default:
        return <span className="px-3 py-1 bg-surface-elevated text-text-muted border border-border-default rounded-full text-xs font-black uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground tracking-tight">Order Management</h1>
          <p className="text-text-secondary mt-1">Monitor and manage all customer transactions.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-border-default border border-border-default rounded-xl font-bold text-foreground transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border-default p-6 rounded-2xl">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Total Orders</p>
          <p className="text-2xl font-black text-foreground">{total}</p>
        </div>
        <div className="bg-surface border border-border-default p-6 rounded-2xl">
          <p className="text-xs font-bold text-success uppercase tracking-widest mb-1">Completed</p>
          <p className="text-2xl font-black text-foreground">{orders.filter(o => o.status === 'completed').length} <span className="text-xs text-text-muted font-medium">on this page</span></p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface border border-border-default p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID, Email or Username..." 
            className="w-full pl-12 pr-4 py-3 bg-surface-elevated border border-border-default rounded-xl text-foreground focus:outline-none focus:border-primary transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "completed", "pending", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-xl font-bold text-sm capitalize transition-all border ${
                status === s 
                  ? "bg-foreground text-background border-foreground shadow-lg" 
                  : "bg-surface-elevated text-text-secondary border-border-default hover:border-text-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface border border-border-default rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-elevated/50 border-b border-border-default">
                <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Order Details</th>
                <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={40} className="animate-spin text-primary" />
                      <p className="text-text-muted font-bold">Fetching latest orders...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-text-muted font-bold text-lg">No orders found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-elevated/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-foreground font-bold">{order.id.substring(0, 8)}...</span>
                        <span className="text-[10px] text-text-muted uppercase font-bold tracking-tighter mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-text-secondary">
                          <User size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{order.user.username}</span>
                          <span className="text-xs text-text-muted">{order.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{order.product.name}</span>
                        <span className="text-[10px] text-text-muted font-bold uppercase">{order.quantity} Account(s)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-primary">₦{Number(order.totalAmount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-text-secondary hover:text-primary transition-colors bg-surface border border-border-default rounded-lg hover:border-primary/50"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        <div className="flex gap-1 border-l border-border-default pl-2 ml-1">
                          {order.status === "pending" && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, "completed")}
                              disabled={isUpdating === order.id}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-all"
                              title="Mark Completed"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          {order.status !== "failed" && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, "failed")}
                              disabled={isUpdating === order.id}
                              className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                              title="Mark Failed"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 bg-surface-elevated/30 border-t border-border-default flex items-center justify-between">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
              Page {page} of {pages} ({total} total orders)
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(prev => prev - 1)}
                className="p-2 bg-surface border border-border-default rounded-lg disabled:opacity-30 hover:border-text-muted transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={page === pages}
                onClick={() => setPage(prev => prev + 1)}
                className="p-2 bg-surface border border-border-default rounded-lg disabled:opacity-30 hover:border-text-muted transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border-default w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-surface-elevated/50 p-6 border-b border-border-default flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-foreground">Order Details</h2>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">#{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-text-secondary hover:text-foreground">
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-elevated rounded-lg text-text-secondary"><User size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">Customer</p>
                    <p className="text-sm font-bold text-foreground">{selectedOrder.user.username}</p>
                    <p className="text-xs text-text-secondary">{selectedOrder.user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-elevated rounded-lg text-text-secondary"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">Date Purchased</p>
                    <p className="text-sm font-bold text-foreground">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-text-secondary">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-elevated rounded-lg text-text-secondary"><ShoppingBag size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">Product</p>
                    <p className="text-sm font-bold text-foreground">{selectedOrder.product.name}</p>
                    <p className="text-xs text-text-secondary">{selectedOrder.quantity} Unit(s)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-surface-elevated rounded-lg text-text-secondary"><CreditCard size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">Amount Paid</p>
                    <p className="text-sm font-black text-primary">₦{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                    <p className="text-xs text-text-secondary">₦{Number(selectedOrder.unitPrice).toLocaleString()} / unit</p>
                  </div>
                </div>
              </div>

              {/* Delivered Credentials Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={16} /> Delivered Credentials
                </h3>
                <div className="space-y-2">
                  {selectedOrder.orderItems.length > 0 ? (
                    selectedOrder.orderItems.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 bg-surface-elevated rounded-xl border border-border-default">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Item #{idx + 1}</span>
                          {item.isRevealed ? (
                             <span className="text-[10px] font-bold text-success uppercase">User Viewed</span>
                          ) : (
                             <span className="text-[10px] font-bold text-text-muted uppercase">Not Viewed</span>
                          )}
                        </div>
                        <p className="font-mono text-sm text-foreground break-all bg-background p-3 rounded border border-border-default select-all">
                          {item.productItem.credentialText}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-error/5 border border-error/10 rounded-xl">
                      <p className="text-error font-bold text-sm">No items linked to this order. This might be a manual placeholder order.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-surface-elevated/50 border-t border-border-default flex gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-6 py-3 bg-surface border border-border-default text-foreground font-bold rounded-xl hover:border-text-muted transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
