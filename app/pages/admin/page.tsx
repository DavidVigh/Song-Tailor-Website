"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  FaCheckCircle,
  FaPlay,
  FaUsers,
  FaPlus,
  FaLayerGroup,
  FaRegCircle,
  FaMusic // Added for loader
} from "react-icons/fa";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

// ♻️ REUSABLE COMPONENTS & TYPES
import AdminTicketCard from "@/app/components/AdminTicketCard";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { Ticket } from "@/app/types";

const columns = [
  { id: "new", title: "NEW", border: "border-gray-500" },
  { id: "accepted", title: "QUEUE", border: "border-blue-500" },
  { id: "in progress", title: "IN PROGRESS", border: "border-yellow-500" },
  { id: "done", title: "DONE", border: "border-green-500" },
];

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true); // 🪄 New state for themed loading
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      // 1. Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth");
        return;
      }

      // 2. Verify admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      // 3. Setup the board
      setIsAdmin(true);
      await fetchTickets();
      setupRealtimeSubscription();
      
      // 4. Finally, reveal the page
      setIsPageLoading(false);
    } catch (err) {
      console.error("Admin check error:", err);
      router.push("/");
    }
  }

  // ⚡ REALTIME SUBSCRIPTION SETUP
  function setupRealtimeSubscription() {
    const channel = supabase
      .channel('realtime tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'song_requests' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newTicket, error } = await supabase
              .from("song_requests")
              .select(`*, profiles (full_name, avatar_url)`)
              .eq("id", payload.new.id)
              .single();
            
            if (newTicket && !error) {
              setTickets((prev) => [...prev, newTicket as Ticket].sort((a, b) => a.position - b.position));
            }
          } 
          else if (payload.eventType === 'UPDATE') {
            setTickets((prev) => 
              prev.map((ticket) => 
                ticket.id === payload.new.id 
                  ? { ...ticket, ...payload.new } 
                  : ticket
              ).sort((a, b) => a.position - b.position)
            );
          } 
          else if (payload.eventType === 'DELETE') {
            setTickets((prev) => prev.filter((ticket) => ticket.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function fetchTickets() {
    const { data, error } = await supabase
      .from("song_requests")
      .select(`*, profiles (full_name, avatar_url)`)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching tickets:", error);
    } else {
      setTickets(data as Ticket[]);
    }
    setLoading(false);
  }

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const allTickets = Array.from(tickets);
    const draggedTicket = allTickets.find((t) => t.id.toString() === draggableId);
    if (!draggedTicket) return;

    const newStatus = destination.droppableId as Ticket["status"];
    draggedTicket.status = newStatus;

    const destColumnTickets = allTickets
      .filter((t) => t.status === newStatus && t.id.toString() !== draggableId)
      .sort((a, b) => a.position - b.position);

    let newPosition;
    if (destColumnTickets.length === 0) {
      newPosition = 1000;
    } else if (destination.index === 0) {
      newPosition = destColumnTickets[0].position / 2;
    } else if (destination.index >= destColumnTickets.length) {
      newPosition = destColumnTickets[destColumnTickets.length - 1].position + 1000;
    } else {
      newPosition =
        (destColumnTickets[destination.index - 1].position +
          destColumnTickets[destination.index].position) /
        2;
    }

    draggedTicket.position = newPosition;
    setTickets([...allTickets].sort((a, b) => a.position - b.position));

    await supabase
      .from("song_requests")
      .update({ status: newStatus, position: newPosition })
      .eq("id", draggableId);
  }

  async function executeDelete() {
    if (!ticketToDelete) return;
    setDeleting(true);

    const previousTickets = [...tickets];
    setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete));

    const { error } = await supabase
      .from("song_requests")
      .delete()
      .eq("id", ticketToDelete);

    setDeleting(false);

    if (error) {
      setTickets(previousTickets);
      showToast("Failed to delete ticket", "error");
    } else {
      showToast("Ticket deleted successfully", "info");
      setTicketToDelete(null);
    }
  }

  async function advanceStatus(ticket: Ticket) {
    const statusFlow: Record<string, Ticket["status"]> = {
      new: "accepted",
      accepted: "in progress",
      "in progress": "done",
    };
    const nextStatus = statusFlow[ticket.status];
    if (!nextStatus) return;

    const nextColumnTickets = tickets.filter((t) => t.status === nextStatus);
    const lastPosition =
      nextColumnTickets.length > 0
        ? Math.max(...nextColumnTickets.map((t) => t.position))
        : 0;
    const newPosition = lastPosition + 1000;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? { ...t, status: nextStatus, position: newPosition }
          : t
      )
    );
    
    await supabase
      .from("song_requests")
      .update({ status: nextStatus, position: newPosition })
      .eq("id", ticket.id);
  }

  const getHeaderColors = (colId: string) => {
    switch (colId) {
      case "accepted": 
        return {
          text: "text-blue-600 dark:text-blue-400",
          icon: "text-blue-500 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-800/50",
        };
      case "in progress": 
        return {
          text: "text-yellow-600 dark:text-yellow-400",
          icon: "text-yellow-500 dark:text-yellow-400",
          border: "border-yellow-200 dark:border-yellow-800/50",
        };
      case "done":
        return {
          text: "text-green-600 dark:text-green-400",
          icon: "text-green-500 dark:text-green-400",
          border: "border-green-200 dark:border-green-800/50",
        };
      default: 
        return {
          text: "text-gray-600 dark:text-gray-400",
          icon: "text-gray-400 dark:text-gray-500",
          border: "border-gray-200 dark:border-gray-700",
        };
    }
  };

  // 🛡️ THEMED LOADING STATE (Replaces the "Scuffed" plain text)
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-600/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <FaMusic className="text-blue-500 text-2xl animate-bounce" />
          <p className="text-gray-400 font-bold tracking-widest uppercase text-xs animate-pulse">
            Syncing Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3
          text-gray-900 dark:text-white"
        >
          <span className="bg-red-600 text-xs px-2 py-1 rounded text-white font-bold tracking-wider">
            ADMIN
          </span>{" "}
          Board
        </h1>
        <div className="flex gap-3">
          <Link
            href="/pages/admin/user"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm hover:shadow-md text-sm border
              bg-white text-gray-700 border-gray-200 hover:bg-gray-50
              dark:bg-[#252525] dark:text-gray-200 dark:border-[#333] dark:hover:bg-[#333]"
          >
            <FaUsers className="text-blue-500" /> List Users
          </Link>
          <Link
            href="/pages/request"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg text-sm border border-transparent"
          >
            <FaPlus /> New Request
          </Link>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {columns.map((col) => {
            const colors = getHeaderColors(col.id);
            return (
              <div key={col.id} className="flex flex-col h-full">
                <div
                  className={`flex items-center justify-between px-4 py-3 mb-4 rounded-xl border-t-4 shadow-sm
                    border-x border-b
                    bg-white 
                    dark:bg-[#1e1e1e] dark:shadow-lg 
                    ${colors.border}
                    ${col.border}`}
                >
                  <div className="flex items-center gap-2">
                    {col.id === "new" && <FaRegCircle className={`${colors.icon} text-[10px]`} />}
                    {col.id === "done" && <FaCheckCircle className={colors.icon} />}
                    {col.id === "in progress" && <FaPlay className={`${colors.icon} text-[10px]`} />}
                    {col.id === "accepted" && <FaLayerGroup className={colors.icon} />}
                    <h2 className={`font-black text-xs tracking-[0.2em] uppercase ${colors.text}`}>
                      {col.title}
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                    bg-gray-100 text-gray-600
                    dark:bg-[#333] dark:text-gray-400"
                  >
                    {tickets.filter((t) => t.status === col.id).length}
                  </span>
                </div>
                
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-2xl p-2 transition-colors min-h-[500px] ${
                        snapshot.isDraggingOver 
                          ? "bg-gray-100/50 border-2 border-dashed border-gray-300 dark:bg-[#252525]/30 dark:border-[#444]" 
                          : ""
                      }`}
                    >
                      {tickets
                        .filter((t) => t.status === col.id)
                        .map((ticket, index) => (
                          <Draggable
                            key={ticket.id}
                            draggableId={ticket.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-4 ${snapshot.isDragging ? "z-50" : ""}`}
                              >
                                <AdminTicketCard
                                  ticket={ticket}
                                  colId={col.id}
                                  confirmDelete={(id) => setTicketToDelete(id)}
                                  advanceStatus={advanceStatus}
                                />
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
          })}
        </div>
      </DragDropContext>

      <ConfirmationModal
        isOpen={ticketToDelete !== null}
        onClose={() => setTicketToDelete(null)}
        onConfirm={executeDelete}
        title="Delete Request?"
        message="Are you sure you want to delete this ticket? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}