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
  FaUsers, // 👈 Added import
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import Link from "next/link";

// --- TYPES ---
type Ticket = {
  id: number;
  user_id: string;
  title: string;
  youtube_link: string;
  base_bpm: string;
  target_bpm: string;
  music_type: string;
  deadline: string;
  status: "new" | "queue" | "in progress" | "done";
  created_at: string;
  position: number; // 👈 CRITICAL: We need this for ordering
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
};

// --- COLUMNS CONFIG ---
const columns = [
  { id: "new", title: "NEW", color: "bg-gray-700", border: "border-gray-600" },
  {
    id: "queue",
    title: "QUEUE",
    color: "bg-blue-600",
    border: "border-blue-500",
  },
  {
    id: "in progress",
    title: "IN PROGRESS",
    color: "bg-yellow-600",
    border: "border-yellow-500",
  },
  {
    id: "done",
    title: "DONE",
    color: "bg-green-600",
    border: "border-green-500",
  },
];

// --- SUB-COMPONENT: Draggable Card (Handles Image Errors) ---
const DraggableCard = ({
  ticket,
  index,
  col,
  handleDelete,
  advanceStatus,
}: any) => {
  const [imgError, setImgError] = useState(false);
  const thumbnail = getYouTubeThumbnail(ticket.youtube_link);
  const hasValidImage = thumbnail && !imgError;

  return (
    <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style }}
          // 🛠️ Main container changes:
          // 1. 'overflow-hidden' ensures the blurry background doesn't poke out corners.
          // 2. Removed padding 'p-4' (it moved to inner content wrapper).
          // 3. Added fallback 'bg-[#1e1e1e]' only if no image exists.
          className={`border border-[#333] rounded-xl mb-3 shadow-lg group relative overflow-hidden
            transition-all duration-200 ease-in-out hover:border-gray-500
            ${snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500 rotate-2 opacity-90 z-50" : ""}
            ${!hasValidImage ? "bg-[#1e1e1e]" : ""} 
          `}
        >
          {/* 🖼️ LAYER 1: Blurred Background & Dimming Overlay */}
          {hasValidImage && (
            <>
              {/* The blurry image */}
              <div
                className="absolute inset-0 z-0 bg-cover bg-center filter blur-2xs scale-125 transition-opacity duration-300 opacity-80"
                style={{ backgroundImage: `url('${thumbnail}')` }}
              />
              {/* The dark overlay for readability */}
              <div className="absolute inset-0 z-0 bg-black/80 transition-opacity duration-300" />
            </>
          )}
          {/* 📦 LAYER 2: Actual Card Content (sits on top) */}
          <div className="relative z-10 p-4">
            {" "}
            {/* Padding is now here */}
            {/* DELETE BUTTON */}
            <button
              onClick={() => handleDelete(ticket.id)}
              className="absolute top-0 right-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20 p-2 hover:bg-black/50 rounded-bl-lg"
              title="Delete Ticket"
            >
              <FaTrash size={14} />
            </button>
            {/* 👤 USER HEADER */}
            <Link
              href={`/pages/admin/user/${ticket.user_id}?from=dashboard`} // 👈 Added query param
              className="flex items-center gap-3 mb-3 hover:bg-black/30 p-2 -mx-2 -mt-2 rounded-lg transition-colors group/user"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#333] border border-transparent group-hover/user:border-gray-400 transition-colors shadow-sm">
                {ticket.profiles?.avatar_url ? (
                  <img
                    src={ticket.profiles.avatar_url}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-200 group-hover/user:text-white truncate shadow-sm">
                  {ticket.profiles?.full_name || "Unknown User"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {new Date(ticket.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </Link>
            {/* 🎵 SONG INFO */}
            <div className="flex items-start gap-3 mb-4">
              {/* Small Thumbnail Front */}
              <div className="shrink-0 mt-0.5">
                {hasValidImage ? (
                  <a
                    href={ticket.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-12 h-12 rounded-lg overflow-hidden border border-white/20 relative group/img hover:border-white transition-colors shadow-md"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <img
                      src={thumbnail}
                      alt="Song"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-all flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5 drop-shadow-md"></div>
                    </div>
                  </a>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-black/50 flex items-center justify-center text-blue-400 border border-white/10">
                    <FaMusic />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Title Link */}
                <Link
                  href={`/pages/admin/request/${ticket.id}`}
                  className="group/title block"
                >
                  <h3
                    className="text-sm font-bold text-white truncate leading-tight mb-1 group-hover/title:text-blue-300 transition-colors drop-shadow-sm"
                    title={ticket.title}
                  >
                    {ticket.title}
                  </h3>
                </Link>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] bg-black/50 text-gray-300 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
                    {ticket.base_bpm || "?"} ➝ {ticket.target_bpm || "?"} BPM
                  </span>
                  {ticket.deadline && (
                    <span className="text-[10px] bg-black/50 text-gray-300 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 backdrop-blur-sm">
                      <FaClock size={8} /> {ticket.deadline}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* ACTION BUTTON */}
            {col.id !== "done" && (
              <button
                onClick={() => advanceStatus(ticket)}
                className={`w-full py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md
                  ${col.id === "new" ? "bg-blue-600/90 hover:bg-blue-500 text-white" : ""}
                  ${col.id === "queue" ? "bg-yellow-600/90 hover:bg-yellow-500 text-white" : ""}
                  ${col.id === "in progress" ? "bg-green-600/90 hover:bg-green-500 text-white" : ""}
                `}
              >
                {col.id === "new" && (
                  <>
                    <FaCheck /> Accept
                  </>
                )}
                {col.id === "queue" && (
                  <>
                    <FaPlay /> Start
                  </>
                )}
                {col.id === "in progress" && (
                  <>
                    <FaCheckCircle /> Finish
                  </>
                )}
              </button>
            )}
            {col.id === "done" && (
              <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 bg-black/30 py-1 rounded-lg">
                Played
              </div>
            )}
          </div>{" "}
          {/* End Layer 2 */}
        </div>
      )}
    </Draggable>
  );
};
// --- MAIN PAGE COMPONENT ---
export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      // 🛠️ SORT BY POSITION (Important!)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching tickets:", error);
    else setTickets(data as Ticket[]);

    setLoading(false);
  }

  // 🛠️ POSITIONING LOGIC UPDATE
  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // 1. Clone the array to avoid direct mutation
    const allTickets = Array.from(tickets);

    // 2. Identify the dragged ticket
    const draggedTicket = allTickets.find(
      (t) => t.id.toString() === draggableId,
    );
    if (!draggedTicket) return;

    // 3. Update status if column changed
    const newStatus = destination.droppableId as Ticket["status"];
    draggedTicket.status = newStatus;

    // 4. Get tickets in destination column (sorted)
    const destColumnTickets = allTickets
      .filter((t) => t.status === newStatus && t.id.toString() !== draggableId)
      .sort((a, b) => a.position - b.position);

    // 5. Calculate new Position
    let newPosition;
    if (destColumnTickets.length === 0) {
      newPosition = 1000; // Default if empty
    } else if (destination.index === 0) {
      newPosition = destColumnTickets[0].position / 2; // Move to top
    } else if (destination.index >= destColumnTickets.length) {
      newPosition =
        destColumnTickets[destColumnTickets.length - 1].position + 1000; // Move to bottom
    } else {
      const prevCard = destColumnTickets[destination.index - 1];
      const nextCard = destColumnTickets[destination.index];
      newPosition = (prevCard.position + nextCard.position) / 2; // Average (Middle)
    }

    draggedTicket.position = newPosition;

    // 6. Optimistic UI Update (Re-sort entire list)
    setTickets([...allTickets].sort((a, b) => a.position - b.position));

    // 7. Database Update
    const { error } = await supabase
      .from("song_requests")
      .update({
        status: newStatus,
        position: newPosition,
      })
      .eq("id", draggableId);

    if (error) {
      console.error("Move failed:", error);
      fetchTickets();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this ticket?")) return;
    setTickets((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase
      .from("song_requests")
      .delete()
      .eq("id", id);
    if (error) fetchTickets();
  }

  async function advanceStatus(ticket: Ticket) {
    const statusFlow: Record<string, Ticket["status"]> = {
      new: "queue",
      queue: "in progress",
      "in progress": "done",
    };

    const nextStatus = statusFlow[ticket.status];
    if (!nextStatus) return;

    // Move to bottom of next column
    const nextColumnTickets = tickets.filter((t) => t.status === nextStatus);
    const lastPosition =
      nextColumnTickets.length > 0
        ? Math.max(...nextColumnTickets.map((t) => t.position))
        : 0;
    const newPosition = lastPosition + 1000;

    // Optimistic Update
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? { ...t, status: nextStatus, position: newPosition }
          : t,
      ),
    );

    await supabase
      .from("song_requests")
      .update({ status: nextStatus, position: newPosition })
      .eq("id", ticket.id);
  }

  if (loading)
    return (
      <div className="p-10 text-center text-white">Loading Admin Panel...</div>
    );
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="bg-red-600 text-xs px-2 py-1 rounded text-white font-bold tracking-wider">
            ADMIN
          </span>
          Dashboard
        </h1>

        {/* 🆕 LIST USERS BUTTON */}
        <Link
          href="/pages/admin/user"
          className="flex items-center gap-2 bg-[#252525] hover:bg-[#333] text-gray-200 border border-[#333] px-4 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:text-white"
        >
          <FaUsers className="text-blue-500" /> List Users
        </Link>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col h-full">
              <div
                className={`flex items-center justify-between px-4 py-3 mb-4 rounded-lg border-t-4 bg-[#1e1e1e] ${col.border}`}
              >
                <div className="flex items-center gap-2">
                  {col.id === "done" && (
                    <FaCheckCircle className="text-green-500" />
                  )}
                  {col.id === "in progress" && (
                    <FaPlay className="text-yellow-500 text-xs" />
                  )}
                  <h2 className="font-bold text-gray-300 text-sm tracking-widest uppercase">
                    {col.title}
                  </h2>
                </div>
                <span className="bg-[#333] text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {tickets.filter((t) => t.status === col.id).length}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-xl p-2 transition-colors min-h-[500px] ${
                      snapshot.isDraggingOver
                        ? "bg-[#252525]/50 border-2 border-dashed border-[#444]"
                        : ""
                    }`}
                  >
                    {tickets
                      .filter((t) => t.status === col.id)
                      // .sort((a, b) => a.position - b.position) // Already sorted in fetch/state
                      .map((ticket, index) => (
                        <DraggableCard
                          key={ticket.id}
                          ticket={ticket}
                          index={index}
                          col={col}
                          handleDelete={handleDelete}
                          advanceStatus={advanceStatus}
                        />
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
