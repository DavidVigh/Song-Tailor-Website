"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { 
  FaCheck, 
  FaPlay, 
  FaCheckDouble, 
  FaTrash, 
  FaClock, 
  FaUser, 
  FaMusic, 
  FaSignOutAlt,
  FaThLarge, 
  FaList,
  FaTimes
} from "react-icons/fa";

type Ticket = {
  id: string;
  title: string;
  // 🔴 FIX: Updated 'in_progress' to 'in progress'
  status: 'pending' | 'accepted' | 'in progress' | 'completed';
  created_at: string;
  user_id: string;
  position: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'compact'>('board');

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  async function checkAdminAndFetch() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push("/pages/user/my-tickets"); 
        return;
      }

      const { data, error } = await supabase
        .from("song_requests")
        .select(`*, profiles (full_name, avatar_url)`)
        .order('position', { ascending: true });

      if (error) throw error;
      setTickets(data || []);

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  // 🔄 DRAG END HANDLER
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const newStatus = destination.droppableId as Ticket['status'];
    
    const currentTickets = [...tickets];
    const draggedTicket = currentTickets.find(t => t.id.toString() === draggableId);
    
    if (!draggedTicket) return;

    // Remove from old list
    const ticketsWithoutDragged = currentTickets.filter(t => t.id.toString() !== draggableId);

    // Get target column
    const destColumn = ticketsWithoutDragged
      .filter(t => t.status === newStatus)
      .sort((a, b) => a.position - b.position);

    // Update ticket status
    const updatedTicket = { ...draggedTicket, status: newStatus };
    
    // Insert into new specific index
    destColumn.splice(destination.index, 0, updatedTicket);

    // Recalculate positions for the column
    const updatedDestColumn = destColumn.map((ticket, index) => ({
      ...ticket,
      position: index * 1000 + 1000 
    }));

    // Merge back
    const finalTickets = [
      ...ticketsWithoutDragged.filter(t => t.status !== newStatus),
      ...updatedDestColumn
    ].sort((a, b) => a.position - b.position); 

    // Optimistic UI update
    setTickets(finalTickets);

    // Database Update
    const updates = updatedDestColumn.map(t => ({
      id: t.id,
      status: t.status,
      position: t.position,
      user_id: t.user_id,
      title: t.title
    }));

    await supabase.from("song_requests").upsert(updates);
  };

  async function updateStatus(id: string, newStatus: string) {
    setTickets(current => current.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    await supabase.from("song_requests").update({ status: newStatus }).eq("id", id);
  }

  async function deleteTicket(id: string) {
    if(!confirm("Delete this request?")) return;
    setTickets(current => current.filter(t => t.id !== id));
    await supabase.from("song_requests").delete().eq("id", id);
  }

  const getTicketsByStatus = (status: string) => tickets.filter(t => t.status === status);

  if (loading) return <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center font-bold">Loading Panel...</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white p-6 font-sans overflow-x-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span className="bg-red-600 px-3 py-1 rounded text-sm font-mono tracking-widest">ADMIN</span>
          <span>DJ Panel</span>
        </h1>
        
        <div className="flex items-center gap-4">
            <div className="bg-[#2a2a2a] p-1 rounded-lg flex items-center border border-[#333]">
                <button onClick={() => setViewMode('board')} className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-[#444] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}><FaThLarge /></button>
                <button onClick={() => setViewMode('compact')} className={`p-2 rounded-md transition-all ${viewMode === 'compact' ? 'bg-[#444] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}><FaList /></button>
            </div>
            <div className="h-6 w-px bg-[#333]"></div>
            <button onClick={() => router.push("/pages/user")} className="text-gray-400 hover:text-white text-sm font-bold">Profile</button>
            <button onClick={() => supabase.auth.signOut().then(() => router.push("/auth"))} className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-2"><FaSignOutAlt /></button>
        </div>
      </div>

      {/* ✋ DRAG CONTEXT */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[1000px] pb-10 ${viewMode === 'compact' ? 'items-start' : 'h-full'}`}>
            
            {/* 1. NEW (Pending) */}
            <Column id="pending" title="New" color="border-gray-500" count={getTicketsByStatus('pending').length} icon={<FaClock className="text-gray-400"/>} viewMode={viewMode}>
                {getTicketsByStatus('pending').map((ticket, index) => (
                    <DraggableTicket key={ticket.id} ticket={ticket} index={index} viewMode={viewMode} onDelete={deleteTicket}>
                        <ActionButton onClick={() => updateStatus(ticket.id, 'accepted')} color="bg-blue-600 hover:bg-blue-500" icon={<FaCheck />} label="Accept" mode={viewMode} />
                    </DraggableTicket>
                ))}
            </Column>

            {/* 2. QUEUE (Accepted) */}
            <Column id="accepted" title="Queue" color="border-blue-500" count={getTicketsByStatus('accepted').length} icon={<FaCheck className="text-blue-500"/>} viewMode={viewMode}>
                {getTicketsByStatus('accepted').map((ticket, index) => (
                    <DraggableTicket key={ticket.id} ticket={ticket} index={index} viewMode={viewMode} onDelete={deleteTicket}>
                        {/* 🔴 FIX: Use 'in progress' here */}
                        <ActionButton onClick={() => updateStatus(ticket.id, 'in progress')} color="bg-yellow-600 hover:bg-yellow-500" icon={<FaPlay />} label="Start" mode={viewMode} />
                    </DraggableTicket>
                ))}
            </Column>

            {/* 3. IN PROGRESS (Playing) */}
            {/* 🔴 FIX: Column ID and Filter updated to 'in progress' */}
            <Column id="in progress" title="In Progress" color="border-yellow-500" count={getTicketsByStatus('in progress').length} icon={<FaPlay className="text-yellow-500"/>} viewMode={viewMode}>
                {getTicketsByStatus('in progress').map((ticket, index) => (
                    <DraggableTicket key={ticket.id} ticket={ticket} index={index} viewMode={viewMode} onDelete={deleteTicket} isActive>
                        <ActionButton onClick={() => updateStatus(ticket.id, 'completed')} color="bg-green-600 hover:bg-green-500" icon={<FaCheckDouble />} label="Finish" mode={viewMode} />
                    </DraggableTicket>
                ))}
            </Column>

            {/* 4. DONE (Completed) */}
            <Column id="completed" title="Done" color="border-green-600" count={getTicketsByStatus('completed').length} icon={<FaCheckDouble className="text-green-600"/>} viewMode={viewMode}>
                {getTicketsByStatus('completed').slice(0, 15).map((ticket, index) => (
                    <DraggableTicket key={ticket.id} ticket={ticket} index={index} viewMode={viewMode} onDelete={deleteTicket} isCompact>
                        <div className="text-[10px] text-gray-600 text-center uppercase">Played</div>
                    </DraggableTicket>
                ))}
            </Column>

        </div>
      </DragDropContext>
    </main>
  );
}

