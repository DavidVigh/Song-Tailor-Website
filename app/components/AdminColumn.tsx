"use client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import AdminTicketCard from "./AdminTicketCard";
import AdminTicketRow from "./AdminTicketRow";

export default function AdminColumn({
  col,
  tickets,
  isCollapsed,
  toggleCollapse,
  viewMode,
  advanceStatus,
  confirmDelete,
}: any) {
  return (
    <motion.div
      // 🚨 NO CSS TRANSITION CLASSES HERE. Framer Motion handles everything.
      initial={false}
      animate={{
        height: isCollapsed ? 64 : "auto",
      }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="flex flex-col justify-start rounded-[2.5rem] bg-white dark:bg-[#0f0f0f]/60 border border-black/5 dark:border-white/5 shadow-2xl overflow-hidden w-full"
    >
      {/* 🟢 HEADER: Locked at 64px. shrink-0 keeps it from moving. */}
      <div className="h-[64px] min-h-[64px] w-full px-6 flex items-center justify-between shrink-0 bg-[#0a0a0a]/40 border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
            {col.title}{" "}
            <span className="ml-2 text-white/20 font-bold">
              {tickets.length}
            </span>
          </h2>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-blue-500 transition-colors px-3 py-2"
        >
          {isCollapsed ? "Show" : "Hide"}
        </button>
      </div>

      {/* 🎭 CONTENT AREA: Fades out as the parent container rolls up */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            key="column-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <div className="p-4 pt-4 w-full">
              <Droppable droppableId={col.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    // Maintains the gap-y-12 for the grid view
                    className={`flex flex-col ${
                      viewMode === "grid" ? "gap-y-12" : "gap-y-3"
                    }`}
                  >
                    {tickets.map((ticket: any, index: number) => (
                      <Draggable
                        key={ticket.id}
                        draggableId={ticket.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="w-full"
                          >
                            {viewMode === "grid" ? (
                              <AdminTicketCard
                                ticket={ticket}
                                colId={col.id}
                                advanceStatus={advanceStatus}
                                confirmDelete={confirmDelete}
                              />
                            ) : (
                              <AdminTicketRow
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
