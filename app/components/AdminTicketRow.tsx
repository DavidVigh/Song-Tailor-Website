"use client";
import { useRouter } from "next/navigation";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { Ticket } from "@/app/types";
import {
  FaTrash,
  FaArrowRight,
  FaTachometerAlt,
  FaLayerGroup,
  FaMusic,
  FaFire,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { CarouselThumbnail } from "./TicketCarousels";

interface AdminTicketRowProps {
  ticket: Ticket;
  colId: string;
  confirmDelete: (id: number) => void;
  advanceStatus: (ticket: Ticket) => void;
}

// 🕒 Helper: Compact Date Formatting & Colors
const getDeadlineCompact = (dateStr: string | null) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Format: "FEB" "10"
  const month = target
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = target.toLocaleDateString("en-US", { day: "numeric" });

  // Text Colors adapted for light/dark
  let colorClass = "text-gray-500 dark:text-gray-400"; // Default
  if (daysLeft < 0) colorClass = "text-red-600 dark:text-red-500 font-bold";
  else if (daysLeft <= 3)
    colorClass = "text-orange-600 dark:text-orange-500 font-bold";
  else if (daysLeft <= 7)
    colorClass = "text-blue-600 dark:text-blue-500 font-bold";

  return { month, day, colorClass };
};

// Helper for Status Border Color
const getStatusBorder = (colId: string) => {
  switch (colId) {
    case "accepted":
      return "border-l-blue-500";
    case "in progress":
      return "border-l-yellow-500";
    case "done":
      return "border-l-green-500";
    default:
      return "border-l-gray-400 dark:border-l-gray-600";
  }
};

const PlaceholderThumb = () => (
  <div className="w-full h-full bg-gray-100 dark:bg-[#1a1a1a] flex flex-col items-center justify-center gap-1">
    <FaMusic className="text-gray-400 dark:text-gray-700 text-sm" />
  </div>
);

export default function AdminTicketRow({
  ticket,
  colId,
  confirmDelete,
  advanceStatus,
}: AdminTicketRowProps) {
  const router = useRouter();

  // Extract Tracks
  const trackUrls = ticket.tracks?.map((t: any) => t.url).filter(Boolean) || [];
  const rawThumbnails = getYouTubeThumbnail(trackUrls);
  const fetchedThumbnails: string[] = rawThumbnails
    ? (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails]).filter(
        (url): url is string => url !== null && url !== undefined,
      )
    : [];

  const dateData = getDeadlineCompact(ticket.deadline || null);

  return (
    <div
      onClick={() => router.push(`/pages/request/${ticket.id}`)}
      className={`group relative w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222] rounded-xl p-2 shadow-sm hover:border-blue-500/30 transition-all duration-200 border-l-[4px] ${getStatusBorder(colId)} cursor-pointer flex items-center gap-3`}
    >
      {/* 1. THUMBNAIL (Fixed Left) */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (trackUrls.length > 0) window.open(trackUrls[0], "_blank");
        }}
        className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-black cursor-alias border border-gray-200 dark:border-white/5"
      >
        {fetchedThumbnails.length > 0 ? (
          <>
            <CarouselThumbnail
              images={fetchedThumbnails}
              links={trackUrls}
              showIndicators={false}
              slideDuration={5000}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
              <FaExternalLinkAlt className="text-white text-[10px]" />
            </div>
          </>
        ) : (
          <PlaceholderThumb />
        )}
      </div>

      {/* 2. INFO MIDDLE (Flexible Width) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        {/* Top: ID & Title */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-widest shrink-0">
            #{ticket.id}
          </span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-none pt-0.5">
            {ticket.title || "Untitled Project"}
          </h3>
        </div>

        {/* Middle: Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[9px] font-black uppercase px-1 py-[1px] rounded-[4px] border ${
              ticket.genre === "rnr"
                ? "text-orange-600 border-orange-500/20 bg-orange-500/5 dark:text-orange-500"
                : "text-purple-600 border-purple-500/20 bg-purple-500/5 dark:text-purple-500"
            }`}
          >
            {ticket.genre === "rnr" ? "RNR" : "FASH"}
          </span>
          <span className="text-[9px] font-black uppercase px-1 py-[1px] rounded-[4px] border text-blue-600 border-blue-500/20 bg-blue-500/5 dark:text-blue-500">
            {ticket.service_name}
          </span>
          {ticket.hype && (
            <span className="text-[9px] font-black text-red-600 border border-red-500/20 bg-red-500/5 dark:text-red-500 px-1 py-[1px] rounded-[4px] flex items-center gap-1">
              <FaFire size={8} />
            </span>
          )}
        </div>

        {/* Bottom: Stats (Price, Tracks, BPM) */}
        <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1" title="Budget">
            <span className="text-gray-900 dark:text-gray-200 font-bold">
              {ticket.total_price?.toLocaleString()}
            </span>
            <span className="text-[8px] text-blue-600 dark:text-blue-500 font-black">
              FT
            </span>
          </div>
          <div className="flex items-center gap-1" title="Tracks">
            <FaLayerGroup size={8} /> <span>{trackUrls.length}</span>
          </div>
          {ticket.target_bpm && (
            <div
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400"
              title="Target BPM"
            >
              <FaTachometerAlt size={8} /> <span>{ticket.target_bpm}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. DEADLINE (Slim Vertical Stack) */}
      <div className="flex flex-col items-center justify-center px-2 py-1 border-l border-r border-gray-100 dark:border-[#222] min-w-[50px]">
        {dateData ? (
          <>
            <span
              className={`text-[9px] font-black uppercase leading-none ${dateData.colorClass} opacity-80`}
            >
              {dateData.month}
            </span>
            <span
              className={`text-lg font-black leading-none ${dateData.colorClass}`}
            >
              {dateData.day}
            </span>
          </>
        ) : (
          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600 uppercase">
            No Date
          </span>
        )}
      </div>

      {/* 4. ACTIONS (Right) */}
      <div className="flex flex-col gap-1.5 shrink-0">
        {colId !== "done" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              advanceStatus(ticket);
            }}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-500 dark:bg-[#252525] dark:text-gray-400 dark:border-[#333] transition-all flex items-center justify-center border border-gray-200"
            title="Next Stage"
          >
            <FaArrowRight size={10} />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            confirmDelete(ticket.id);
          }}
          className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center"
          title="Delete"
        >
          <FaTrash size={10} />
        </button>
      </div>
    </div>
  );
}