// --- SUB-COMPONENTS ---

function Column({ id, title, color, icon, count, children, viewMode }: any) {
  return (
    <div className={`flex flex-col bg-[#1a1a1a] rounded-xl border border-[#333] ${viewMode === 'compact' ? 'p-2' : 'p-4 h-full'}`}>
      <div className={`flex items-center gap-2 mb-2 pb-2 border-b-2 ${color} text-gray-200 font-bold uppercase text-xs tracking-wider`}>
        {icon} <span>{title}</span>
        <span className="ml-auto bg-[#333] text-[10px] px-1.5 rounded-full text-white">{count}</span>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
            <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[100px] transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-[#222]' : ''}`}
            >
                {count === 0 && !snapshot.isDraggingOver && <div className="py-8 text-center text-gray-700 text-xs italic">Empty</div>}
                {children}
                {provided.placeholder}
            </div>
        )}
      </Droppable>
    </div>
  );
}

function DraggableTicket({ ticket, index, viewMode, onDelete, isActive, isCompact, children }: any) {
    return (
        <Draggable draggableId={ticket.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className={`${snapshot.isDragging ? "opacity-90 scale-105 shadow-2xl z-50" : ""}`}
                >
                    <TicketCardContent 
                        ticket={ticket} 
                        mode={viewMode} 
                        onDelete={() => onDelete(ticket.id)} 
                        isActive={isActive} 
                        isCompact={isCompact}
                    >
                        {children}
                    </TicketCardContent>
                </div>
            )}
        </Draggable>
    );
}

function TicketCardContent({ ticket, children, isActive, isCompact, onDelete, mode }: any) {
  if (mode === 'compact') {
    return (
      <div className={`relative group flex items-center gap-3 p-2 rounded bg-[#222] border border-[#333] hover:border-gray-500 transition-all ${isActive ? 'border-yellow-500/50 bg-[#2a2a22]' : ''}`}>
        <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden shrink-0">
             {ticket.profiles?.avatar_url ? <img src={ticket.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400"><FaUser /></div>}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-xs font-bold text-white truncate leading-tight">{ticket.title}</span>
            <span className="text-[9px] text-gray-500 truncate flex items-center gap-1">{isActive && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>}{ticket.profiles?.full_name}</span>
        </div>
        {!isCompact && <div className="shrink-0">{children}</div>}
        <button onClick={onDelete} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 px-1"><FaTimes size={10} /></button>
      </div>
    );
  }

  return (
    <div className={`relative group p-4 rounded-xl border transition-all ${isActive ? 'bg-[#2a2a2a] border-yellow-500 shadow-yellow-900/20 shadow-lg' : 'bg-[#222] border-[#333] hover:border-gray-500'}`}>
      <button onClick={onDelete} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><FaTrash size={10} /></button>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden shrink-0 border border-[#444]">
             {ticket.profiles?.avatar_url ? <img src={ticket.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400"><FaUser /></div>}
        </div>
        <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-gray-300 font-bold truncate">{ticket.profiles?.full_name || "Unknown"}</span>
            <span className="text-[10px] text-gray-600 font-mono">{new Date(ticket.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
      <div className={`font-bold text-white mb-3 flex items-start gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
        <FaMusic className="text-blue-500 text-xs mt-1 shrink-0" />
        <span className="leading-snug break-words">{ticket.title}</span>
      </div>
      {!isCompact && <div className="mt-2 pt-3 border-t border-[#333]">{children}</div>}
      {isCompact && children}
    </div>
  );
}

function ActionButton({ onClick, color, icon, label, mode }: any) {
    if (mode === 'compact') {
        return <button onClick={onClick} className={`p-1.5 rounded text-white ${color}`} title={label}>{icon}</button>;
    }
    return <button onClick={onClick} className={`w-full ${color} py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors uppercase tracking-wide`}>{icon} {label}</button>;
}