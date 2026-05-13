import prisma from "@/lib/prisma";
import { TicketList } from "@/components/admin/TicketList";

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
          <h1 className="text-3xl font-bold font-syne text-foreground tracking-tight">Tickets & Disputes</h1>
          <p className="text-text-secondary mt-1">Resolution center for customer inquiries and order issues.</p>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="vault-card p-4 border-l-4 border-danger border-border-default">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Open Tickets</p>
            <p className="text-xl font-bold text-foreground">{tickets.filter(t => t.status === 'open').length}</p>
         </div>
         <div className="vault-card p-4 border-l-4 border-warning border-border-default">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">In Progress</p>
            <p className="text-xl font-bold text-foreground">0</p>
         </div>
         <div className="vault-card p-4 border-l-4 border-success border-border-default">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Resolved Today</p>
            <p className="text-xl font-bold text-foreground">0</p>
         </div>
         <div className="vault-card p-4 border-l-4 border-primary border-border-default">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Avg. Response</p>
            <p className="text-xl font-bold text-foreground">2.4h</p>
         </div>
      </div>

      {/* Main Content (Client Component) */}
      <TicketList initialTickets={tickets as any} />
    </div>
  );
}
