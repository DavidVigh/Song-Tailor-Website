"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  FaUsers,
  FaPlus,
  FaThLarge,
  FaList,
  FaTable,
  FaMusic,
} from "react-icons/fa";
import Link from "next/link";
import { useToast } from "@/app/context/ToastContext";
import LoadingLayout from "@/app/layouts/LoadingLayout";

// Components
import AdminTicketCard from "@/app/components/AdminTicketCard";
import AdminTicketRow from "@/app/components/AdminTicketRow";
import AdminSearch from "@/app/components/AdminSearch";
import AdminCategorizedView from "@/app/components/AdminCategorizedView";
import AdminColumn from "@/app/components/AdminColumn";
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
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Persistence for view mode
  const [viewMode, setViewMode] = useState<"grid" | "compact" | "categorized">(
    "grid",
  );
  const [collapsedColumns, setCollapsedColumns] = useState<
    Record<string, boolean>
  >({});

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "all", urgency: "all" });

  const { showToast } = useToast();
  const router = useRouter();
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem("admin_view_mode");
    if (savedMode) setViewMode(savedMode as any);
    checkAdmin();
  }, []);

  const handleViewChange = (mode: "grid" | "compact" | "categorized") => {
    setViewMode(mode);
    localStorage.setItem("admin_view_mode", mode);
  };

  async function checkAdmin() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") return router.push("/");
      setIsAdmin(true);
      await fetchTickets();
      setupRealtimeSubscription();
      setIsPageLoading(false);
    } catch (err) {
      router.push("/");
    }
  }

  async function fetchTickets() {
    const { data } = await supabase
      .from("song_requests")
      .select(`*, profiles (full_name, avatar_url)`)
      .order("position", { ascending: true });
    if (data) setTickets(data as Ticket[]);
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel("realtime_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "song_requests" },
        fetchTickets,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toString().includes(searchQuery);
      const matchesGenre = filters.genre === "all" || t.genre === filters.genre;
      const daysLeft = t.deadline
        ? Math.ceil(
            (new Date(t.deadline).getTime() - new Date().getTime()) / 86400000,
          )
        : 999;
      const matchesUrgency =
        filters.urgency === "all" ||
        (filters.urgency === "overdue" && daysLeft < 0) ||
        (filters.urgency === "urgent" && daysLeft >= 0 && daysLeft <= 3) ||
        (filters.urgency === "soon" && daysLeft > 3 && daysLeft <= 7);
      return matchesSearch && matchesGenre && matchesUrgency;
    });
  }, [tickets, searchQuery, filters]);

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;
    const allTickets = Array.from(tickets);
    const dragged = allTickets.find((t) => t.id.toString() === draggableId);
    if (!dragged) return;
    const newStatus = destination.droppableId as Ticket["status"];
    const destColumn = allTickets
      .filter((t) => t.status === newStatus && t.id.toString() !== draggableId)
      .sort((a, b) => a.position - b.position);
    let newPos = 1000;
    if (destColumn.length > 0) {
      if (destination.index === 0) newPos = destColumn[0].position / 2;
      else if (destination.index >= destColumn.length)
        newPos = destColumn[destColumn.length - 1].position + 1000;
      else
        newPos =
          (destColumn[destination.index - 1].position +
            destColumn[destination.index].position) /
          2;
    }
    setTickets((prev) =>
      prev
        .map((t) =>
          t.id === dragged.id
            ? { ...t, status: newStatus, position: newPos }
            : t,
        )
        .sort((a, b) => a.position - b.position),
    );
    await supabase
      .from("song_requests")
      .update({ status: newStatus, position: newPos })
      .eq("id", draggableId);
  }

  async function advanceStatus(ticket: Ticket) {
    const flow: Record<string, Ticket["status"]> = {
      new: "accepted",
      accepted: "in progress",
      "in progress": "done",
    };
    const nextStatus = flow[ticket.status];
    if (!nextStatus) return;
    await supabase
      .from("song_requests")
      .update({ status: nextStatus })
      .eq("id", ticket.id);
    fetchTickets();
  }

  async function executeDelete() {
    if (!ticketToDelete) return;
    setDeleting(true);
    const { error } = await supabase
      .from("song_requests")
      .delete()
      .eq("id", ticketToDelete);
    setDeleting(false);
    if (!error) {
      setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete));
      setTicketToDelete(null);
      showToast("Request deleted", "info");
    }
  }

  if (isPageLoading)
    return (
      <LoadingLayout
        message="Syncing Board..."
        showSpinner={false}
        icon={<FaMusic className="text-blue-500 animate-bounce text-3xl" />}
        containerClassName="bg-gray-50 text-gray-900 dark:bg-[#0a0a0a] dark:text-white gap-4"
        messageClassName="text-gray-700 dark:text-white font-black tracking-widest uppercase text-xs"
      />
    );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors overflow-x-hidden">
      {/* 📦 BOXED CONTAINER */}
      <div className="container mx-auto p-4 md:p-8 max-w-[1500px]">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-[10px] font-black text-white px-2 py-1 rounded">
              ADMIN
            </span>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Board
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white dark:bg-[#1e1e1e] p-1 rounded-xl border border-gray-200 dark:border-[#333] flex shadow-sm">
              <button
                onClick={() => handleViewChange("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                <FaThLarge size={14} />
              </button>
              <button
                onClick={() => handleViewChange("compact")}
                className={`p-2 rounded-lg transition-all ${viewMode === "compact" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                <FaList size={14} />
              </button>
              <button
                onClick={() => handleViewChange("categorized")}
                className={`p-2 rounded-lg transition-all ${viewMode === "categorized" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                <FaTable size={14} />
              </button>
            </div>
            <Link
              href="/pages/admin/user"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] text-xs uppercase tracking-widest hover:text-blue-500 transition-all"
            >
              <FaUsers className="text-blue-500" /> Users
            </Link>
            <Link
              href="/pages/request/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-blue-600 text-white text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
            >
              <FaPlus /> New Request
            </Link>
          </div>
        </div>

        {/* Search & Centered Filters */}
        <AdminSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
        />

        {/* Board Views */}
        {viewMode === "categorized" ? (
          <AdminCategorizedView
            tickets={filteredTickets}
            advanceStatus={advanceStatus}
            confirmDelete={setTicketToDelete}
          />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {columns.map((col) => (
                <AdminColumn
                  key={col.id}
                  col={col}
                  tickets={filteredTickets.filter((t) => t.status === col.id)}
                  isCollapsed={collapsedColumns[col.id]}
                  toggleCollapse={() =>
                    setCollapsedColumns((prev) => ({
                      ...prev,
                      [col.id]: !prev[col.id],
                    }))
                  }
                  viewMode={viewMode}
                  advanceStatus={advanceStatus}
                  confirmDelete={setTicketToDelete}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      <ConfirmationModal
        isOpen={ticketToDelete !== null}
        onClose={() => setTicketToDelete(null)}
        onConfirm={executeDelete}
        loading={deleting}
        title="Delete Request"
        message="Are you sure you want to delete this request? This action cannot be undone."
        confirmText="Delete"
      />
    </main>
  );
}
