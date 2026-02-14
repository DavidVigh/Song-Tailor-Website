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
} from "react-icons/fa";
import { CarouselThumbnail } from "./TicketCarousels";

interface AdminTicketRowProps {
  ticket: Ticket;
  colId: string;
  confirmDelete: (id: number) => void;
  advanceStatus: (ticket: Ticket) => void;
}

const getDeadlineCompact = (dateStr: string | null) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const month = target
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = target.toLocaleDateString("en-US", { day: "numeric" });

  // Semantic coloring for deadlines
  let colorClass = "text-gray-500 dark:text-gray-400";
  if (daysLeft < 0) colorClass = "text-red-600 dark:text-red-500 font-bold";
  else if (daysLeft <= 3)
    colorClass = "text-orange-600 dark:text-orange-400 font-bold";
  else if (daysLeft <= 7)
    colorClass = "text-blue-600 dark:text-blue-400 font-bold";

  return { month, day, colorClass };
};

export default function AdminTicketRow({
  ticket,
  colId,
  confirmDelete,
  advanceStatus,
}: AdminTicketRowProps) {
  const router = useRouter();
  const trackUrls = ticket.tracks?.map((t: any) => t.url).filter(Boolean) || [];
  const rawThumbnails = getYouTubeThumbnail(trackUrls);
  const fetchedThumbnails: string[] = rawThumbnails
    ? (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails]).filter(
        (url): url is string => !!url,
      )
    : [];

  const dateData = getDeadlineCompact(ticket.deadline || null);

  return (
    <div
      onClick={() => router.push(`/pages/request/${ticket.id}`)}
      className={`group relative w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222] rounded-xl p-2 shadow-sm hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all duration-200 border-l-[4px] ${
        colId === "accepted"
          ? "border-l-blue-500"
          : colId === "in progress"
            ? "border-l-yellow-500"
            : colId === "done"
              ? "border-l-green-500"
              : "border-l-gray-400 dark:border-l-gray-600"
      } cursor-pointer flex items-center gap-3`}
    >
      {/* Thumbnail Container */}
      <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/5">
        {fetchedThumbnails.length > 0 ? (
          <CarouselThumbnail
            images={fetchedThumbnails}
            links={trackUrls}
            showIndicators={false}
            slideDuration={5000}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-700">
            <FaMusic size={14} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        {/* Top Row: ID, Title, Hype */}
        <div className="flex items-center flex-nowrap gap-2 min-w-0">
          <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 shrink-0 tracking-widest">
            #{ticket.id}
          </span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-none pt-0.5 flex-1">
            {ticket.title || "Untitled Project"}
          </h3>

          {ticket.hype && (
            <div className="shrink-0 p-1 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-100 dark:border-red-500/20">
              <FaFire size={10} className="text-red-500 animate-pulse" />
            </div>
          )}
        </div>

        {/* Middle Row: Badges */}
        <div className="flex items-center flex-nowrap gap-1.5 overflow-hidden">
          <span
            className={`whitespace-nowrap shrink-0 text-[8px] font-black uppercase px-1.5 py-[2px] rounded-md border ${
              ticket.genre === "rnr"
                ? "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-500 dark:border-orange-500/20 dark:bg-orange-500/5"
                : "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-500 dark:border-purple-500/20 dark:bg-purple-500/5"
            }`}
          >
            {ticket.genre === "rnr" ? "RNR" : "FASH"}
          </span>
          <span className="whitespace-nowrap shrink-0 text-[8px] font-black uppercase px-1.5 py-[2px] rounded-md border text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:border-blue-500/20 dark:bg-blue-500/5">
            {ticket.service_name}
          </span>
        </div>

        {/* Bottom Row: Price & Tracks */}
        <div className="flex items-center gap-3 text-[9px] font-medium text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="text-gray-900 dark:text-gray-200 font-bold">
              {ticket.total_price?.toLocaleString()}
            </span>
            <span className="text-[7px] text-blue-600 dark:text-blue-500 font-black">
              FT
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaLayerGroup size={8} /> <span>{trackUrls.length}</span>
          </div>
          {ticket.target_bpm && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <FaTachometerAlt size={8} /> <span>{ticket.target_bpm}</span>
            </div>
          )}
        </div>
      </div>

      {/* 📅 Compact Calendar Box */}
      <div className="flex flex-col items-center justify-center px-1.5 py-1 border-l border-r border-gray-100 dark:border-[#222] min-w-[44px] bg-gray-50/50 dark:bg-white/5">
        {dateData ? (
          <>
            <span
              className={`text-[7px] font-black uppercase leading-none mb-0.5 ${dateData.colorClass} opacity-80`}
            >
              {dateData.month}
            </span>
            <span
              className={`text-sm font-black leading-none ${dateData.colorClass}`}
            >
              {dateData.day}
            </span>
          </>
        ) : (
          <span className="text-[7px] font-bold text-gray-300 dark:text-gray-600 uppercase">
            --
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-1 shrink-0">
        {colId !== "done" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              advanceStatus(ticket);
            }}
            className="w-6 h-6 rounded-md bg-gray-100 dark:bg-[#252525] hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white text-gray-600 dark:text-gray-400 transition-all flex items-center justify-center border border-gray-200 dark:border-[#333]"
          >
            <FaArrowRight size={8} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            confirmDelete(ticket.id);
          }}
          className="w-6 h-6 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-all flex items-center justify-center"
        >
          <FaTrash size={8} />
        </button>
      </div>
    </div>
  );
}
