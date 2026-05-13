"use client";

import { 
  MessageSquareWarning, Search, Filter, 
  ChevronRight, AlertTriangle, Clock,
  CheckCircle2, XCircle, User as UserIcon,
  ShoppingBag, Reply, MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import Link from "next/link";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
}

export function TicketList({ initialTickets }: { initialTickets: Ticket[] }) {
  const [filter, setFilter] = useState("All");

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Open', 'Pending', 'Resolved', 'Closed'].map((tab, idx) => (
            <button 
              key={idx}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === tab 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-surface-elevated text-text-muted hover:text-foreground border border-border-default'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {initialTickets.map((ticket) => (
          <Link 
            href={`/admin/tickets/${ticket.id}`}
            key={ticket.id} 
            className="vault-card p-6 flex flex-col md:flex-row md:items-center gap-6 group cursor-pointer hover:bg-surface-elevated/30 border-border-default"
          >
            <div className="flex flex-col items-start gap-4 flex-1">
               <div className="flex flex-wrap items-center gap-3">
                  <div className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                    #TKT-{ticket.id.slice(0, 4).toUpperCase()}
                  </div>
                  <span className={`status-badge ${
                    ticket.status === 'open' ? 'bg-danger/15 text-danger' : 
                    ticket.status === 'resolved' ? 'bg-success/15 text-success' : 'bg-surface-elevated text-text-muted'
                  }`}>
                    {ticket.status}
                  </span>
                  {ticket.status === 'open' && (
                    <div className="flex items-center gap-1.5 text-danger font-bold text-[10px] uppercase tracking-wider">
                       <AlertTriangle size={12} />
                       High Urgency
                    </div>
                  )}
               </div>
               <div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{ticket.subject}</h3>
                  <p className="text-sm text-text-secondary line-clamp-2 max-w-2xl">
                    "{ticket.message}"
                  </p>
               </div>
               <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-text-muted uppercase tracking-widest pt-2">
                  <div className="flex items-center gap-2">
                     <UserIcon size={14} className="text-primary" />
                     {ticket.name} ({ticket.email})
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock size={14} />
                     {format(new Date(ticket.createdAt), 'MMM d, yyyy · HH:mm')}
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-border-default pt-4 md:pt-0 md:pl-6">
               <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                  <Reply size={16} />
                  Reply
               </div>
               <button className="p-3 bg-background border border-border-default rounded-xl text-text-muted hover:text-foreground transition-colors">
                  <MoreHorizontal size={20} />
               </button>
            </div>
          </Link>
        ))}

        {initialTickets.length === 0 && (
          <div className="vault-card p-20 text-center border-dashed border-border-default bg-transparent">
            <MessageSquareWarning size={64} className="mx-auto mb-6 opacity-5 text-foreground" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Support Tickets</h3>
            <p className="text-sm text-text-muted max-w-xs mx-auto">Customers haven't submitted any disputes or support requests yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
