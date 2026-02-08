"use client";
import { useEffect, useState } from "react";
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
  FaMusic,
  FaPlusCircle,
  FaPen,
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import {
  CarouselThumbnail,
  BackgroundCarousel,
} from "@/app/components/TicketCarousels";
import { Ticket } from "@/app/types";

function timeAgo(dateString: string) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const links = Array.isArray(ticket.youtube_link) ? ticket.youtube_link : [ticket.youtube_link];
  const rawThumbnails = getYouTubeThumbnail(links);
  let thumbnails = (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails])
    .filter((url): url is string => url !== null && url !== undefined)
    .map((url) => url.replace("hqdefault", "maxresdefault"));

  const mainCover = thumbnails[0] || "";
  const hasMultipleImages = thumbnails.length > 1;
  const isChoreo = (ticket.music_category || "").toLowerCase() === "choreo";

  const [times, setTimes] = useState({ created: "", updated: "" });

  useEffect(() => {
    const updateTimes = () => {
      setTimes({
        created: timeAgo(ticket.created_at),
        updated: ticket.updated_at ? timeAgo(ticket.updated_at) : timeAgo(ticket.created_at),
      });
    };
    updateTimes();
    const interval = setInterval(updateTimes, 10000);
    return () => clearInterval(interval);
  }, [ticket.created_at, ticket.updated_at]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "accepted":
        return { label: "Queue", icon: <FaLayerGroup size={10} />, badgeClass: "bg-blue-600 text-white border-blue-600 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-500/50" };
      case "in progress":
        return { label: "In Progress", icon: <FaPlay size={10} />, badgeClass: "bg-yellow-500 text-white border-yellow-500 dark:bg-yellow-900/60 dark:text-yellow-300 dark:border-yellow-500/50" };
      case "done":
        return { label: "Completed", icon: <FaCheckCircle size={10} />, badgeClass: "bg-green-600 text-white border-green-600 dark:bg-green-900/60 dark:text-green-300 dark:border-green-500/50" };
      default:
        return { label: "New", icon: <FaRegCircle size={10} />, badgeClass: "bg-gray-600 text-white border-gray-600 dark:bg-[#333] dark:text-gray-400 dark:border-white/10" };
    }
  };

  const statusInfo = getStatusInfo(ticket.status);

  return (
    <div className="group relative overflow-hidden flex flex-col h-full rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 bg-white dark:border-[#333] dark:hover:border-gray-500 dark:bg-[#1e1e1e]">
      
      {/* Shared Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {thumbnails.length > 0 && (
          hasMultipleImages ? (
            <BackgroundCarousel images={thumbnails} blur="blur-none" />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-100 filter brightness-110 contrast-105 dark:opacity-50 dark:filter dark:grayscale-[0.2] dark:brightness-100 dark:contrast-100"
              style={{ backgroundImage: `url('${mainCover}')` }}
            />
          )
        )}
        {/* Added a consistent dark overlay to the entire card background for better contrast */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/50 dark:group-hover/image:bg-black/40 transition-colors duration-300" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* 1. Header Badges */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {ticket.hype && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 shadow-sm border bg-red-600 text-white border-red-600 dark:bg-red-900/60 dark:text-red-300 dark:border-red-500/50">
                <FaFire size={10} /> Hype
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border shadow-sm ${isChoreo ? "bg-purple-600 text-white border-purple-600 dark:bg-purple-900/60 dark:text-purple-300 dark:border-purple-500/50" : "bg-blue-600 text-white border-blue-600 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-500/50"}`}>
              {ticket.music_category || "CHOREO"}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-1.5 ${statusInfo.badgeClass}`}>
            {statusInfo.icon} {statusInfo.label}
          </span>
        </div>

        {/* 2. Body Content */}
        <div className="p-4 flex items-center min-h-[145px]">
          <div className="flex gap-4 items-center w-full">
            <div className="shrink-0 w-20 h-14 rounded-lg overflow-hidden shadow-lg border relative group/thumb bg-white border-white dark:bg-black dark:border-white/20">
              {thumbnails.length > 0 ? (
                hasMultipleImages ? (
                  <CarouselThumbnail images={thumbnails} links={links} showIndicators={false} />
                ) : (
                  <a href={links[0]} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative" onPointerDown={(e) => e.stopPropagation()}>
                    <img src={mainCover} className="w-full h-full object-cover" alt="thumb" />
                    <div className="absolute inset-0 flex items-center justify-center transition-colors duration-300 bg-black/10 group-hover/thumb:bg-black/20">
                      <FaYoutube className="text-white drop-shadow-md text-[20px] transition-all duration-300 transform group-hover/thumb:text-red-600 group-hover/thumb:scale-125 group-hover/thumb:opacity-100" />
                    </div>
                  </a>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-500">
                  <FaMusic size={20} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <Link href={`/pages/request/${ticket.id}`} className="inline-block max-w-full group/title">
                <h3 className="text-base font-bold truncate leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] group-hover/title:text-blue-300 dark:group-hover/title:text-blue-400">
                  {ticket.title}
                </h3>
              </Link>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border shadow-lg backdrop-blur-md bg-black/50 text-white border-white/20 dark:bg-black/60 dark:text-gray-200 dark:border-white/10">
                  <span className="font-bold opacity-80">BPM</span> {ticket.base_bpm || "?"} <FaLongArrowAltRight className="opacity-60" /> {ticket.target_bpm || "?"}
                </div>
                {ticket.deadline && (
                  <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border shadow-lg backdrop-blur-md bg-yellow-500/90 text-white border-yellow-400/50 dark:bg-yellow-600/40 dark:text-yellow-100 dark:border-yellow-500/30">
                    <FaClock size={10} /> {new Date(ticket.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer - Dimmed and Blurred */}
        <div className="mt-auto relative p-3 flex justify-between items-center border-t border-white/10 backdrop-blur-[4px] bg-black/30 dark:bg-black/40">
          <div className="text-[9px] uppercase tracking-wide font-bold flex items-center gap-1.5 text-white drop-shadow-md">
            <span className="flex items-center gap-0.5">
              <FaPlusCircle className="text-[7px] opacity-80" /> {times.created}
            </span>
            <span className="opacity-50">|</span>
            <span className="flex items-center gap-0.5 text-blue-200">
              <FaPen className="text-[7px] opacity-80" /> {times.updated}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-white drop-shadow-md">
            {new Date(ticket.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}