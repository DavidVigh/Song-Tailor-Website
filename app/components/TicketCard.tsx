"use client";
import Link from "next/link";
import {
  FaClock,
  FaPlay,
  FaCheckCircle,
  FaYoutube,
  FaLongArrowAltRight,
  FaFire,
  FaLayerGroup,
  FaRegCircle,
  FaMusic
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { CarouselThumbnail, BackgroundCarousel } from "@/app/components/TicketCarousels";
import { Ticket } from "@/app/types";

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const links = Array.isArray(ticket.youtube_link)
    ? ticket.youtube_link
    : [ticket.youtube_link];
  const rawThumbnails = getYouTubeThumbnail(links);
  let thumbnails = (
    Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails]
  )
    .filter((url): url is string => url !== null && url !== undefined)
    .map((url) => url.replace("hqdefault", "maxresdefault"));

  const mainCover = thumbnails[0] || "";
  const hasMultipleImages = thumbnails.length > 1;
  const isChoreo = (ticket.music_category || "").toLowerCase() === "choreo";

  // Helper for Status Styling
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "accepted": // Queue
        return {
          label: "Queue",
          icon: <FaLayerGroup size={8} />,
          // ☀️ Light Mode: Solid Blue BG, White Text
          // 🌙 Dark Mode: Glassy Blue
          badgeClass: "bg-blue-600 text-white border-blue-600 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-500/50",
        };
      case "in progress":
        return {
          label: "In Progress",
          icon: <FaPlay size={8} />,
          // ☀️ Light Mode: Solid Yellow BG, White Text
          badgeClass: "bg-yellow-500 text-white border-yellow-500 dark:bg-yellow-900/60 dark:text-yellow-300 dark:border-yellow-500/50",
        };
      case "done":
        return {
          label: "Completed",
          icon: <FaCheckCircle size={8} />,
          // ☀️ Light Mode: Solid Green BG, White Text
          badgeClass: "bg-green-600 text-white border-green-600 dark:bg-green-900/60 dark:text-green-300 dark:border-green-500/50",
        };
      default: // New
        return {
          label: "New",
          icon: <FaRegCircle size={8} />,
          // ☀️ Light Mode: Solid Gray BG, White Text
          badgeClass: "bg-gray-600 text-white border-gray-600 dark:bg-[#333] dark:text-gray-400 dark:border-white/10",
        };
    }
  };

  const statusInfo = getStatusInfo(ticket.status);

  return (
    <div className="
      group relative overflow-hidden flex flex-col rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md border
      /* ☀️ Light Mode */
      border-gray-200 bg-white
      /* 🌙 Dark Mode */
      dark:border-[#333] dark:hover:border-gray-500 dark:bg-[#1e1e1e]
    ">
      
      {/* =========================================================
          TOP CONTAINER (Header + Body content over shared BG)
         ========================================================= */}
      <div className="relative flex-1 flex flex-col overflow-hidden group/image">
        
        {/* 🖼️ SHARED BACKGROUND LAYER */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {thumbnails.length > 0 &&
            (hasMultipleImages ? (
              <BackgroundCarousel images={thumbnails} blur="blur-none" />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/image:scale-110 
                /* ☀️ Light Mode */
                opacity-100 filter brightness-110 contrast-105
                /* 🌙 Dark Mode */
                dark:opacity-50 dark:filter dark:grayscale-[0.2] dark:brightness-100 dark:contrast-100"
                style={{ backgroundImage: `url('${mainCover}')` }}
              />
            ))}
          
          {/* Dark Mode Overlay */}
          <div className="absolute inset-0 hidden dark:block dark:bg-black/50 dark:group-hover/image:bg-black/40 transition-colors duration-300" />
        </div>

        {/* =========================================================
            1. HEADER ROW (Transparent BG, Solid Badges)
           ========================================================= */}
        <div className="relative z-20 p-3 flex items-center justify-between bg-transparent">
          {/* LEFT: Category & Hype Badges */}
          <div className="flex gap-1.5">
            {ticket.hype && (
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 shadow-sm border
                /* ☀️ Light Mode: Solid Red */
                bg-red-600 text-white border-red-600
                /* 🌙 Dark Mode: Glassy Red */
                dark:bg-red-900/60 dark:text-red-300 dark:border-red-500/50 dark:rounded-md"
              >
                <FaFire size={8} /> Hype
              </span>
            )}
            
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm
              ${isChoreo 
                ? "bg-purple-600 text-white border-purple-600 dark:bg-purple-900/60 dark:text-purple-300 dark:border-purple-500/50 dark:rounded-md" 
                : "bg-blue-600 text-white border-blue-600 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-500/50 dark:rounded-md"
              }`}
            >
              {ticket.music_category || "CHOREO"}
            </span>
          </div>

          {/* RIGHT: Status Badge */}
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-1.5
            ${statusInfo.badgeClass} dark:rounded-md`}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        </div>

        {/* =========================================================
            2. MAIN CONTENT OVERLAY
           ========================================================= */}
        <div className="relative z-10 p-4 flex-1 flex items-center">
          <div className="flex gap-3 items-center w-full">
            
            {/* Thumbnail Box */}
            <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden shadow-lg border relative group/thumb
              bg-white border-white
              dark:bg-black dark:border-white/20"
            >
              {thumbnails.length > 0 ? (
                hasMultipleImages ? (
                  <CarouselThumbnail images={thumbnails} links={links} showIndicators={false} />
                ) : (
                  <a
                    href={links[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full relative"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <img
                      src={mainCover}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                      alt="thumb"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/thumb:bg-black/20 transition-colors">
                      <FaYoutube className="text-white drop-shadow-md transform group-hover/thumb:scale-125 transition-transform" />
                    </div>
                  </a>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-500">
                  <FaMusic size={16} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              {/* Title */}
              <Link
                href={`/pages/request/${ticket.id}`}
                className="inline-block max-w-full group/title"
              >
                <h3 className="text-sm font-bold truncate leading-tight transition-all
                  /* ☀️ & 🌙 White Text + Strong Shadow */
                  text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] 
                  group-hover/title:text-blue-300 dark:group-hover/title:text-blue-400"
                >
                  {ticket.title}
                </h3>
              </Link>

              {/* Info Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border shadow-lg backdrop-blur-md
                  /* ☀️ Light Mode */
                  bg-black/50 text-white border-white/20
                  /* 🌙 Dark Mode */
                  dark:bg-black/60 dark:text-gray-200 dark:border-white/10"
                >
                  <span className="font-bold opacity-80">BPM</span>
                  <span className="font-bold">{ticket.base_bpm || "?"}</span>
                  <FaLongArrowAltRight className="opacity-60" />
                  <span className="font-bold">{ticket.target_bpm || "?"}</span>
                </div>

                {ticket.deadline && (
                  <div className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border shadow-lg backdrop-blur-md
                    /* ☀️ Light Mode */
                    bg-yellow-500/90 text-white border-yellow-400/50
                    /* 🌙 Dark Mode */
                    dark:bg-yellow-600/40 dark:text-yellow-100 dark:border-yellow-500/30"
                  >
                    <FaClock size={8} className="text-white dark:text-yellow-400" />
                    <span>{new Date(ticket.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. FOOTER ROW (Date Right)
         ========================================================= */}
      <div className="relative z-20 p-3 pt-3 flex justify-end items-center border-t
        /* ☀️ Light Mode */
        bg-white border-gray-100
        /* 🌙 Dark Mode */
        dark:bg-[#1e1e1e] dark:border-[#333]"
      >
        {/* Right: Created Date */}
        <p className="text-[9px] uppercase tracking-wider font-bold
          text-gray-400
          dark:text-gray-500"
        >
          {new Date(ticket.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}