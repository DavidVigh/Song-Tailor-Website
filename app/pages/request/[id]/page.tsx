"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCheck,
  FaPlay,
  FaCheckDouble,
  FaTrash,
  FaCalendarAlt,
  FaTachometerAlt,
  FaLongArrowAltRight,
  FaYoutube,
  FaUser,
  FaAlignLeft,
  FaFire,
  FaMusic,
  FaPen,
  FaPlusCircle,
  FaUndo,
} from "react-icons/fa";
import { getYouTubeThumbnail, timeAgo } from "@/app/lib/utils";
import { useToast } from "@/app/context/ToastContext";
import { Ticket } from "@/app/types";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import LoadingLayout from "@/app/layouts/LoadingLayout";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const MontageHeader = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="absolute top-0 left-0 w-full h-[250px] sm:h-[450px] z-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 flex w-[115%] -left-[7.5%] h-full">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative h-full flex-1 overflow-hidden"
            style={{
              clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0% 100%)",
              marginLeft: i === 0 ? "0" : "-5%",
            }}
          >
            <img
              src={img}
              alt="bg"
              className="w-full h-full object-cover filter brightness-110 contrast-105 opacity-90 dark:opacity-60 dark:grayscale-[0.1]"
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-[#0a0a0a]" />
    </div>
  );
};

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const requestId = Array.isArray(id) ? id[0] : id;

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ target_bpm: "", deadline: "" });
  const [times, setTimes] = useState({ created: "", updated: "" });
  const [hoveredReset, setHoveredReset] = useState(false);

  const links = ticket?.tracks?.map((t) => t.url).filter(Boolean) || [];
  const rawThumbnails = getYouTubeThumbnail(links);
  let thumbnails = (
    Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails]
  )
    .filter((url): url is string => !!url)
    .map((url) => url.replace("hqdefault", "maxresdefault"));

  const totalSlides = thumbnails.length;
  const extendedThumbnails =
    totalSlides > 1
      ? [thumbnails[totalSlides - 1], ...thumbnails, thumbnails[0]]
      : thumbnails;
  const [currentIndex, setCurrentIndex] = useState(totalSlides > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>({});
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const isClassMusic = ticket?.service_name?.toLowerCase() === "class music";

  let realActiveIndex =
    totalSlides > 1
      ? currentIndex === 0
        ? totalSlides - 1
        : currentIndex === extendedThumbnails.length - 1
          ? 0
          : currentIndex - 1
      : 0;
  const currentLink = links[realActiveIndex] || links[0] || "#";
  const currentTitle = videoTitles[currentLink] || "Watch on YouTube";

  useEffect(() => {
    if (!ticket) return;
    const updateTimes = () => {
      setTimes({
        created: timeAgo(ticket.created_at),
        updated: ticket.updated_at
          ? timeAgo(ticket.updated_at)
          : timeAgo(ticket.created_at),
      });
    };
    updateTimes();
    const interval = setInterval(updateTimes, 15000);
    return () => clearInterval(interval);
  }, [ticket]);

  useEffect(() => {
    if (!requestId) return;
    const channel = supabase
      .channel(`song-request-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "song_requests",
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          setTicket((prev) => (prev ? { ...prev, ...payload.new } : prev));
          setFormData({
            target_bpm: payload.new.target_bpm || "",
            deadline: payload.new.deadline || "",
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  useEffect(() => {
    if (id) fetchRequestData();
  }, [id]);
  useEffect(() => {
    setCurrentIndex(thumbnails.length > 1 ? 1 : 0);
  }, [thumbnails.length]);

  useEffect(() => {
    if (!ticket) return;
    const fetchTitles = async () => {
      const titles: Record<string, string> = {};
      await Promise.all(
        links.map(async (url: string) => {
          try {
            const res = await fetch(`https://noembed.com/embed?url=${url}`);
            const data = await res.json();
            if (data.title) titles[url] = data.title;
          } catch (err) {}
        }),
      );
      setVideoTitles((prev) => ({ ...prev, ...titles }));
    };
    if (links.length > 0) fetchTitles();
  }, [ticket]);

  useEffect(() => {
    if (!isTransitioning || totalSlides <= 1) return;
    const timeOut = setTimeout(() => {
      setIsTransitioning(false);
      if (currentIndex === 0) setCurrentIndex(extendedThumbnails.length - 2);
      else if (currentIndex === extendedThumbnails.length - 1)
        setCurrentIndex(1);
    }, 700);
    return () => clearTimeout(timeOut);
  }, [currentIndex, isTransitioning, extendedThumbnails.length, totalSlides]);

  async function fetchRequestData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.role === "admin");
      const { data, error } = await supabase
        .from("song_requests")
        .select(`*, profiles (full_name, avatar_url, phone, id)`)
        .eq("id", requestId)
        .maybeSingle();
      if (
        error ||
        !data ||
        (profile?.role !== "admin" && data.user_id !== user.id)
      ) {
        setTicket(null);
        return;
      }
      setTicket(data as Ticket);
      setFormData({
        target_bpm: data.target_bpm || "",
        deadline: data.deadline || "",
      });
    } catch (error) {
    } finally {
      setIsPageLoading(false);
    }
  }

  async function updateStatus(newStatus: string) {
    if (!isAdmin) return;
    const { error } = await supabase
      .from("song_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    if (error) showToast("Failed update", "error");
    else showToast(`Status: ${newStatus}`, "success");
  }

  async function confirmDelete() {
    try {
      setDeleting(true);
      const { error } = await supabase
        .from("song_requests")
        .delete()
        .eq("id", requestId);
      if (error) throw error;
      showToast("Deleted", "info");
      router.push(isAdmin ? "/pages/admin" : "/pages/user/my-tickets");
    } catch (err) {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  }

  const renderBpm = () => {
    const baseBpm = ticket?.tracks?.[0]?.base_bpm;
    const targetBpm = formData.target_bpm;

    if (isClassMusic) {
      return (
        <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          {baseBpm || "?"}
        </span>
      );
    }

    if (baseBpm && targetBpm) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-gray-400">{baseBpm}</span>
          <FaLongArrowAltRight className="text-blue-500" />
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {targetBpm}
          </span>
        </div>
      );
    }

    return (
      <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
        {targetBpm || baseBpm || "?"}
      </span>
    );
  };

  const nextSlide = () => {
    if (totalSlides > 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }
  };
  const prevSlide = () => {
    if (totalSlides > 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
  };
  const goToSlide = (index: number) => {
    if (isTransitioning || totalSlides <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(index + 1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
  };

  const getStatusBadge = (status: string) => {
    const base =
      "px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md shadow-lg border";
    switch (status) {
      case "accepted":
        return (
          <span
            className={`${base} bg-blue-600 text-white border-blue-600 dark:text-blue-300 dark:bg-blue-900/60 dark:border-blue-600`}
          >
            <FaCheck size={10} /> Queue
          </span>
        );
      case "in progress":
        return (
          <span
            className={`${base} bg-yellow-500 text-white border-yellow-400 dark:text-yellow-300 dark:bg-yellow-900/60 dark:border-yellow-500`}
          >
            <FaPlay size={8} /> In Progress
          </span>
        );
      case "done":
        return (
          <span
            className={`${base} bg-green-600 text-white border-green-500 dark:text-lime-300 dark:bg-lime-900/60 dark:border-lime-300`}
          >
            <FaCheckDouble size={10} /> Finished
          </span>
        );
      default:
        return (
          <span
            className={`${base} bg-gray-600 text-white border-gray-600 dark:text-stone-300 dark:bg-stone-900/60 dark:border-stone-300`}
          >
            <FaClock size={10} /> Pending
          </span>
        );
    }
  };

  if (isPageLoading)
    return (
      <LoadingLayout
        message="Syncing Request..."
        icon={<FaMusic className="text-blue-500 text-2xl animate-bounce" />}
      />
    );
  if (!ticket)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Request not found
        </h1>
        <button
          onClick={() => router.back()}
          className="mt-6 px-5 py-2.5 rounded-full border border-gray-200 dark:border-white/10 text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          Go Back
        </button>
      </div>
    );

  return (
    <div className="min-h-screen w-full transition-colors duration-500 bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden relative selection:bg-blue-500/30">
      {thumbnails.length > 0 && <MontageHeader images={thumbnails} />}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-16">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white backdrop-blur-md"
          >
            <FaChevronLeft size={16} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col justify-end min-h-[350px] sm:min-h-[500px] touch-pan-y group"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className={`absolute inset-0 flex h-full ${isTransitioning ? "transition-transform duration-700" : ""}`}
              style={{
                width: `${extendedThumbnails.length * 100}%`,
                transform:
                  totalSlides > 1
                    ? `translateX(-${(currentIndex * 100) / extendedThumbnails.length}%)`
                    : `translateX(0%)`,
              }}
            >
              {extendedThumbnails.map((img, idx) => (
                <div
                  key={idx}
                  className="h-full bg-cover bg-center flex-1 filter brightness-110 contrast-105 dark:opacity-80 dark:grayscale-[0.1]"
                  style={{ backgroundImage: `url('${img}')` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 sm:p-12">
            <div className="absolute top-5 right-5 sm:top-8 sm:right-8">
              {getStatusBadge(ticket.status)}
            </div>
            <div className="flex flex-col gap-2 sm:gap-4">
              <div className="flex gap-1.5 sm:gap-2">
                <span className="px-3 py-1 rounded text-[9px] sm:text-[11px] font-black uppercase tracking-widest border shadow-sm bg-purple-600 text-white border-purple-500 dark:text-purple-300 dark:bg-purple-900/60 dark:border-purple-500">
                  {ticket.service_name || "N/A"}
                </span>
                {ticket.hype && (
                  <span className="px-3 py-1 rounded text-[9px] sm:text-[11px] font-black uppercase flex items-center gap-1 shadow-sm border bg-red-600 text-white border-red-500 dark:text-red-500 dark:bg-red-900/60 dark:border-red-500">
                    <FaFire size={9} /> Hype
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-7xl font-black text-white leading-tight tracking-tighter max-w-[90%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {ticket.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-white/90 text-[10px] sm:text-xs font-bold drop-shadow-md bg-black/30 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-blue-400" />{" "}
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1.5">
                  <FaPlusCircle size={10} className="opacity-70" />{" "}
                  {times.created}
                </span>
                {ticket.updated_at && (
                  <>
                    <span className="opacity-30">|</span>
                    <span className="flex items-center gap-1.5 text-blue-300">
                      <FaPen size={10} className="opacity-70" /> {times.updated}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mt-8 sm:mt-10">
              <a
                href={currentLink}
                target="_blank"
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-3.5 rounded-2xl hover:bg-red-700 transition-all font-black shadow-xl active:scale-95 text-xs sm:text-base"
              >
                <FaYoutube size={18} />{" "}
                <span className="truncate max-w-[200px] sm:max-w-[300px] uppercase tracking-widest">
                  {currentTitle}
                </span>
              </a>
              {totalSlides > 1 && (
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    onClick={prevSlide}
                    className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shrink-0"
                  >
                    <FaChevronLeft size={10} />
                  </button>
                  <div className="flex items-center justify-center w-[180px] sm:w-[240px] shrink-0 h-4 overflow-hidden">
                    <div className="flex items-center gap-2.5">
                      {thumbnails.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => goToSlide(idx)}
                          className={`transition-all duration-500 rounded-full shrink-0 ${idx === realActiveIndex ? "w-6 sm:w-10 h-1.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={nextSlide}
                    className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shrink-0"
                  >
                    <FaChevronRight size={10} />
                  </button>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-[1.5fr_1.8fr_1.5fr_1.2fr] sm:grid-cols-[1fr_1fr_1fr_auto] gap-1.5 sm:gap-4 mt-8 pt-6 border-t border-white/20 items-stretch">
                <button
                  onClick={() => updateStatus("accepted")}
                  className={`py-3 sm:py-6 px-1 rounded-2xl font-black text-[7px] xs:text-[8px] sm:text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all border ${ticket.status === "accepted" ? "bg-blue-600 text-white border-blue-400 shadow-lg" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"}`}
                >
                  <FaCheck
                    size={8}
                    className={
                      ticket.status === "accepted"
                        ? "text-white"
                        : "text-blue-500"
                    }
                  />
                  <span className="whitespace-nowrap">Queue</span>
                </button>
                <button
                  onClick={() => updateStatus("in progress")}
                  className={`py-3 sm:py-6 px-1 rounded-2xl font-black text-[7px] xs:text-[8px] sm:text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all border group ${ticket.status === "in progress" ? "bg-yellow-500 text-white border-yellow-400 shadow-lg" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"}`}
                >
                  <FaPlay
                    size={8}
                    className={`${ticket.status === "in progress" ? "text-white" : "text-yellow-500 group-hover:scale-110 transition-transform"}`}
                  />
                  <span className="whitespace-nowrap">In Progress</span>
                </button>
                <button
                  onClick={() => updateStatus("done")}
                  className={`py-3 sm:py-6 px-1 rounded-2xl font-black text-[7px] xs:text-[8px] sm:text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all border ${ticket.status === "done" ? "bg-green-600 text-white border-green-400 shadow-lg" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"}`}
                >
                  <FaCheckDouble
                    size={8}
                    className={
                      ticket.status === "done" ? "text-white" : "text-green-500"
                    }
                  />
                  <span className="whitespace-nowrap">Done</span>
                </button>
                <div className="relative flex items-center h-full min-w-0">
                  <button
                    onMouseEnter={() => setHoveredReset(true)}
                    onMouseLeave={() => setHoveredReset(false)}
                    onClick={() => updateStatus("new")}
                    className="h-full w-full px-2 sm:px-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange-500/20 hover:border-orange-500/50 transition-all text-gray-500 hover:text-orange-500 flex items-center justify-center"
                  >
                    <FaUndo size={11} className="sm:size-[14px] shrink-0" />
                  </button>
                  <AnimatePresence>
                    {hoveredReset && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -8 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-xl pointer-events-none z-50"
                      >
                        reset
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Technicals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className={`lg:col-span-2 bg-white dark:bg-[#151515] border rounded-[1.8rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl transition-all ${isClassMusic ? "opacity-30 grayscale pointer-events-none" : "border-gray-200 dark:border-[#252525]"}`}
          >
            <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <FaAlignLeft className="text-blue-500" /> Instructions
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
              {isClassMusic
                ? "Instruction data is locked for Class Music services."
                : ticket.description || "No specific instructions provided."}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#252525] rounded-[1.8rem] sm:rounded-[2rem] p-6 shadow-xl">
              <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <FaTachometerAlt className="text-blue-500" /> Technicals
              </h3>
              <div className="space-y-4">
                <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  {renderBpm()}
                  <span className="text-[10px] font-normal text-gray-500 uppercase tracking-widest ml-auto">
                    bpm
                  </span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <FaCalendarAlt className="text-blue-500" />{" "}
                  {formData.deadline
                    ? new Date(formData.deadline).toLocaleDateString()
                    : "No Deadline"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="This request will be permanently removed. This cannot be undone."
        confirmText="Delete Now"
        loading={deleting}
      />
    </div>
  );
}
