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
  FaCheckCircle,
} from "react-icons/fa";
import { CarouselThumbnail, BackgroundCarousel } from "./TicketCarousels";

interface AdminTicketCardProps {
  ticket: Ticket;
  colId: string;
  confirmDelete: (id: number) => void;
  advanceStatus: (ticket: Ticket) => void;
}

const PlaceholderThumb = () => (
  <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-[#1a1a1a] dark:to-[#0a0a0a] flex flex-col items-center justify-center gap-2 border border-white/5 shadow-inner">
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500/30">
      <FaMusic size={24} />
    </div>
    <span className="text-[8px] font-black text-gray-400 dark:text-white/10 uppercase tracking-[0.2em]">
      No Media Attached
    </span>
  </div>
);

export default function AdminTicketCard({
  ticket,
  colId,
  confirmDelete,
  advanceStatus,
}: AdminTicketCardProps) {
  const router = useRouter();

  const trackUrls = ticket.tracks?.map((t: any) => t.url).filter(Boolean) || [];
  const rawThumbnails = getYouTubeThumbnail(trackUrls);
  const fetchedThumbnails: string[] = rawThumbnails
    ? (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails]).filter(
        (url): url is string => url !== null && url !== undefined,
      )
    : [];

  const thumbnails: string[] =
    fetchedThumbnails.length > 0
      ? fetchedThumbnails
      : ["/images/placeholder-pattern.jpg"];

  // 🕒 Calendar Date Helper
  const getCalendarDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return { month: "N/A", day: "--" };
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const cal = getCalendarDate(ticket.deadline);

  return (
    <div
      onClick={() => router.push(`/pages/request/${ticket.id}`)}
      className="group relative overflow-hidden bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-[2.2rem] p-5 shadow-sm hover:shadow-2xl transition-all duration-500 h-full min-h-[520px] flex flex-col cursor-pointer"
    >
      <BackgroundCarousel
        images={thumbnails}
        blur="blur-xl"
        slideDuration={6000}
      />
      <div className="absolute inset-0 z-1 bg-linear-to-b from-white/10 via-white/80 to-white dark:from-black/10 dark:via-black/60 dark:to-[#111111] pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full flex-1">
        {/* 🖼️ MEDIA CAROUSEL */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (trackUrls.length > 0) window.open(trackUrls[0], "_blank");
          }}
          className="w-full h-44 rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-blue-500/30 transition-all shadow-2xl mb-5 bg-gray-50 dark:bg-black/20 cursor-alias z-20"
        >
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
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest ${ticket.genre === "rnr" ? "border-orange-500/30 text-orange-500 bg-orange-500/5" : "border-purple-500/30 text-purple-500 bg-purple-500/5"}`}
              >
                {ticket.genre === "rnr" ? "ROCK & ROLL" : "FASHION"}
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
          </div>

          {/* Title & Wider Calendar View */}
          <div className="flex justify-between items-center gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <span className="text-[7px] font-black text-blue-500/40 uppercase tracking-widest">
                ID: #{ticket.id}
              </span>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate leading-tight">
                {ticket.title || "Untitled Project"}
              </h3>
            </div>

            {/* 🗓️ Styled Calendar Box - Now Wider */}
            <div
              className={`flex flex-col items-center justify-center min-w-[54px] h-[54px] rounded-2xl border px-2 transition-all ${ticket.deadline ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/10 opacity-40"}`}
            >
              <span
                className={`text-[8px] font-black tracking-tight mb-0.5 ${ticket.deadline ? "text-red-500" : "text-gray-400"}`}
              >
                {cal.month}
              </span>
              <span
                className={`text-xl font-black leading-none ${ticket.deadline ? "text-white" : "text-gray-400"}`}
              >
                {cal.day}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex gap-4">
              <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <FaLayerGroup size={10} className="text-blue-500/30" />
                {trackUrls.length} {trackUrls.length === 1 ? "Track" : "Tracks"}
              </p>
              {ticket.target_bpm && (
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
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
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90"
            >
              <FaTrash size={12} />
            </button>
          </div>

          {/* Price Box */}
          <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
              Total Investment
            </span>
            <div className="text-sm font-black text-gray-900 dark:text-white">
              {ticket.total_price?.toLocaleString()}{" "}
              <span className="text-[9px] text-blue-500 font-black uppercase">
                FT
              </span>
            </div>
          </div>

          {/* ⚡ ACTION AREA */}
          <div className="mt-auto pt-2">
            {colId === "done" ? (
              <div className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl bg-green-500/10 border border-green-500/20 text-green-500 font-black uppercase text-[9px] tracking-widest cursor-default">
                <FaCheckCircle size={12} />
                Order Finished
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  advanceStatus(ticket);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95 shadow-xl group"
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
