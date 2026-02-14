"use client";
import AdminTicketRow from "./AdminTicketRow";
import { Ticket } from "@/app/types";

export default function AdminCategorizedView({
  tickets,
  advanceStatus,
  confirmDelete,
}: any) {
  const categories = [
    { id: "overdue", title: "🚨 Overdue Requests", color: "text-red-500" },
    {
      id: "urgent",
      title: "🔥 High Priority (3 Days)",
      color: "text-orange-500",
    },
    { id: "soon", title: "⏳ Due This Week", color: "text-blue-500" },
    { id: "stable", title: "✅ On Track / No Date", color: "text-gray-500" },
  ];

  const getUrgency = (ticket: Ticket) => {
    if (!ticket.deadline) return "stable";
    const days = Math.ceil(
      (new Date(ticket.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (days < 0) return "overdue";
    if (days <= 3) return "urgent";
    if (days <= 7) return "soon";
    return "stable";
  };

  return (
    <div className="space-y-10">
      {categories.map((cat) => {
        const filtered = tickets.filter(
          (t: Ticket) => getUrgency(t) === cat.id,
        );
        if (filtered.length === 0) return null;

        return (
          <section key={cat.id}>
            <div className="flex items-center gap-3 mb-4">
              <h2
                className={`text-sm font-black uppercase tracking-[0.2em] ${cat.color}`}
              >
                {cat.title}
              </h2>
              <span className="h-px flex-1 bg-gray-100 dark:bg-white/5" />
              <span className="text-[10px] font-bold opacity-40">
                {filtered.length} Items
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {filtered.map((t: Ticket) => (
                <AdminTicketRow
                  key={t.id}
                  ticket={t}
                  colId={t.status}
                  advanceStatus={advanceStatus}
                  confirmDelete={confirmDelete}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
