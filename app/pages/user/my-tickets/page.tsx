"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaMusic, FaClock } from "react-icons/fa"; 
// 🛠️ Import the helper
import { getYouTubeThumbnail } from "@/app/lib/utils";

type Ticket = {
  id: number;
  title: string;
  youtube_link: string;
  status: "new" | "queue" | "in progress" | "done";
  created_at: string;
  base_bpm: string;
  target_bpm: string;
  deadline: string;
};

export default function MyTicketsPage() {
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMyTickets();
  }, []);

  async function fetchMyTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("song_requests")
      .select("*")
      .eq("user_id", user.id) // Only get MY tickets
      .order("created_at", { ascending: false });

    if (error) console.error("Error:", error);
    else setMyTickets(data as Ticket[]);
    
    setLoading(false);
  }

  if (loading) return <div className="p-10 text-center text-white">Loading your tickets...</div>;

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-blue-500">My</span> Tickets
      </h1>

      <div className="space-y-4">
        {myTickets.map((ticket) => {
          // 1. Get Thumbnail
          const thumbnail = getYouTubeThumbnail(ticket.youtube_link);
          const isInProgress = ticket.status === 'in progress';

          return (
            <div 
              key={ticket.id} 
              className={`bg-[#1e1e1e] border border-[#333] p-4 rounded-xl flex items-center gap-4 transition-all group
                ${isInProgress ? 'border-yellow-600/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'hover:border-gray-500'}
              `}
            >
              
              {/* 🖼️ THUMBNAIL / ICON LOGIC */}
              <div className="shrink-0">
                {thumbnail ? (
                  <a 
                    href={ticket.youtube_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-16 h-16 rounded-lg overflow-hidden border border-[#444] relative group/img"
                  >
                    <img src={thumbnail} alt="Cover" className="w-full h-full object-cover" />
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent flex items-center justify-center transition-all">
                      <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-1 shadow-sm drop-shadow-md"></div>
                    </div>
                  </a>
                ) : (
                  // 🎵 FALLBACK ICON (If no link)
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl border border-[#333]
                    ${isInProgress ? 'bg-yellow-900/20 text-yellow-500' : 'bg-[#2a2a2a] text-blue-500'}
                  `}>
                    <FaMusic />
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-white truncate pr-4">{ticket.title}</h3>
                  
                  {/* PULSATING STATUS BADGE */}
                  <div className="flex items-center">
                    {isInProgress && (
                      <span className="relative flex h-2.5 w-2.5 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                      </span>
                    )}
                    
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border
                      ${ticket.status === 'done' ? 'bg-green-900/30 text-green-400 border-green-800' : ''}
                      ${ticket.status === 'in progress' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800 animate-pulse' : ''}
                      ${ticket.status === 'queue' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : ''}
                      ${ticket.status === 'new' ? 'bg-gray-700 text-gray-300 border-gray-600' : ''}
                    `}>
                      {ticket.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                   <span className="bg-[#252525] px-1.5 py-0.5 rounded border border-[#333]">
                     {ticket.base_bpm} ➝ {ticket.target_bpm} BPM
                   </span>
                   {ticket.deadline && (
                     <span className="flex items-center gap-1">
                       <FaClock size={10} /> {ticket.deadline}
                     </span>
                   )}
                </div>
              </div>

            </div>
          );
        })}

        {myTickets.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-[#1e1e1e] rounded-xl border border-[#333] border-dashed">
                You haven't requested any songs yet.
            </div>
        )}
      </div>
    </div>
  );
}