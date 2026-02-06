"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaMusic, 
  FaClock, 
  FaPlay, 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaPlus, 
  FaYoutube, 
  FaLongArrowAltRight, 
  FaFire
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { CarouselThumbnail, BackgroundCarousel } from "@/app/components/TicketCarousels";

type Ticket = {
  id: number;
  title: string;
  youtube_link: string | string[];
  status: "new" | "queue" | "in progress" | "done";
  created_at: string;
  base_bpm: string;
  target_bpm: string;
  deadline: string;
  music_category: string;
  hype?: boolean;
};

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  async function fetchMyTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data, error } = await supabase
      .from("song_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTickets(data as Ticket[]);
    setLoading(false);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done': return <span className="bg-green-600 text-white border-green-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm"><FaCheckCircle /> Done</span>;
      case 'in progress': return <span className="bg-yellow-600 text-white border-yellow-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm"><FaPlay size={8} /> Mixing</span>;
      case 'queue': return <span className="bg-blue-600 text-white border-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm"><FaHourglassHalf size={8} /> Queue</span>;
      default: return <span className="bg-gray-700 text-gray-300 border-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm">New</span>;
    }
  };

  if (loading) return <div className="p-10 text-center text-white">Loading your tickets...</div>;

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaMusic className="text-purple-500" /> My Requests
        </h1>
        <Link href="/pages/request" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
          <FaPlus /> New Request
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tickets.map((ticket) => {
          const links = Array.isArray(ticket.youtube_link) ? ticket.youtube_link : [ticket.youtube_link];
          const rawThumbnails = getYouTubeThumbnail(links);
          
          // 🛠️ TYPE FIX: Filter out nulls and force type to string[]
          let thumbnails = (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails])
            .filter((url): url is string => url !== null && url !== undefined);

          // 🌟 HD Thumbnails
          thumbnails = thumbnails.map(url => url.replace("hqdefault", "maxresdefault"));

          const mainCover = thumbnails[0] || "";
          const hasMultipleImages = thumbnails.length > 1;
          const isChoreo = (ticket.music_category || "").toLowerCase() === "choreo";

          return (
            <div 
              key={ticket.id} 
              className="relative overflow-hidden rounded-2xl border border-[#333] shadow-lg group hover:border-gray-500 transition-all duration-300 flex flex-col h-full bg-[#1e1e1e]"
            >
              {/* Background */}
              {thumbnails.length > 0 ? (
                hasMultipleImages ? (
                  // ✅ Type error fixed here by passing clean string[]
                  <BackgroundCarousel images={thumbnails} blur="blur-none" />
                ) : (
                  <>
                    <div 
                      className="absolute inset-0 z-0 bg-cover bg-center filter blur-none scale-110 opacity-40 transition-transform duration-500 group-hover:scale-125"
                      style={{ backgroundImage: `url('${mainCover}')` }}
                    />
                    <div className="absolute inset-0 z-0 bg-black/60" />
                  </>
                )
              ) : (
                <div className="absolute inset-0 z-0 bg-[#1e1e1e]" />
              )}

              {/* Content */}
              <div className="relative z-10 p-5 flex flex-col h-full">
                
                {/* Top Row: Category & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] border tracking-wide font-bold shadow-sm truncate
                      ${isChoreo ? 'bg-purple-900/60 text-purple-200 border-purple-700' : 'bg-blue-900/60 text-blue-200 border-blue-700'}
                    `}>
                      {ticket.music_category || "Class Music"}
                    </span>
                    {ticket.hype && (
                        <span className="px-2 py-0.5 rounded text-[10px] border tracking-wide font-bold shadow-sm bg-red-900/60 text-red-200 border-red-700 flex items-center gap-1">
                            <FaFire size={10} /> Hype
                        </span>
                    )}
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                {/* Main Body */}
                <div className="flex gap-4 mb-4 items-start">
                  
                  {/* Thumbnail Box */}
                  <div className="shrink-0 w-24 aspect-video rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black relative group/thumb">
                    {thumbnails.length > 0 ? (
                      hasMultipleImages ? (
                        // ✅ Type error fixed here too
                        <CarouselThumbnail images={thumbnails} showIndicators={false} />
                      ) : (
                        <div className="w-full h-full relative">
                           <img src={thumbnails[0]} className="w-full h-full object-cover" alt="thumb" />
                           <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <FaYoutube className="text-white drop-shadow-lg" />
                           </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <FaMusic size={20} />
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/pages/request/${ticket.id}`} className="hover:underline decoration-blue-500">
                      <h2 className="text-lg font-bold text-white leading-tight drop-shadow-md truncate mb-2">
                        {ticket.title}
                      </h2>
                    </Link>
                    
                    {/* Updated BPM Badge */}
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-300 bg-black/40 px-2 py-1 rounded w-fit border border-white/10 backdrop-blur-sm">
                       <span className="font-bold text-gray-500">BPM:</span> 
                       <span className="text-white font-mono">{ticket.base_bpm}</span>
                       <FaLongArrowAltRight className="text-gray-500" />
                       <span className="text-white font-mono">{ticket.target_bpm}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Date */}
                <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
                   {ticket.deadline && (
                      <div className="text-[10px] text-yellow-200/90 flex items-center gap-1 font-medium bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                        <FaClock size={10} /> {new Date(ticket.deadline).toLocaleDateString()}
                      </div>
                   )}
                   <span className="text-[10px] text-gray-500 ml-auto">
                     Created: {new Date(ticket.created_at).toLocaleDateString()}
                   </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-20 bg-[#1e1e1e] rounded-3xl border border-[#333] border-dashed mt-8">
          <h3 className="text-xl font-bold text-white mb-2">No Requests Yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first song request!</p>
          <Link href="/pages/request" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Create Request
          </Link>
        </div>
      )}

    </div>
  );
}