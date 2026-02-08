"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaMusic,
  FaTrash,
  FaCheck,
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaYoutube,
  FaLongArrowAltRight,
  FaFire,
  FaUser,
  FaPen,
  FaPlusCircle,
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import {
  CarouselThumbnail,
  BackgroundCarousel,
} from "@/app/components/TicketCarousels";
import { Ticket } from "@/app/types";

// 🕒 HELPER: Time Ago Formatter
function timeAgo(dateString: string) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle negative seconds (clock skew) or very recent updates
  if (seconds < 5) return "Just now";

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}w ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

interface AdminTicketCardProps {
  ticket: Ticket;
  colId: string;
  confirmDelete: (id: number) => void;
  advanceStatus: (ticket: Ticket) => void;
}

export default function AdminTicketCard({
  ticket,
  colId,
  confirmDelete,
  advanceStatus,
}: AdminTicketCardProps) {
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

  // State for both timestamps
  const [times, setTimes] = useState({ created: "", updated: "" });

  useEffect(() => {
    const updateTimes = () => {
      setTimes({
        created: timeAgo(ticket.created_at),
        updated: ticket.updated_at
          ? timeAgo(ticket.updated_at)
          : timeAgo(ticket.created_at),
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 10000);
    return () => clearInterval(interval);
  }, [ticket.created_at, ticket.updated_at]);

  return (
    <div
      className="
      group relative overflow-hidden flex flex-col rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md border
      /* ☀️ Light Mode: White Border */
      border-gray-200 
      /* 🌙 Dark Mode: Dark Border */
      dark:border-[#333] dark:hover:border-gray-500
    "
    >
      {/* 🖼️ BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-2xl">
        {thumbnails.length > 0 &&
          (hasMultipleImages ? (
            <BackgroundCarousel images={thumbnails} blur="blur-none" />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center 
              /* ☀️ Light Mode: 100% Opacity */
              opacity-100 filter brightness-110 contrast-105
              /* 🌙 Dark Mode: Increased Visibility */
              dark:opacity-50 dark:filter dark:grayscale-[0.2] dark:brightness-100 dark:contrast-100"
              style={{ backgroundImage: `url('${mainCover}')` }}
            />
          ))}

        {/* Dark Mode Overlay */}
        <div className="absolute inset-0 hidden dark:block dark:bg-black/50 dark:group-hover:bg-black/40 transition-colors duration-300" />
      </div>

      {/* 👤 HEADER: SUBMITTER INFO & BADGES */}
      <div className="relative z-20 p-3 flex items-center justify-between">
        <Link
          href={`/pages/admin/user/${ticket.user_id}`}
          className="flex items-center gap-2 group/user p-1 rounded-lg transition-all
            hover:bg-black/20 dark:hover:bg-black/40"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full overflow-hidden border shrink-0 transition-colors
            /* ☀️ Light Mode: White Border + Heavy Drop Shadow */
            bg-white border-white shadow-[0_2px_4px_rgba(0,0,0,0.5)]
            /* 🌙 Dark Mode: Dark Border */
            dark:bg-[#2a2a2a] dark:border-white/20 dark:group-hover/user:border-blue-500"
          >
            {ticket.profiles?.avatar_url ? (
              <img
                src={ticket.profiles.avatar_url}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <FaUser size={12} />
              </div>
            )}
          </div>

          <div className="min-w-0 pr-2">
            {/* User Name */}
            <p
              className="text-[11px] font-bold leading-tight truncate transition-colors duration-300
              /* ☀️ & 🌙 Both Modes: White Text + Strong Shadow */
              text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.9)] 
              group-hover/user:text-blue-200 dark:group-hover/user:text-blue-300"
            >
              {ticket.profiles?.full_name || "Unknown"}
            </p>

            {/* 🕒 TIME AGO LABELS (Created / Updated) */}
            <div
              className="text-[8px] uppercase tracking-wide font-bold flex items-center gap-1.5 leading-tight
              text-white/90 drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.9)]
              dark:text-white/70"
            >
              <span className="flex items-center gap-0.5">
                <FaPlusCircle className="text-[6px] opacity-70" />{" "}
                {times.created}
              </span>
              <span className="opacity-50">|</span>
              <span className="flex items-center gap-0.5 text-blue-200 dark:text-blue-300">
                <FaPen className="text-[6px] opacity-70" /> {times.updated}
              </span>
            </div>
          </div>
        </Link>

        {/* Badges */}
        <div className="flex gap-1.5 transition-opacity duration-200 group-hover:opacity-0 group-hover:pointer-events-none">
          {ticket.hype && (
            <span
              className="px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 shadow-md border
              /* ☀️ Light Mode: Solid Red BG, White Text */
              bg-red-600 text-white border-red-600 backdrop-blur-md
              /* 🌙 Dark Mode: Glassy Red */
              dark:bg-red-900/60 dark:text-red-300 dark:border-red-500/50 dark:rounded-md dark:shadow-sm"
            >
              <FaFire size={8} /> Hype
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shadow-md backdrop-blur-md
            ${
              isChoreo
                ? /* ☀️ Light Mode: Solid Purple/Blue */
                  "bg-purple-600 text-white border-purple-600 dark:bg-purple-900/60 dark:text-purple-300 dark:border-purple-500/50 dark:rounded-md"
                : "bg-blue-600 text-white border-blue-600 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-500/50 dark:rounded-md"
            }`}
          >
            {ticket.music_category || "CHOREO"}
          </span>
        </div>
      </div>

      {/* 🗑️ DELETE BUTTON */}
      <button
        onClick={() => confirmDelete(ticket.id)}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 p-2 m-2 rounded-lg shadow-sm
          bg-white text-gray-400 hover:bg-red-500 hover:text-white border border-gray-200
          dark:bg-[#333] dark:text-gray-400 dark:hover:bg-red-600 dark:border-none dark:m-0 dark:p-3 dark:rounded-none dark:rounded-bl-xl"
      >
        <FaTrash size={12} />
      </button>

      {/* 🎵 MAIN CONTENT */}
      {/* Footer border is now semi-transparent white */}
      <div className="relative z-10 p-3 pt-1 border-b border-white/10">
        <div className="flex gap-3 items-center">
          {/* Thumbnail Box */}
          <div
            className="shrink-0 w-12 h-12 rounded-lg overflow-hidden shadow-lg border relative group/thumb
  bg-white border-white
  dark:bg-black dark:border-white/20"
          >
            {thumbnails.length > 0 ? (
              hasMultipleImages ? (
                <CarouselThumbnail
                  images={thumbnails}
                  links={links}
                  showIndicators={false}
                />
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
                    className="w-full h-full object-cover"
                    alt="thumb"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/thumb:bg-black/20 transition-colors">
                    <FaYoutube className="text-white drop-shadow-md transition-all duration-300 transform group-hover/thumb:scale-125 group-hover/thumb:text-red-600" />
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
              <h3
                className="text-sm font-bold truncate leading-tight transition-all
                /* ☀️ & 🌙 White Text + Strong Shadow */
                text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] 
                group-hover/title:text-blue-300 dark:group-hover/title:text-blue-400"
              >
                {ticket.title}
              </h3>
            </Link>

            {/* Info Badges */}
            <div className="flex flex-wrap gap-2">
              <div
                className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border shadow-lg backdrop-blur-md
                /* ☀️ Light Mode: Semi-Transparent Black BG */
                bg-black/50 text-white border-white/20
                /* 🌙 Dark Mode: Similar transparency for consistency */
                dark:bg-black/60 dark:text-gray-200 dark:border-white/10"
              >
                <span className="font-bold opacity-80">BPM</span>
                <span className="font-bold">{ticket.base_bpm || "?"}</span>
                <FaLongArrowAltRight className="opacity-60" />
                <span className="font-bold">{ticket.target_bpm || "?"}</span>
              </div>

              {ticket.deadline && (
                <div
                  className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border shadow-lg backdrop-blur-md
                  /* ☀️ Light Mode */
                  bg-yellow-500/90 text-white border-yellow-400/50
                  /* 🌙 Dark Mode: Slightly brighter yellow now */
                  dark:bg-yellow-600/40 dark:text-yellow-100 dark:border-yellow-500/30"
                >
                  <FaClock
                    size={8}
                    className="text-white dark:text-yellow-400"
                  />
                  <span>{new Date(ticket.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ ACTION BAR (Bottom) */}
      <div className="relative z-20 p-3 pt-3 flex gap-2">
        {colId !== "done" ? (
          <button
            onClick={() => advanceStatus(ticket)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm
              ${colId === "new" ? "bg-blue-600 hover:bg-blue-500 text-white" : ""}
              ${colId === "accepted" ? "bg-yellow-500 hover:bg-yellow-400 text-white" : ""}
              ${colId === "in progress" ? "bg-green-600 hover:bg-green-500 text-white" : ""}
            `}
          >
            {colId === "new" && (
              <>
                <FaCheck /> Accept
              </>
            )}
            {colId === "accepted" && (
              <>
                <FaPlay size={8} /> Start
              </>
            )}
            {colId === "in progress" && (
              <>
                <FaCheckCircle /> Finish
              </>
            )}
          </button>
        ) : (
          <div
            className="flex-1 py-2 rounded-lg text-[9px] uppercase tracking-[0.2em] flex items-center justify-center border font-bold shadow-sm
            bg-gray-100 text-gray-500 border-gray-200
            dark:bg-black/40 dark:text-gray-400 dark:border-white/10 dark:font-black"
          >
            Completed
          </div>
        )}
      </div>
    </div>
  );
}
