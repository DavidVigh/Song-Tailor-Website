"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaMusic, FaClock, FaSpinner, FaYoutube, FaAlignLeft, FaCheckCircle, FaPlay, FaHourglassHalf } from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";

// --- 🎠 SUB-COMPONENT: Foreground Thumbnail Carousel (Infinite Loop) ---
const CarouselThumbnail = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  // Clone first image to end for seamless loop
  const extendedImages = [...images, images[0]];

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Handle the infinite loop reset
  useEffect(() => {
    if (currentIndex === images.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false); 
        setCurrentIndex(0); 
      }, 700); 
      return () => clearTimeout(timeout);
    }
    
    if (currentIndex === 0) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <div 
        className="flex h-full"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
        }}
      >
        {extendedImages.map((img, i) => (
          <div key={i} className="w-full h-full shrink-0">
            <img src={img} alt={`slide-${i}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      {/* Dots (Only show for real images) */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
        {images.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 shadow-sm
              ${(currentIndex % images.length) === i ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}
            `}
          />
        ))}
      </div>
    </div>
  );
};

// --- 🌫️ SUB-COMPONENT: Background Blurry Carousel (Infinite Loop) ---
const BackgroundCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const extendedImages = [...images, images[0]];

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000); 

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (currentIndex === images.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 700);
      return () => clearTimeout(timeout);
    }
    if (currentIndex === 0) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, images.length]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div 
        className="flex h-full w-full"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
        }}
      >
        {extendedImages.map((img, i) => (
          <div key={i} className="w-full h-full shrink-0 relative">
             {/* 🛠️ BLUR ADJUSTED: blur-md */}
             <div 
               className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-50"
               style={{ backgroundImage: `url('${img}')` }}
             />
             <div className="absolute inset-0 bg-black/80" />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTickets(data || []);
    
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
      <FaSpinner className="animate-spin text-4xl text-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#121212] text-white max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
        <FaMusic className="text-blue-500" /> My Requests
      </h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {tickets.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-[#1e1e1e] rounded-2xl border border-[#333]">
            <p className="text-gray-400 mb-4">You haven't made any requests yet.</p>
            <button 
              onClick={() => router.push("/pages/request")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-colors"
            >
              Create New Request
            </button>
          </div>
        ) : (
          tickets.map((ticket) => {
            const raw = getYouTubeThumbnail(ticket.youtube_link);
            const thumbnails = Array.isArray(raw) ? raw : (raw ? [raw] : []);
            
            const hasMultipleImages = thumbnails.length > 1;
            const mainCover = thumbnails[0] || "";

            return (
              <div 
                key={ticket.id} 
                className="relative overflow-hidden rounded-xl border border-[#333] shadow-lg group hover:border-gray-500 transition-all duration-300 flex flex-col h-full"
              >
                {/* 🎨 LAYER 1: Background */}
                {thumbnails.length > 0 ? (
                  hasMultipleImages ? (
                    <BackgroundCarousel images={thumbnails} />
                  ) : (
                    <>
                      {/* 🛠️ BLUR ADJUSTED: blur-md */}
                      <div 
                        className="absolute inset-0 z-0 bg-cover bg-center filter blur-md scale-110 opacity-40 transition-transform duration-500 group-hover:scale-125"
                        style={{ backgroundImage: `url('${mainCover}')` }}
                      />
                      <div className="absolute inset-0 z-0 bg-black/80" />
                    </>
                  )
                ) : (
                  <div className="absolute inset-0 z-0 bg-[#1e1e1e]" />
                )}

                {/* 📦 LAYER 2: Content */}
                <div className="relative z-10 p-4 sm:p-5 flex flex-col h-full">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-white leading-tight drop-shadow-md truncate pr-4">
                      {ticket.title}
                    </h2>
                    
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm shrink-0
                      ${ticket.status === 'done' ? 'bg-green-600 text-white border-green-400' : 
                        ticket.status === 'in progress' ? 'bg-yellow-600 text-white border-yellow-400' :
                        ticket.status === 'queue' ? 'bg-blue-600 text-white border-blue-400' :
                        'bg-gray-700 text-gray-300 border-gray-500'}
                    `}>
                      {ticket.status === 'done' && <FaCheckCircle />}
                      {ticket.status === 'in progress' && <FaPlay size={8} />}
                      {ticket.status === 'queue' && <FaHourglassHalf size={8} />}
                      {ticket.status === 'new' && "NEW"}
                      {ticket.status !== 'new' && ticket.status}
                    </span>
                  </div>

                  {/* 🛠️ Body: Responsive Layout (Stack on mobile, Side-by-side on desktop) */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-4 items-start">
                    
                    {/* Thumbnail Container */}
                    <div className="shrink-0 w-full sm:w-40 aspect-video rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black relative group/thumb">
                      {thumbnails.length > 0 ? (
                        hasMultipleImages ? (
                          <CarouselThumbnail images={thumbnails} />
                        ) : (
                          <div className="w-full h-full relative">
                             <img 
                               src={thumbnails[0]} 
                               className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500" 
                               alt="thumb"
                             />
                             <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                <FaYoutube className="text-red-500 drop-shadow-lg scale-125" />
                             </div>
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <FaMusic size={24} />
                        </div>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex-1 space-y-3 w-full">
                       <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded text-[11px] border tracking-wide font-bold shadow-sm
                            ${(ticket.music_category || "").toLowerCase() === 'choreo' 
                               ? 'bg-purple-900/40 text-purple-200 border-purple-700' 
                               : 'bg-blue-900/40 text-blue-200 border-blue-700'}
                          `}>
                            {ticket.music_category || "Dance Class"}
                          </span>
                       </div>
                       
                       <div className="text-sm text-gray-300">
                          <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">BPM:</span> 
                          <span className="ml-2 font-mono text-white">{ticket.base_bpm || "?"} ➝ {ticket.target_bpm || "?"}</span>
                       </div>

                       {ticket.deadline && (
                         <div className="text-xs text-yellow-500/90 flex items-center gap-1.5 font-medium bg-yellow-500/10 px-2 py-1 rounded w-fit border border-yellow-500/20">
                            <FaClock size={10} /> 
                            {new Date(ticket.deadline).toLocaleDateString()}
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Description */}
                  {ticket.description && (
                    <div className="mt-auto pt-3 border-t border-white/5">
                      <div className="flex items-start gap-2 text-xs text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5">
                        <FaAlignLeft className="mt-0.5 text-gray-500 shrink-0" />
                        <p className="line-clamp-3 leading-relaxed opacity-90">{ticket.description}</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}