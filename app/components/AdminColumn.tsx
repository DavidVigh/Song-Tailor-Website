"use client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import AdminTicketCard from "./AdminTicketCard";
import AdminTicketRow from "./AdminTicketRow";
import { Ticket } from "@/app/types";

interface AdminColumnProps {
  col: { id: string; title: string; border: string };
  tickets: Ticket[];
  isCollapsed: boolean;
  toggleCollapse: () => void;
  viewMode: "grid" | "compact" | "categorized";
  advanceStatus: (ticket: Ticket) => void;
  confirmDelete: (id: number) => void;
}

export default function AdminColumn({
  col,
  tickets,
  isCollapsed,
  toggleCollapse,
  viewMode,
  advanceStatus,
  confirmDelete,
}: AdminColumnProps) {
  const useCompact = viewMode === "compact";

  return (
    <div
      className={`rounded-3xl border border-t-4 border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0f0f0f] p-3 ${col.border}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-gray-400" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-200">
            {col.title}
          </h3>
          <span className="text-[10px] font-bold text-gray-400">
            {tickets.length}
          </span>
        </div>
        <button
          onClick={toggleCollapse}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {isCollapsed ? "Show" : "Hide"}
        </button>
      </div>

      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-3 min-h-20 rounded-2xl p-2 transition-colors ${snapshot.isDraggingOver ? "bg-blue-500/5" : "bg-transparent"}`}
          >
            {!isCollapsed &&
              tickets.map((ticket, index) => (
                <Draggable
                  key={ticket.id}
                  draggableId={ticket.id.toString()}
                  index={index}
                >
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className="rounded-2xl"
                    >
                      {useCompact ? (
                        <AdminTicketRow
                          ticket={ticket}
                          colId={col.id}
                          advanceStatus={advanceStatus}
                          confirmDelete={confirmDelete}
                        />
                      ) : (
                        <AdminTicketCard
                          ticket={ticket}
                          colId={col.id}
                          advanceStatus={advanceStatus}
                          confirmDelete={confirmDelete}
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
