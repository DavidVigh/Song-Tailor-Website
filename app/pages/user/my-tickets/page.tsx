"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  FaChevronLeft, 
  FaClock, 
  FaCheck, 
  FaPlay, 
  FaCheckDouble, 
  FaTrash, 
  FaMusic 
} from "react-icons/fa";

type Ticket = {
  id: string;
  title: string;
  status: 'pending' | 'accepted' | 'in progress' | 'completed';
  created_at: string;
};

export default function MyTicketsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  async function fetchMyTickets() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Fetch tickets for THIS user only
      const { data, error } = await supabase
        .from("song_requests")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  // 🗑️ Delete Request (Only if Pending)
  async function deleteTicket(id: string) {
    if (!confirm("Do you want to cancel this request?")) return;

    setTickets(current => current.filter(t => t.id !== id));
    await supabase.from("song_requests").delete().eq("id", id);
  }

  // 🎨 STATUS BADGE GENERATOR
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': // BLUE
        return (
          <span className="flex items-center gap-1.5 bg-blue-900/30 text-blue-400 border border-blue-800/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <FaCheck /> Queue
          </span>
        );
      case 'in progress': // YELLOWISH
        return (
          <span className="flex items-center gap-1.5 bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <FaPlay className="text-[8px]" /> Playing
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
          </span>
        );
      case 'completed': // GREEN (Success)
        return (
          <span className="flex items-center gap-1.5 bg-green-900/30 text-green-400 border border-green-800/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <FaCheckDouble /> Done
          </span>
        );
      default: // PENDING (Gray/Neutral)
        return (
          <span className="flex items-center gap-1.5 bg-zinc-800 text-gray-400 border border-zinc-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <FaClock /> Pending
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white font-sans">
      
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-b from-blue-900/20 to-[#1a1a1a]">
        <div 
            className="absolute top-6 left-6 cursor-pointer p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm" 
            onClick={() => router.back()}
        >
          <FaChevronLeft className="text-lg" />
        </div>
        <div className="absolute bottom-4 left-6">
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-xs text-gray-500">Track your song requests</p>
        </div>
      </div>

      <div className="px-6 pb-20 max-w-lg mx-auto">
        {loading ? (
           <div className="text-center py-10 text-gray-500 animate-pulse">Loading tickets...</div>
        ) : tickets.length === 0 ? (
           <div className="text-center py-16 flex flex-col items-center opacity-50">
             <FaMusic className="text-4xl mb-4 text-gray-600" />
             <p className="text-gray-400">No requests yet.</p>
           </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`
                  relative bg-[#222] border rounded-xl p-4 transition-all
                  ${ticket.status === 'in progress' ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-[#333]'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                   {getStatusBadge(ticket.status)}
                   
                   {/* Delete Button (Only visible if pending) */}
                   {ticket.status === 'pending' && (
                     <button 
                       onClick={() => deleteTicket(ticket.id)}
                       className="text-gray-600 hover:text-red-500 p-1 transition-colors"
                     >
                       <FaTrash size={12} />
                     </button>
                   )}
                </div>

                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${ticket.status === 'in progress' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[#2a2a2a] text-blue-500'}`}>
                        <FaMusic />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-200 line-clamp-1">{ticket.title}</h3>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}