"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHistory,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import AdminTicketCard from "./AdminTicketCard";
import { Ticket } from "@/app/types";

interface CategorizedViewProps {
  tickets: Ticket[];
  advanceStatus: (ticket: Ticket) => void;
  confirmDelete: (id: number) => void;
}

const CategoryCarousel = ({
  title,
  icon,
  tickets,
  color,
  advanceStatus,
  confirmDelete,
}: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // 🖱️ Track scroll to toggle fades based on overflow and position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    const remaining = scrollWidth - (scrollLeft + clientWidth);
    const overflow = scrollWidth > clientWidth + 4;
    setHasOverflow(overflow);
    setShowLeftFade(scrollLeft > 20);
    setShowRightFade(remaining > 20);
    if (!overflow) {
      setActiveIndex(0);
      return;
    }
    const maxScroll = Math.max(scrollWidth - clientWidth, 1);
    const progress = Math.min(Math.max(scrollLeft / maxScroll, 0), 1);
    const maxIndex = Math.max(tickets.length - 1, 0);
    setActiveIndex(Math.round(progress * maxIndex));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, clientWidth, scrollWidth } = el;
      const remaining = scrollWidth - (scrollLeft + clientWidth);
      const overflow = scrollWidth > clientWidth + 4;
      setHasOverflow(overflow);
      setShowLeftFade(scrollLeft > 20);
      setShowRightFade(remaining > 20);
      if (!overflow) {
        setActiveIndex(0);
        return;
      }
      const maxScroll = Math.max(scrollWidth - clientWidth, 1);
      const progress = Math.min(Math.max(scrollLeft / maxScroll, 0), 1);
      const maxIndex = Math.max(tickets.length - 1, 0);
      setActiveIndex(Math.round(progress * maxIndex));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [tickets.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (tickets.length === 0) return null;

  return (
    /* 📦 SECTION BACKGROUND: Added bg, border, and padding to create the 'Shelf' */
    <div className="mb-8 sm:mb-10 lg:mb-12 last:mb-0 group/carousel relative bg-white dark:bg-[#121212] border border-gray-200/70 dark:border-white/5 rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3.5rem] p-5 sm:p-6 lg:p-8 shadow-2xl transition-colors duration-500 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
      {/* Header logic remains static at the top */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 px-1 sm:px-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-600 dark:text-${color}-500 shadow-xl`}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-[12px] sm:text-[14px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gray-900 dark:text-white flex flex-wrap items-center gap-3 sm:gap-4">
              {title}
              <span className="text-gray-500 dark:text-white/20 font-bold text-[11px] tracking-normal">
                {tickets.length} ITEMS
              </span>
            </h2>
          </div>
        </div>

        {/* 🏹 Navigation Arrows */}
        <div className="hidden sm:flex gap-3 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 self-start sm:self-auto">
          <button
            onClick={() => scroll("left")}
            className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/70 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-all active:scale-90"
          >
            <FaChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/70 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-all active:scale-90"
          >
            <FaChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 🎡 Carousel Area with Corrected Fade Masks */}
      <div className="relative overflow-visible">
        {/* 🌑 LEFT FADE: Updated gradient to match the #121212 section background */}
        <div
          className={`hidden sm:block absolute top-0 left-0 bottom-0 w-16 sm:w-24 lg:w-32 bg-linear-to-r from-white/95 via-white/70 to-transparent dark:from-[#121212]/95 dark:via-[#121212]/70 z-40 pointer-events-none transition-opacity duration-500 ${hasOverflow && showLeftFade ? "opacity-100" : "opacity-0"}`}
        />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-5 sm:gap-6 lg:gap-8 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tickets.map((ticket: Ticket) => (
            <div
              key={ticket.id}
              className="min-w-[260px] w-[260px] sm:min-w-[280px] sm:w-[280px] md:min-w-[320px] md:w-[320px] lg:min-w-[340px] lg:w-[340px] snap-start h-full"
            >
              <AdminTicketCard
                ticket={ticket}
                colId={ticket.status}
                advanceStatus={advanceStatus}
                confirmDelete={confirmDelete}
                showStatusBadge={true} //
              />
            </div>
          ))}
          {/* 🏁 Spacer to allow the last card to scroll past the right fade */}
          <div className="min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] h-full shrink-0" />
        </div>

        {/* 🌑 RIGHT FADE: Updated gradient to match section background */}
        <div
          className={`hidden sm:block absolute top-0 right-0 bottom-0 w-24 sm:w-36 lg:w-48 bg-linear-to-l from-white/95 via-white/70 to-transparent dark:from-[#121212]/95 dark:via-[#121212]/70 z-40 pointer-events-none transition-opacity duration-500 ${hasOverflow && showRightFade ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* 📍 Mobile progress indicator */}
      {hasOverflow && (
        <div className="sm:hidden mt-5 px-1">
          <div className="flex items-center justify-center gap-1.5">
            {tickets.map((ticket: Ticket, index: number) => (
              <span
                key={ticket.id}
                className={`h-1.5 w-4 rounded-full transition-colors duration-300 ${
                  index === activeIndex
                    ? "bg-gray-900/60 dark:bg-white/70"
                    : "bg-gray-400/40 dark:bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminCategorizedView({
  tickets,
  advanceStatus,
  confirmDelete,
}: CategorizedViewProps) {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Categorization logic preserved
  const overdue = tickets.filter(
    (t) => t.deadline && new Date(t.deadline) < now && t.status !== "done",
  );
  const dueThisWeek = tickets.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline) >= now &&
      new Date(t.deadline) <= nextWeek &&
      t.status !== "done",
  );
  const backlog = tickets.filter((t) => !t.deadline && t.status !== "done");
  const completed = tickets.filter((t) => t.status === "done");

  return (
    <div className="space-y-6">
      <CategoryCarousel
        title="Overdue"
        icon={<FaHistory />}
        tickets={overdue}
        color="red"
        advanceStatus={advanceStatus}
        confirmDelete={confirmDelete}
      />
      <CategoryCarousel
        title="Due This Week"
        icon={<FaCalendarAlt />}
        tickets={dueThisWeek}
        color="blue"
        advanceStatus={advanceStatus}
        confirmDelete={confirmDelete}
      />
      <CategoryCarousel
        title="Backlog"
        icon={<FaClock />}
        tickets={backlog}
        color="gray"
        advanceStatus={advanceStatus}
        confirmDelete={confirmDelete}
      />
      <CategoryCarousel
        title="Completed"
        icon={<FaCheckCircle />}
        tickets={completed}
        color="green"
        advanceStatus={advanceStatus}
        confirmDelete={confirmDelete}
      />
    </div>
  );
}
