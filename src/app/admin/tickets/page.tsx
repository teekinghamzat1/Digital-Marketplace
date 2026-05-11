"use client";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, ExternalLink, MessageSquare, ShoppingCart, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AdminTicketsPage() {
  const [activeTab, setActiveTab] = useState<"disputes" | "contact">("disputes");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [filter, activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "disputes" ? "/api/admin/tickets" : "/api/admin/contact-tickets";
      const url = filter ? `${endpoint}?status=${filter}` : endpoint;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const endpoint = activeTab === "disputes" ? "/api/admin/tickets" : "/api/admin/contact-tickets";
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
        credentials: "include",
      });

      if (res.ok) {
        Swal.fire({
          title: "Status Updated",
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteTicket = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This ticket will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const endpoint = activeTab === "disputes" ? "/api/admin/tickets" : "/api/admin/contact-tickets";
        const res = await fetch(`${endpoint}?id=${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (res.ok) {
          Swal.fire("Deleted!", "The ticket has been deleted.", "success");
          fetchTickets();
        }
      } catch (err) {
        console.error("Failed to delete ticket:", err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase tracking-wider"><Clock size={10} /> Open</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-bold uppercase tracking-wider"><Clock size={10} /> Pending</span>;
      case "resolved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider"><CheckCircle size={10} /> Resolved</span>;
      case "closed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-text-muted/10 text-text-muted text-[10px] font-bold uppercase tracking-wider">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-surface-elevated text-text-secondary text-[10px] uppercase font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-syne text-foreground tracking-tight">Support Center</h1>
          <p className="text-text-secondary mt-1">Manage user disputes and incoming contact messages.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-surface-elevated p-1 rounded-xl border border-border-default flex">
            <button
              onClick={() => { setActiveTab("disputes"); setFilter(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "disputes" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:text-foreground"
              }`}
            >
              <ShoppingCart size={16} />
              Order Disputes
            </button>
            <button
              onClick={() => { setActiveTab("contact"); setFilter(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "contact" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:text-foreground"
              }`}
            >
              <MessageSquare size={16} />
              Contact Messages
            </button>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-surface-elevated animate-pulse rounded-2xl border border-border-default/50" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="vault-card p-16 text-center border-dashed">
          <div className="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted">
            {activeTab === "disputes" ? <ShoppingCart size={40} /> : <MessageSquare size={40} />}
          </div>
          <h2 className="text-2xl font-bold text-foreground">No {activeTab === "disputes" ? "disputes" : "messages"} found</h2>
          <p className="text-text-secondary mt-2 max-w-sm mx-auto">Great news! There are no pending support items in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="bg-surface border border-border-default rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} />
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {activeTab === "disputes" ? ticket.reason : ticket.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <AlertCircle size={12} />
                      </div>
                      <p className="text-sm font-medium text-text-secondary">
                        From: <span className="text-foreground font-bold">{activeTab === "disputes" ? ticket.user.username : ticket.name}</span> 
                        <span className="mx-2 text-border-default">|</span>
                        {activeTab === "disputes" ? ticket.user.email : ticket.email}
                      </p>
                    </div>
                  </div>

                  {activeTab === "contact" && (
                    <div className="bg-surface-elevated/50 p-4 rounded-xl border border-border-default italic text-sm text-text-secondary">
                      "{ticket.message}"
                    </div>
                  )}

                  {activeTab === "disputes" && (
                    <p className="text-sm font-bold text-text-secondary">
                      Product: <span className="text-primary">{ticket.orderItem.productItem.product.name}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                  <div className="flex items-center gap-2 mb-2">
                    <select
                      value={ticket.status}
                      onChange={(e) => updateStatus(ticket.id, e.target.value)}
                      className="bg-surface-elevated border border-border-default rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="open">Mark Open</option>
                      <option value="pending">Mark Pending</option>
                      <option value="resolved">Mark Resolved</option>
                      <option value="closed">Mark Closed</option>
                    </select>
                    
                    <button
                      onClick={() => deleteTicket(ticket.id)}
                      className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all"
                      title="Delete Ticket"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {activeTab === "disputes" && (
                    <Link 
                      href={`/admin/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
                    >
                      Process Dispute <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
