"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Package, AlertCircle, CheckCircle, RotateCcw, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminResponse, setAdminResponse] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/tickets/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setTicket(data.ticket);
        setAdminResponse(data.ticket?.adminResponse || "");
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async (status?: string, action?: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          adminResponse,
          status,
          action
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      if (action === "refund" || status === "resolved") {
        router.push("/admin/tickets");
      } else {
        // Just refresh local state
        setTicket({ ...ticket, status: status || ticket.status, adminResponse });
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-48 bg-surface-elevated rounded-xl"></div></div>;
  if (!ticket) return <div className="text-error">Ticket not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors">
        <ArrowLeft size={20} /> Back to Tickets
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-syne)] text-foreground">Dispute Details</h1>
          <p className="text-sm text-text-secondary mt-1">Ticket ID: <span className="font-mono">{ticket.id}</span></p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${
          ticket.status === 'open' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
        }`}>
          {ticket.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="vault-card p-6 border-error/30">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-error" /> User's Complaint
            </h3>
            <div className="bg-surface-elevated rounded-xl p-4 text-foreground italic whitespace-pre-wrap">
              "{ticket.reason}"
            </div>
          </div>

          <div className="vault-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Package size={20} className="text-primary" /> Disputed Item
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm border-b border-border-default pb-2">
                <span className="text-text-muted">Product</span>
                <span className="text-foreground font-bold">{ticket.orderItem.productItem.product.name}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-border-default pb-2">
                <span className="text-text-muted">Price Paid</span>
                <span className="text-foreground font-bold">₦{Number(ticket.orderItem.productItem.product.price).toLocaleString()}</span>
              </div>
              <div className="mt-4">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Original Log Text:</span>
                <div className="bg-background border border-border-default rounded-lg p-3 font-mono text-sm break-all text-text-secondary">
                  {ticket.orderItem.productItem.credentialText}
                </div>
              </div>
            </div>
          </div>

          <div className="vault-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" /> Admin Response
            </h3>
            <textarea 
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Enter your message to the user..."
              className="w-full bg-surface-elevated border border-border-default rounded-xl p-4 text-foreground focus:outline-none focus:border-primary transition-colors min-h-[150px] mb-4"
            />
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleUpdate(ticket.status === 'open' ? 'resolved' : 'open')}
                disabled={processing}
                className="bg-surface-elevated hover:bg-border-default text-foreground px-6 py-2.5 rounded-xl font-bold transition-colors"
              >
                {ticket.status === 'open' ? "Mark as Resolved" : "Re-open Ticket"}
              </button>
              <button 
                onClick={() => handleUpdate()}
                disabled={processing}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
              >
                Save Message
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="vault-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" /> Customer Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Username</p>
                <p className="text-foreground font-bold">{ticket.user.username}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Email</p>
                <p className="text-foreground font-bold">{ticket.user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase mb-1">Current Wallet</p>
                <p className="text-success font-black">₦{Number(ticket.user.walletBalance).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="vault-card p-6 bg-error/5 border-error/20">
            <h3 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
              <RotateCcw size={20} /> Resolution Actions
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Clicking refund will instantly credit ₦{Number(ticket.orderItem.productItem.product.price).toLocaleString()} back to the user's wallet and resolve this ticket.
            </p>
            <button 
              onClick={() => {
                if(confirm("Are you sure you want to refund this purchase? This cannot be undone.")) {
                  handleUpdate("resolved", "refund");
                }
              }}
              disabled={processing || ticket.status === 'resolved'}
              className="w-full bg-error hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Issue Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
