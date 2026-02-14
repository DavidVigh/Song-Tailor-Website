"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getYouTubeThumbnail, timeAgo } from "@/app/lib/utils";
import { Ticket } from "@/app/types";
import {
  FaTrash,
  FaArrowRight,
  FaTachometerAlt,
  FaLayerGroup,
  FaMusic,
  FaFire,
  FaCheckCircle,
  FaUser,
  FaPlusCircle,
  FaPen,
} from "react-icons/fa";
import { CarouselThumbnail, BackgroundCarousel } from "./TicketCarousels";

interface AdminTicketCardProps {
  ticket: Ticket;
  colId: string;
  confirmDelete: (id: number) => void;
  advanceStatus: (ticket: Ticket) => void;
  showStatusBadge?: boolean;
}

const PlaceholderThumb = () => (
  <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex flex-col items-center justify-center gap-2 border border-gray-200/60 dark:border-white/5 shadow-inner">
    <div className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-white/5 flex items-center justify-center text-blue-500/40 dark:text-blue-500/30">
      <FaMusic size={20} />
    </div>
    <span className="text-[7px] font-black text-gray-500 dark:text-white/10 uppercase tracking-[0.2em]">
      No Media Attached
    </span>
  </div>
);

export default function AdminTicketCard({
  ticket,
  colId,
  confirmDelete,
  advanceStatus,
  showStatusBadge = false,
}: AdminTicketCardProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const trackUrls = ticket.tracks?.map((t: any) => t.url).filter(Boolean) || [];
  const rawThumbnails = getYouTubeThumbnail(trackUrls);
  const thumbnails: string[] = rawThumbnails
    ? (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails]).filter(
        (url): url is string => !!url,
      )
    : [];

  const getCalendarDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return { month: "N/A", day: "--" };
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const cal = getCalendarDate(ticket.deadline);

  const statusConfig: Record<string, { label: string; color: string }> = {
    new: {
      label: "NEW",
      color: "text-gray-400 border-gray-500/30 bg-gray-500/5",
    },
    accepted: {
      label: "QUEUE",
      color: "text-blue-500 border-blue-500/30 bg-blue-500/5",
    },
    "in progress": {
      label: "PROGRESS",
      color: "text-yellow-500 border-yellow-400/30 bg-yellow-500/5",
    },
    done: {
      label: "DONE",
      color: "text-green-500 border-green-500/30 bg-green-500/5",
    },
  };
  const status = statusConfig[ticket.status] || statusConfig.new;

  return (
    <div
      onClick={() => router.push(`/pages/request/${ticket.id}`)}
      className="group relative overflow-hidden bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 h-full min-h-[420px] flex flex-col cursor-pointer"
    >
      {thumbnails.length > 0 && (
        <BackgroundCarousel
          images={thumbnails}
          blur="blur-xl"
          slideDuration={6000}
        />
      )}
      <div className="absolute inset-0 z-1 bg-linear-to-b from-white/60 via-white/90 to-white dark:from-black/10 dark:via-black/60 dark:to-[#111111] pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full flex-1">
        {/* MEDIA THUMBNAIL */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (trackUrls.length > 0)
              window.open(trackUrls[currentIndex], "_blank");
          }}
          className="w-full h-40 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-blue-500/30 transition-all shadow-xl mb-3 bg-gray-100 dark:bg-black/20 cursor-alias z-20"
        >
          {thumbnails.length > 0 ? (
            <CarouselThumbnail
              images={thumbnails}
              links={trackUrls}
              showIndicators={true}
              slideDuration={4000}
              onIndexChange={setCurrentIndex}
            />
          ) : (
            <PlaceholderThumb />
          )}
        </div>

        <div className="space-y-4 flex-1 flex flex-col">
          {/* BADGES */}
          <div className="flex items-center flex-nowrap gap-1 overflow-hidden">
            <span
              className={`whitespace-nowrap shrink-0 text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full border tracking-widest ${ticket.genre === "rnr" ? "border-orange-500/30 text-orange-500 bg-orange-500/5" : "border-purple-500/30 text-purple-500 bg-purple-500/5"}`}
            >
              {ticket.genre === "rnr" ? "ROCK & ROLL" : "FASHION"}
            </span>
            <span className="whitespace-nowrap shrink-0 text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full border tracking-widest border-blue-500/30 text-blue-600 dark:text-blue-500 bg-blue-500/5">
              {ticket.service_name}
            </span>
            {ticket.hype && (
              <span className="whitespace-nowrap shrink-0 text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full border tracking-widest flex items-center gap-1 border-red-500/30 text-red-600 dark:text-red-500 bg-red-500/5">
                <FaFire size={8} className="shrink-0" /> HYPE
              </span>
            )}
            {showStatusBadge && (
              <span
                className={`ml-auto whitespace-nowrap shrink-0 text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full border tracking-widest ${status.color}`}
              >
                {status.label}
              </span>
            )}
          </div>

          {/* 🎯 IDENTITY & CONTENT SECTION */}
          <div className="space-y-3 px-1">
            {/* 🔝 TOP ROW: Submitter Info + Moved Date Indicator */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0 border border-gray-300 dark:border-white/5 shadow-sm">
                  {ticket.profiles?.avatar_url ? (
                    <img
                      src={ticket.profiles.avatar_url}
                      className="w-full h-full object-cover"
                      alt="user"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaUser size={12} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0 leading-none flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white truncate tracking-tight uppercase">
                      {ticket.profiles?.full_name || "Guest User"}
                    </span>
                    <span className="text-[8px] font-black text-blue-500/40 uppercase tracking-widest shrink-0">
                      #{ticket.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[7px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">
                    <span className="flex items-center gap-0.5 opacity-80">
                      <FaPlusCircle
                        size={6}
                        className="text-gray-400 dark:text-gray-600"
                      />{" "}
                      {timeAgo(ticket.created_at)}
                    </span>
                    <span className="flex items-center gap-0.5 text-blue-500 dark:text-blue-400/60">
                      <FaPen size={6} />{" "}
                      {timeAgo(ticket.updated_at || ticket.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 📅 Date indicator moved up to the Header row */}
              <div
                className={`flex flex-col items-center justify-center min-w-[42px] h-[42px] rounded-xl border px-1 transition-all ${ticket.deadline ? "bg-red-500/10 border-red-500/20 shadow-lg" : "bg-gray-100/70 border-gray-200/60 dark:bg-white/5 dark:border-white/10 opacity-60 dark:opacity-30"}`}
              >
                <span
                  className={`text-[6px] font-black tracking-tight mb-0.5 ${ticket.deadline ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {cal.month}
                </span>
                <span
                  className={`text-[11px] font-black leading-none ${ticket.deadline ? "text-red-600 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                >
                  {cal.day}
                </span>
              </div>
            </div>

            {/* 🏷️ TITLE (Now full width) */}
            <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight truncate leading-tight pt-1">
              {ticket.title || "Untitled Project"}
            </h3>

            {/* 🤖 AI SUMMARY (Now full width) */}
            <div className="py-2 px-3 bg-gray-50/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 mt-1 w-full">
              <div className="flex items-center gap-1.5 mb-1 opacity-40">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[6px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-white">
                  AI Summary
                </span>
              </div>
              <p className="text-[10px] font-medium leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                {ticket.description
                  ? "Summarized description would appear here..."
                  : "No description given."}
              </p>
            </div>
          </div>

          {/* STATS */}
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-white/5">
            <div className="flex gap-3">
              <p className="text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <FaLayerGroup size={10} className="text-blue-500/30" />
                Track {currentIndex + 1} of {trackUrls.length}
              </p>
              {ticket.target_bpm && (
                <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FaTachometerAlt size={10} className="opacity-50" />
                  {ticket.target_bpm} BPM
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(ticket.id);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
            >
              <FaTrash size={10} />
            </button>
          </div>

          {/* INVESTMENT */}
          <div className="bg-white border border-gray-200/70 dark:bg-white/5 dark:border-white/5 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-[7px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-widest">
              Total Investment
            </span>
            <div className="text-xs font-black text-gray-900 dark:text-white">
              {ticket.total_price?.toLocaleString()}{" "}
              <span className="text-[8px] text-blue-500 font-black uppercase ml-0.5">
                FT
              </span>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="mt-auto pt-2">
            {colId === "done" ? (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 font-black uppercase text-[8px] tracking-widest cursor-default">
                <FaCheckCircle size={10} /> Order Finished
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  advanceStatus(ticket);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase text-[8px] tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95 shadow-md group"
              >
                {colId === "new"
                  ? "Accept Order"
                  : colId === "accepted"
                    ? "Start Production"
                    : "Finish Request"}
                <FaArrowRight
                  size={10}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
