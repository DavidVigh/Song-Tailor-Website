"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  FaMusic, FaClock, FaPlay, FaCheckCircle, 
  FaHourglassHalf, FaYoutube, FaLongArrowAltRight, FaFire, FaUser 
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { CarouselThumbnail, BackgroundCarousel } from "@/app/components/TicketCarousels";
import { Ticket } from "@/app/types"; // Make sure to export your Ticket type from a shared file

interface TicketCardProps {
  ticket: Ticket;
  showSubmitter?: boolean;
}

export default function TicketCard({ ticket, showSubmitter = false }: TicketCardProps) {
  const links = Array.isArray(ticket.youtube_link) ? ticket.youtube_link : [ticket.youtube_link];
  const rawThumbnails = getYouTubeThumbnail(links);
  
  // Clean thumbnails array
  let thumbnails = (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails])
    .filter((url): url is string => url !== null && url !== undefined)
    .map(url => url.replace("hqdefault", "maxresdefault"));

  const mainCover = thumbnails[0] || "";
  const hasMultipleImages = thumbnails.length > 1;
  const isChoreo = (ticket.music_category || "").toLowerCase() === "choreo";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done': return <span className="bg-green-600 text-white border-green-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm"><FaCheckCircle /> Done</span>;
      case 'in progress': return <span className="bg-yellow-600 text-white border-yellow-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm"><FaPlay size={8} /> Mixing</span>;
      case 'queue': case 'accepted': return <span className="bg-blue-600 text-white border-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm"><FaHourglassHalf size={8} /> Queue</span>;
      default: return <span className="bg-gray-700 text-gray-300 border-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm">New</span>;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#333] shadow-lg group hover:border-gray-500 transition-all duration-300 flex flex-col h-full bg-[#1e1e1e]">
      
      {/* Background Layer */}
      {thumbnails.length > 0 ? (
        hasMultipleImages ? (
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

      {/* Content Layer */}
      <div className="relative z-10 p-5 flex flex-col h-full">
        
        {/* Submitter Info (Optional for Admin View) */}
        {showSubmitter && ticket.profiles && (
          <div className="flex items-center gap-2 mb-3 bg-black/40 p-2 rounded-lg border border-white/5 backdrop-blur-sm">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 border border-white/20">
              {ticket.profiles.avatar_url ? (
                <img src={ticket.profiles.avatar_url} alt="user" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="w-full h-full p-1 text-gray-400" />
              )}
            </div>
            <span className="text-[11px] font-bold text-gray-200 truncate">{ticket.profiles.full_name}</span>
          </div>
        )}

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
          <div className="shrink-0 w-24 aspect-video rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black relative group/thumb">
            {thumbnails.length > 0 ? (
              hasMultipleImages ? (
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

          <div className="flex-1 min-w-0">
            <Link href={`/pages/request/${ticket.id}`} className="hover:underline decoration-blue-500">
              <h2 className="text-lg font-bold text-white leading-tight drop-shadow-md truncate mb-2">
                {ticket.title}
              </h2>
            </Link>
            
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 bg-black/40 px-2 py-1 rounded w-fit border border-white/10 backdrop-blur-sm">
               <span className="font-bold text-gray-500">BPM:</span> 
               {isChoreo && !ticket.base_bpm ? (
                 <span className="text-white font-mono">{ticket.target_bpm}</span>
               ) : (
                 <>
                   <span className="text-white font-mono">{ticket.base_bpm}</span>
                   <FaLongArrowAltRight className="text-gray-500" />
                   <span className="text-white font-mono">{ticket.target_bpm}</span>
                 </>
               )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center">
           {ticket.deadline && (
              <div className="text-[10px] text-yellow-200/90 flex items-center gap-1 font-medium bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                <FaClock size={10} /> {new Date(ticket.deadline).toLocaleDateString()}
              </div>
           )}
           <span className="text-[10px] text-gray-500 ml-auto uppercase tracking-tighter">
             {new Date(ticket.created_at).toLocaleDateString()}
           </span>
        </div>
      </div>
    </div>
  );
}