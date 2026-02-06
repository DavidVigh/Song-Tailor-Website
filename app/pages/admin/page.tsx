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
  FaMusic,
  FaTrash,
  FaCheck,
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaUsers,
  FaAlignLeft,
  FaYoutube,
  FaLongArrowAltRight,
  FaExclamationTriangle
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import Link from "next/link";
import { CarouselThumbnail, BackgroundCarousel } from "@/app/components/TicketCarousels";
import { useToast } from "@/app/context/ToastContext";

type Ticket = {
  id: number;
  user_id: string;
  title: string;
  youtube_link: string | string[];
  base_bpm: string;
  target_bpm: string;
  music_category: string;
  deadline: string;
  description?: string;
  status: "new" | "queue" | "in progress" | "done";
  created_at: string;
  position: number;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
};

const columns = [
  { id: "new", title: "NEW", color: "bg-gray-700", border: "border-gray-600" },
  { id: "queue", title: "QUEUE", color: "bg-blue-600", border: "border-blue-500" },
  { id: "in progress", title: "IN PROGRESS", color: "bg-yellow-600", border: "border-yellow-500" },
  { id: "done", title: "DONE", color: "bg-green-600", border: "border-green-500" },
];

const DraggableCard = ({ ticket, index, col, confirmDelete, advanceStatus }: any) => {
  const [imgError, setImgError] = useState(false);
  
  const links = Array.isArray(ticket.youtube_link) ? ticket.youtube_link : (ticket.youtube_link ? [ticket.youtube_link] : []);
  const rawThumbnails = getYouTubeThumbnail(links);
  const thumbnails = Array.isArray(rawThumbnails) ? rawThumbnails : (rawThumbnails ? [rawThumbnails] : []);
  
  const mainCover = thumbnails[0] || "";
  const hasMultipleImages = thumbnails.length > 1;
  const hasValidImage = thumbnails.length > 0 && !imgError;
  const extraLinksCount = Math.max(0, links.length - 1);

  const isChoreo = (ticket.music_category || "").toLowerCase() === "choreo";

  return (
    <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          // 🛠️ FIX: Removed 'transition-all' to prevent drag-drop glitches. 
          // Replaced with specific transitions (colors, borders, shadows) so layout shifts are instant.
          className={`border border-[#333] rounded-xl mb-3 shadow-lg group relative overflow-hidden flex flex-col
            hover:border-gray-500 transition-colors duration-200
            ${snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500 rotate-2 opacity-90 z-50" : ""}
            ${!hasValidImage ? "bg-[#1e1e1e]" : ""} 
          `}
        >
          {/* Background */}
          {hasValidImage && (
            hasMultipleImages ? (
              <BackgroundCarousel images={thumbnails} blur="blur-none" />
            ) : (
              <>
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center filter blur-none scale-110 opacity-30 transition-transform duration-500 group-hover:scale-125"
                  style={{ backgroundImage: `url('${mainCover}')` }}
                />
                <div className="absolute inset-0 z-0 bg-black/80 transition-opacity duration-300" />
              </>
            )
          )}

          {/* Content */}
          <div className="relative z-10 p-4">
            
            {/* Badge */}
            <div className="absolute top-3 right-4 z-10 transition-opacity duration-200 group-hover:opacity-0">
               <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider backdrop-blur-md shadow-sm
                 ${isChoreo 
                    ? 'bg-purple-500/20 text-purple-200 border-purple-500/50' 
                    : 'bg-blue-500/20 text-blue-200 border-blue-500/50'}
               `}>
                 {ticket.music_category || "Dance Class"}
               </span>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => confirmDelete(ticket.id)}
              className="absolute top-0 right-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20 p-2.5 hover:bg-black/50 rounded-bl-lg"
              title="Delete Ticket"
            >
              <FaTrash size={14} />
            </button>

            {/* User Header */}
            <Link
              href={`/pages/admin/user/${ticket.user_id}?from=dashboard`}
              className="flex items-center gap-3 mb-3 hover:bg-black/30 p-2 -mx-2 -mt-2 rounded-lg transition-colors group/user"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#333] border border-transparent group-hover/user:border-gray-400 transition-colors shadow-sm">
                {ticket.profiles?.avatar_url ? (
                  <img src={ticket.profiles.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200 group-hover/user:text-white truncate shadow-sm">
                  {ticket.profiles?.full_name || "Unknown User"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </Link>

            {/* Song Info */}
            <div className="flex items-start gap-3 mb-4">
              
              {/* Thumbnail */}
              <div className="shrink-0 mt-0.5 relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 shadow-md bg-black">
                {hasValidImage ? (
                   hasMultipleImages ? (
                     <CarouselThumbnail images={thumbnails} showIndicators={false} />
                   ) : (
                     <a
                       href={links[0]}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="block w-full h-full group/img"
                       onPointerDown={(e) => e.stopPropagation()}
                     >
                       <img
                         src={mainCover}
                         alt="Song"
                         className="w-full h-full object-cover"
                         onError={() => setImgError(true)}
                       />
                       <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-all flex items-center justify-center">
                          <FaYoutube className="text-white drop-shadow-md text-[10px]" />
                       </div>
                     </a>
                   )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-400">
                    <FaMusic />
                  </div>
                )}
                
                {extraLinksCount > 0 && (
                   <div className="absolute bottom-0 right-0 bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-tl-md z-20">
                     +{extraLinksCount}
                   </div>
                )}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <Link href={`/pages/request/${ticket.id}`} className="group/title block">
                  <h3 className="text-sm font-bold text-white truncate leading-tight mb-1 group-hover/title:text-blue-300 transition-colors drop-shadow-sm pr-16" title={ticket.title}>
                    {ticket.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {/* BPM Badge */}
                  <span className="text-[10px] bg-black/50 text-gray-300 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm font-mono flex items-center">
                    <span className="text-gray-500 font-bold mr-1">BPM:</span> 
                    <span className="text-white font-bold">{ticket.base_bpm || "?"}</span>
                    <FaLongArrowAltRight className="mx-1 text-gray-500" />
                    <span className="text-white font-bold">{ticket.target_bpm || "?"}</span>
                  </span>

                  {ticket.deadline && (
                    <span className="text-[10px] bg-black/50 text-gray-300 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 backdrop-blur-sm">
                      <FaClock size={8} /> {ticket.deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {col.id !== "done" && (
              <button
                onClick={() => advanceStatus(ticket)}
                className={`w-full py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md
                  ${col.id === "new" ? "bg-blue-600/90 hover:bg-blue-500 text-white" : ""}
                  ${col.id === "queue" ? "bg-yellow-600/90 hover:bg-yellow-500 text-white" : ""}
                  ${col.id === "in progress" ? "bg-green-600/90 hover:bg-green-500 text-white" : ""}
                `}
              >
                {col.id === "new" && <><FaCheck /> Accept</>}
                {col.id === "queue" && <><FaPlay /> Start</>}
                {col.id === "in progress" && <><FaCheckCircle /> Finish</>}
              </button>
            )}
            {col.id === "done" && (
              <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 bg-black/30 py-1 rounded-lg">
                Played
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  useEffect(() => { checkAdmin(); }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") { router.push("/"); return; }
    setIsAdmin(true);
    fetchTickets();
  }

  async function fetchTickets() {
    const { data, error } = await supabase.from("song_requests")
      .select(`*, profiles (full_name, avatar_url)`)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching tickets:", error);
    else setTickets(data as Ticket[]);
    setLoading(false);
  }

  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const allTickets = Array.from(tickets);
    const draggedTicket = allTickets.find((t) => t.id.toString() === draggableId);
    if (!draggedTicket) return;

    const newStatus = destination.droppableId as Ticket["status"];
    draggedTicket.status = newStatus;

    const destColumnTickets = allTickets.filter((t) => t.status === newStatus && t.id.toString() !== draggableId).sort((a, b) => a.position - b.position);
    let newPosition;
    if (destColumnTickets.length === 0) newPosition = 1000;
    else if (destination.index === 0) newPosition = destColumnTickets[0].position / 2;
    else if (destination.index >= destColumnTickets.length) newPosition = destColumnTickets[destColumnTickets.length - 1].position + 1000;
    else newPosition = (destColumnTickets[destination.index - 1].position + destColumnTickets[destination.index].position) / 2;

    draggedTicket.position = newPosition;
    setTickets([...allTickets].sort((a, b) => a.position - b.position));

    await supabase.from("song_requests").update({ status: newStatus, position: newPosition }).eq("id", draggableId);
  }

  function confirmDelete(id: number) {
    setTicketToDelete(id);
  }

  async function executeDelete() {
    if (!ticketToDelete) return;
    
    const previousTickets = [...tickets];
    setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete));
    setTicketToDelete(null);

    const { error } = await supabase.from("song_requests").delete().eq("id", ticketToDelete);
    
    if (error) {
      setTickets(previousTickets);
      showToast("Failed to delete ticket", "error");
    } else {
      showToast("Ticket deleted successfully", "info");
    }
  }

  async function advanceStatus(ticket: Ticket) {
    const statusFlow: Record<string, Ticket["status"]> = { new: "queue", queue: "in progress", "in progress": "done" };
    const nextStatus = statusFlow[ticket.status];
    if (!nextStatus) return;

    const nextColumnTickets = tickets.filter((t) => t.status === nextStatus);
    const lastPosition = nextColumnTickets.length > 0 ? Math.max(...nextColumnTickets.map((t) => t.position)) : 0;
    const newPosition = lastPosition + 1000;

    setTickets((prev) => prev.map((t) => t.id === ticket.id ? { ...t, status: nextStatus, position: newPosition } : t));
    await supabase.from("song_requests").update({ status: nextStatus, position: newPosition }).eq("id", ticket.id);
  }

  if (loading) return <div className="p-10 text-center text-white">Loading Admin Panel...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="bg-red-600 text-xs px-2 py-1 rounded text-white font-bold tracking-wider">ADMIN</span> Dashboard
        </h1>
        <Link href="/pages/admin/user" className="flex items-center gap-2 bg-[#252525] hover:bg-[#333] text-gray-200 border border-[#333] px-4 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:text-white w-full sm:w-auto justify-center">
          <FaUsers className="text-blue-500" /> List Users
        </Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col h-full">
              <div className={`flex items-center justify-between px-4 py-3 mb-4 rounded-lg border-t-4 bg-[#1e1e1e] ${col.border}`}>
                <div className="flex items-center gap-2">
                  {col.id === "done" && <FaCheckCircle className="text-green-500" />}
                  {col.id === "in progress" && <FaPlay className="text-yellow-500 text-xs" />}
                  <h2 className="font-bold text-gray-300 text-sm tracking-widest uppercase">{col.title}</h2>
                </div>
                <span className="bg-[#333] text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">{tickets.filter((t) => t.status === col.id).length}</span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 rounded-xl p-2 transition-colors min-h-[500px] ${snapshot.isDraggingOver ? "bg-[#252525]/50 border-2 border-dashed border-[#444]" : ""}`}>
                    {tickets.filter((t) => t.status === col.id).map((ticket, index) => (
                      <DraggableCard key={ticket.id} ticket={ticket} index={index} col={col} confirmDelete={confirmDelete} advanceStatus={advanceStatus} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {ticketToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative transform transition-all scale-100">
            
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xl">
                <FaExclamationTriangle />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Request?</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Are you sure you want to delete this ticket? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setTicketToDelete(null)}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-[#2a2a2a] hover:bg-[#333] text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 transition-all"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}