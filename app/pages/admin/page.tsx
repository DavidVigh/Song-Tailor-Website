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
  FaPlus
} from "react-icons/fa";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";

// ♻️ REUSABLE COMPONENTS & TYPES
import AdminTicketCard from "@/app/components/AdminTicketCard";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { Ticket } from "@/app/types";

const columns = [
  { id: "new", title: "NEW", border: "border-gray-600" },
  { id: "accepted", title: "QUEUE", border: "border-blue-500" },
  { id: "in progress", title: "IN PROGRESS", border: "border-yellow-500" },
  { id: "done", title: "DONE", border: "border-green-500" },
];

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }
    setIsAdmin(true);
    fetchTickets();
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

  if (loading)
    return <div className="p-10 text-center text-white">Loading Admin Panel...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="bg-red-600 text-xs px-2 py-1 rounded text-white font-bold tracking-wider">
            ADMIN
          </span>{" "}
          Board
        </h1>
        <div className="flex gap-3">
          <Link
            href="/pages/admin/user"
            className="flex items-center gap-2 bg-[#252525] hover:bg-[#333] text-gray-200 border border-[#333] px-4 py-2 rounded-xl font-bold transition-all shadow-lg text-sm"
          >
            <FaUsers className="text-blue-500" /> List Users
          </Link>
          <Link
            href="/pages/request"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg text-sm"
          >
            <FaPlus /> New Request
          </Link>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col h-full">
              <div
                className={`flex items-center justify-between px-4 py-3 mb-4 rounded-xl border-t-4 bg-[#1e1e1e] ${col.border} shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  {col.id === "done" && <FaCheckCircle className="text-green-500" />}
                  {col.id === "in progress" && (
                    <FaPlay className="text-yellow-500 text-[10px]" />
                  )}
                  <h2 className="font-black text-gray-400 text-xs tracking-[0.2em] uppercase">
                    {col.title}
                  </h2>
                </div>
                <span className="bg-[#333] text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {tickets.filter((t) => t.status === col.id).length}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-2xl p-2 transition-colors min-h-[500px] ${
                      snapshot.isDraggingOver ? "bg-[#252525]/30 border-2 border-dashed border-[#444]" : ""
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
          ))}
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