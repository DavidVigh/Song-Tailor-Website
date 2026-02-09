"use client";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { Ticket } from "@/app/types";
import { 
  FaClock, FaTrash, FaArrowRight, 
  FaBolt, FaTachometerAlt, FaLayerGroup, FaMusic,
  FaFire, FaRegCircle, FaPlay, FaCheckCircle 
} from "react-icons/fa";
import { CarouselThumbnail, BackgroundCarousel } from "./TicketCarousels"; 

// 🛠️ FIX: Defining the missing interface
interface AdminTicketCardProps {
  ticket: Ticket;
  colId: string;
  confirmDelete: (id: number) => void;
  advanceStatus: (ticket: Ticket) => void;
}

// 🖼️ PLACEHOLDER COMPONENT
const PlaceholderThumb = () => (
  <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex flex-col items-center justify-center gap-2 border border-white/5 shadow-inner">
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500/30">
      <FaMusic size={24} />
    </div>
    <span className="text-[8px] font-black text-gray-400 dark:text-white/10 uppercase tracking-[0.2em]">No Media Attached</span>
  </div>
);

export default function AdminTicketCard({ 
  ticket, 
  colId, 
  confirmDelete, 
  advanceStatus 
}: AdminTicketCardProps) {
  
  // 🛠️ EXTRACTING TRACKS FROM JSONB
  const trackUrls = ticket.tracks?.map((t: any) => t.url).filter(Boolean) || [];
  const rawThumbnails = getYouTubeThumbnail(trackUrls);
  const fetchedThumbnails: string[] = rawThumbnails
    ? (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails]).filter((url): url is string => url !== null && url !== undefined)
    : [];

  // 🛠️ FALLBACK LOGIC
  const thumbnails: string[] = fetchedThumbnails.length > 0 ? fetchedThumbnails : ["/images/placeholder-pattern.jpg"]; 

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.2rem] p-5 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
      
      {/* 🌫️ BACKGROUND CAROUSEL */}
      <BackgroundCarousel 
        images={thumbnails} 
        blur="blur-xl" 
        slideDuration={6000} 
      />

      {/* GRADIENT OVERLAY FOR LEGIBILITY */}
      <div className="absolute inset-0 z-1 bg-linear-to-b from-white/10 via-white/80 to-white dark:from-black/10 dark:via-black/60 dark:to-[#111111] pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full flex-1">
        
        {/* 🖼️ THUMBNAIL CAROUSEL */}
        <div className="w-full h-44 rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-blue-500/30 transition-all shadow-2xl mb-5 bg-gray-50 dark:bg-black/20">
          {fetchedThumbnails.length > 0 ? (
            <CarouselThumbnail 
              images={fetchedThumbnails} 
              links={trackUrls} 
              showIndicators={true} 
              slideDuration={4000}
            />
          ) : (
            <PlaceholderThumb />
          )}
        </div>

        <div className="space-y-4 flex-1 flex flex-col">
          {/* Badge Row: Genre, Service, Hype | Status */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest
                ${ticket.genre === 'rnr' 
                  ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' 
                  : 'border-purple-500/30 text-purple-500 bg-purple-500/5'}`}>
                {ticket.genre === 'rnr' ? 'ROCK & ROLL' : 'FASHION'}
              </span>
              <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest border-blue-500/30 text-blue-500 bg-blue-500/5">
                {ticket.service_name}
              </span>
              {ticket.hype && (
                <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest flex items-center gap-1 border-red-500/30 text-red-500 bg-red-500/5">
                  <FaFire size={8} /> HYPE
                </span>
              )}
            </div>
            <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest flex items-center gap-1 shrink-0
              ${ticket.status === 'accepted' ? 'border-blue-500/30 text-blue-500 bg-blue-500/5'
                : ticket.status === 'in progress' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                : ticket.status === 'done' ? 'border-green-500/30 text-green-500 bg-green-500/5'
                : 'border-gray-500/30 text-gray-500 bg-gray-500/5'}`}>
              {ticket.status === 'accepted' ? <FaLayerGroup size={8} />
                : ticket.status === 'in progress' ? <FaPlay size={8} />
                : ticket.status === 'done' ? <FaCheckCircle size={8} />
                : <FaRegCircle size={8} />}
              {ticket.status === 'accepted' ? 'QUEUE'
                : ticket.status === 'in progress' ? 'PLAYING'
                : ticket.status === 'done' ? 'DONE'
                : 'NEW'}
            </span>
          </div>

          {/* Title & Meta */}
          <div className="flex justify-between items-start">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[7px] font-black text-blue-500/40 uppercase tracking-widest">
                  ID: #{ticket.id}
                </span>
              </div>
              <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight truncate pr-4">
                {ticket.title || "Untitled Project"}
              </h3>
              <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FaLayerGroup size={10} className="text-blue-500/30" /> 
                {trackUrls.length} {trackUrls.length === 1 ? 'Track' : 'Tracks'}
              </p>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(ticket.id);
              }}
              className="p-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
            >
              <FaTrash size={14} />
            </button>
          </div>

          {/* Technical Info Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="space-y-1">
              <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest block">Deadline</span>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${ticket.deadline ? 'text-red-500' : 'text-gray-400'}`}>
                <FaClock size={10} /> {ticket.deadline || "NO DATE"}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest block">Total Price</span>
              <div className="text-xs font-black text-gray-900 dark:text-white">
                {ticket.total_price?.toLocaleString()} <span className="text-[8px] text-blue-500 font-black uppercase tracking-[0.2em]">FT</span>
              </div>
            </div>
          </div>

          {/* GLOBAL PROJECT BPM */}
          {ticket.target_bpm && (
            <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10 px-4 py-2.5 rounded-2xl border border-blue-500/10">
              <div className="flex items-center gap-2">
                <FaTachometerAlt size={12} className="text-blue-500" />
                <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Global Tempo</span>
              </div>
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{ticket.target_bpm} BPM</span>
            </div>
          )}

          {/* Status Advancement Button */}
          {colId !== 'done' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                advanceStatus(ticket);
              }}
              className="w-full mt-auto flex items-center justify-center gap-3 py-4 rounded-3xl bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95 shadow-xl"
            >
              {colId === 'new' ? 'Move to Queue' : colId === 'accepted' ? 'Start Production' : 'Mark as Done'} 
              <FaArrowRight size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}