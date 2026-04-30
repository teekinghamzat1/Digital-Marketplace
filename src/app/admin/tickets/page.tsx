"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/admin/tickets?status=${filter}` : "/api/admin/tickets";
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error/10 text-error text-xs font-bold uppercase"><Clock size={12} /> Open</span>;
      case "resolved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-bold uppercase"><CheckCircle size={12} /> Resolved</span>;
      case "closed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-text-muted/10 text-text-muted text-xs font-bold uppercase">Closed</span>;
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground">Disputes & Tickets</h1>
          <p className="text-text-secondary mt-1">Manage user complaints and process refunds.</p>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface-elevated border border-border-default rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-surface-elevated animate-pulse rounded-xl" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="vault-card p-12 text-center">
          <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-foreground">No tickets found</h2>
          <p className="text-text-secondary">All quiet! No pending disputes found.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated border-b border-border-default">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{ticket.user.username}</span>
                      <span className="text-xs text-text-secondary">{ticket.user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {ticket.orderItem.productItem.product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-1.5 bg-surface-elevated hover:bg-border-default text-foreground px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                    >
                      Handle <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
