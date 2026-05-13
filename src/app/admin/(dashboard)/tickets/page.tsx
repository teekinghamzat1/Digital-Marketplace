import prisma from "@/lib/prisma";
import { 
  MessageSquareWarning, Search, Filter, 
  ChevronRight, AlertTriangle, Clock,
  CheckCircle2, XCircle, User as UserIcon,
  ShoppingBag, Reply, MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";

async function getTickets() {
  return await prisma.contactTicket.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export default async function TicketsDisputes() {
  const tickets = await getTickets();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-white tracking-tight">Tickets & Disputes</h1>
          <p className="text-text-secondary mt-1">Resolution center for customer inquiries and order issues.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Open', 'Pending', 'Resolved', 'Closed'].map((tab, idx) => (
            <button 
              key={idx}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                idx === 0 ? 'bg-primary text-white shadow-lg' : 'bg-surface-elevated text-text-muted hover:text-white border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="vault-card p-4 border-l-4 border-danger">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Open Tickets</p>
            <p className="text-xl font-bold text-white">{tickets.filter(t => t.status === 'open').length}</p>
         </div>
         <div className="vault-card p-4 border-l-4 border-warning">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">In Progress</p>
            <p className="text-xl font-bold text-white">0</p>
         </div>
         <div className="vault-card p-4 border-l-4 border-success">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Resolved Today</p>
            <p className="text-xl font-bold text-white">0</p>
         </div>
         <div className="vault-card p-4 border-l-4 border-primary">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Avg. Response</p>
            <p className="text-xl font-bold text-white">2.4h</p>
         </div>
      </div>

      {/* Tickets List View */}
      <div className="grid grid-cols-1 gap-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="vault-card p-6 flex flex-col md:flex-row md:items-center gap-6 group cursor-pointer hover:bg-white/2">
            <div className="flex flex-col items-start gap-4 flex-1">
               <div className="flex flex-wrap items-center gap-3">
                  <div className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                    #TKT-{ticket.id.slice(0, 4).toUpperCase()}
                  </div>
                  <span className={`status-badge ${
                    ticket.status === 'open' ? 'bg-danger/15 text-danger' : 
                    ticket.status === 'resolved' ? 'bg-success/15 text-success' : 'bg-white/5 text-text-muted'
                  }`}>
                    {ticket.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-danger font-bold text-[10px] uppercase tracking-wider">
                     <AlertTriangle size={12} />
                     High Urgency
                  </div>
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{ticket.subject}</h3>
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
                     {format(ticket.createdAt, 'MMM d, yyyy · HH:mm')}
                  </div>
                  <div className="flex items-center gap-2">
                     <ShoppingBag size={14} />
                     Related Order: <span className="text-foreground">#ORD-429</span>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
               <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                  <Reply size={16} />
                  Open Ticket
               </button>
               <button className="p-3 bg-surface-raised border border-white/5 rounded-xl text-text-muted hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
               </button>
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="vault-card p-20 text-center border-dashed border-white/10 bg-transparent">
            <MessageSquareWarning size={64} className="mx-auto mb-6 opacity-5" />
            <h3 className="text-xl font-bold text-white mb-2">No Support Tickets</h3>
            <p className="text-sm text-text-muted max-w-xs mx-auto">Customers haven't submitted any disputes or support requests yet.</p>
          </div>
        )}
      </div>

      {/* Mobile Footer Spacing Helper */}
      <div className="h-4 md:hidden" />
    </div>
  );
}
