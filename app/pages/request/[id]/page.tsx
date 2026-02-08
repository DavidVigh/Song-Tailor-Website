"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, Variants } from "framer-motion";
import { 
  FaChevronLeft, FaChevronRight, FaClock, FaCheck, FaPlay, 
  FaCheckDouble, FaTrash, FaSave, FaCalendarAlt, FaTachometerAlt, 
  FaLongArrowAltRight, FaYoutube, FaUser, FaAlignLeft, FaFire, FaMusic, FaPen, FaPlusCircle
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { useToast } from "@/app/context/ToastContext";
import { Ticket } from "@/app/types"; 
import ConfirmationModal from "@/app/components/ConfirmationModal";
import Link from "next/link";

// 🕒 TIME AGO HELPER
function timeAgo(dateString: string) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds <= 0) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

// 🎨 COMPONENT: Montage Header (Diagonal Cut & High Contrast)
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
              clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0% 100%)',
              marginLeft: i === 0 ? '0' : '-5%' 
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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ target_bpm: "", deadline: "" });
  const [times, setTimes] = useState({ created: "", updated: "" });

  const links = ticket ? (ticket.tracks?.map((t) => t.url).filter(Boolean) || []) : [];
  const rawThumbnails = getYouTubeThumbnail(links);
  let thumbnails = (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails])
    .filter((url): url is string => url !== null && url !== undefined)
    .map(url => url.replace("hqdefault", "maxresdefault"));
  
  const totalSlides = thumbnails.length;
  const isChoreo = (ticket?.service_name || "").toLowerCase().includes("choreo");
  const extendedThumbnails = totalSlides > 1 ? [thumbnails[totalSlides - 1], ...thumbnails, thumbnails[0]] : thumbnails;

  const [currentIndex, setCurrentIndex] = useState(totalSlides > 1 ? 1 : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>({});
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  let realActiveIndex = totalSlides > 1 ? (currentIndex === 0 ? totalSlides - 1 : currentIndex === extendedThumbnails.length - 1 ? 0 : currentIndex - 1) : 0;
  const currentLink = links[realActiveIndex] || links[0] || "#";
  const currentTitle = videoTitles[currentLink] || "Watch on YouTube";

  useEffect(() => {
    if (!ticket) return;
    const updateTimes = () => {
      setTimes({
        created: timeAgo(ticket.created_at),
        updated: ticket.updated_at ? timeAgo(ticket.updated_at) : timeAgo(ticket.created_at),
      });
    };
    updateTimes();
    const interval = setInterval(updateTimes, 15000);
    return () => clearInterval(interval);
  }, [ticket]);

  useEffect(() => { if (id) fetchRequestData(); }, [id]);
  useEffect(() => { setCurrentIndex(thumbnails.length > 1 ? 1 : 0); }, [thumbnails.length]);
  useEffect(() => {
    if (!requestId) return;
    const channel = supabase
      .channel(`song-request-${requestId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "song_requests", filter: `id=eq.${requestId}` },
        (payload) => {
          setTicket((prev) => (prev ? { ...prev, ...payload.new } : prev));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  useEffect(() => {
    if (!ticket) return;
    const fetchTitles = async () => {
      const titles: Record<string, string> = {};
      await Promise.all(links.map(async (url: string) => {
        try {
          const res = await fetch(`https://noembed.com/embed?url=${url}`);
          const data = await res.json();
          if (data.title) titles[url] = data.title;
        } catch (err) {}
      }));
      setVideoTitles(prev => ({ ...prev, ...titles }));
    };
    if (links.length > 0) fetchTitles();
  }, [ticket]);

  useEffect(() => {
    if (!isTransitioning || totalSlides <= 1) return;
    const timeOut = setTimeout(() => {
      setIsTransitioning(false);
      if (currentIndex === 0) setCurrentIndex(extendedThumbnails.length - 2);
      else if (currentIndex === extendedThumbnails.length - 1) setCurrentIndex(1);
    }, 700);
    return () => clearTimeout(timeOut);
  }, [currentIndex, isTransitioning, extendedThumbnails.length, totalSlides]);

  async function fetchRequestData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      setIsAdmin(profile?.role === 'admin');
      const { data, error } = await supabase.from("song_requests").select(`*, profiles (full_name, avatar_url, phone, id)`).eq("id", id).maybeSingle(); 
      if (error || !data || (profile?.role !== 'admin' && data.user_id !== user.id)) { setTicket(null); return; }
      setTicket(data as Ticket);
      setFormData({ target_bpm: data.target_bpm || "", deadline: data.deadline || "" });
    } catch (error) {
    } finally { setIsPageLoading(false); }
  }

  async function saveChanges() {
    if (!isAdmin) return; 
    try {
      setSaving(true);
      const updates = { target_bpm: formData.target_bpm ? parseInt(formData.target_bpm) : null, deadline: formData.deadline || null };
      const { error } = await supabase.from("song_requests").update(updates).eq("id", id);
      if (error) throw error;
      showToast("Updated!", "success");
      setTicket((prev: any) => ({ ...prev, ...updates }));
    } catch (error) { showToast("Error saving.", "error"); } finally { setSaving(false); }
  }

  async function updateStatus(newStatus: string) {
    if (!isAdmin) return;
    setTicket((prev: any) => ({ ...prev, status: newStatus }));
    const { error } = await supabase.from("song_requests").update({ status: newStatus }).eq("id", id);
    if (error) showToast("Failed update", "error");
    else showToast(`Status: ${newStatus}`, "success");
  }

  async function confirmDelete() {
    try {
      setDeleting(true);
      const { error } = await supabase.from("song_requests").delete().eq("id", id);
      if (error) throw error;
      showToast("Deleted", "info"); 
      router.push(isAdmin ? "/pages/admin" : "/pages/user/my-tickets"); 
    } catch (err) { setDeleting(false); setIsDeleteModalOpen(false); }
  }

  const nextSlide = () => { if (totalSlides > 1 && !isTransitioning) { setIsTransitioning(true); setCurrentIndex(prev => prev + 1); } };
  const prevSlide = () => { if (totalSlides > 1 && !isTransitioning) { setIsTransitioning(true); setCurrentIndex(prev => prev - 1); } };
  const goToSlide = (index: number) => { if (isTransitioning || totalSlides <= 1) return; setIsTransitioning(true); setCurrentIndex(index + 1); };

  const onTouchStart = (e: React.TouchEvent) => { touchEndX.current = null; touchStartX.current = e.targetTouches[0].clientX; };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const onTouchEnd = () => { if (!touchStartX.current || !touchEndX.current) return; const distance = touchStartX.current - touchEndX.current; if (distance > 50) nextSlide(); if (distance < -50) prevSlide(); };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md shadow-lg border";
    switch (status) {
      case "accepted":
        return <span className={`${base} bg-blue-600 text-white border-blue-600 dark:text-blue-300 dark:bg-blue-900/60 dark:border-blue-600`}><FaCheck size={10} /> Queue</span>;
      case "in progress":
        return <span className={`${base} bg-yellow-500 text-white border-yellow-400 dark:text-yellow-300 dark:bg-yellow-900/60 dark:border-yellow-500`}><FaPlay size={8} /> Playing</span>;
      case "done":
        return <span className={`${base} bg-green-600 text-white border-green-500 dark:text-lime-300 dark:bg-lime-900/60 dark:border-lime-300`}><FaCheckDouble size={10} /> Finished</span>;
      default:
        return <span className={`${base} bg-gray-600 text-white border-gray-600 dark:text-stone-300 dark:bg-stone-900/60 dark:border-stone-300`}><FaClock size={10} /> Pending</span>;
    }
  };

  if (isPageLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-6">
      <div className="relative"><div className="w-16 h-16 border-4 border-blue-600/20 rounded-full" /><div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      <div className="flex flex-col items-center space-y-2"><FaMusic className="text-blue-500 text-2xl animate-bounce" /><p className="text-gray-400 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Request...</p></div>
    </div>
  );

  if (!ticket) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Request not found</p>
        <p className="text-gray-600 dark:text-gray-300 text-base">This request may have been removed or you do not have access.</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-500 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full transition-colors duration-500 bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden relative selection:bg-blue-500/30">
      {thumbnails.length > 0 && <MontageHeader images={thumbnails} />}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-16">
        
        {/* Responsive Header Controls */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 font-black transition-all px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-2xl bg-black/40 dark:bg-black/60 backdrop-blur-xl border border-white/20 text-white hover:scale-105"
          >
            <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden xs:inline text-xs sm:text-sm uppercase tracking-widest">{isAdmin ? "Board" : "Back"}</span>
          </button>
          
          {isAdmin && (
            <button onClick={() => setIsDeleteModalOpen(true)} className="p-3 rounded-xl sm:rounded-2xl bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-900/20 active:scale-90 transition-all">
              <FaTrash size={14} className="sm:text-lg" />
            </button>
          )}
        </div>

        {/* 🎵 MAIN HERO CARD */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp}
          className="bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col justify-end min-h-[350px] sm:min-h-[500px] touch-pan-y group"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className={`absolute inset-0 flex h-full ${isTransitioning ? 'transition-transform duration-700' : ''}`} style={{ width: `${extendedThumbnails.length * 100}%`, transform: totalSlides > 1 ? `translateX(-${(currentIndex * 100) / extendedThumbnails.length}%)` : `translateX(0%)` }}>
              {extendedThumbnails.map((img, idx) => (
                <div key={idx} className="h-full bg-cover bg-center flex-1 filter brightness-110 contrast-105 dark:opacity-80 dark:grayscale-[0.1]" style={{ backgroundImage: `url('${img}')` }} />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 sm:p-12">
            <div className="absolute top-5 right-5 sm:top-8 sm:right-8">{getStatusBadge(ticket.status)}</div>
            
            <div className="flex flex-col gap-2 sm:gap-4">
              <div className="flex gap-1.5 sm:gap-2">
                <span className="px-3 py-1 rounded text-[9px] sm:text-[11px] font-black uppercase tracking-widest border shadow-sm bg-purple-600 text-white border-purple-500 dark:text-purple-300 dark:bg-purple-900/60 dark:border-purple-500">{ticket.service_name || "N/A"}</span>
                {ticket.hype && <span className="px-3 py-1 rounded text-[9px] sm:text-[11px] font-black uppercase flex items-center gap-1 shadow-sm border bg-red-600 text-white border-red-500 dark:text-red-500 dark:bg-red-900/60 dark:border-red-500"><FaFire size={9} /> Hype</span>}
              </div>
              <h1 className="text-3xl sm:text-7xl font-black text-white leading-tight tracking-tighter max-w-[90%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">{ticket.title}</h1>
              
              {/* Metadata row refined for phone */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-white/90 text-[10px] sm:text-xs font-bold drop-shadow-md bg-black/30 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                <span className="flex items-center gap-1.5"><FaClock className="text-blue-400" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1.5"><FaPlusCircle size={10} className="opacity-70" /> {times.created}</span>
                {ticket.updated_at && (
                  <>
                    <span className="opacity-30">|</span>
                    <span className="flex items-center gap-1.5 text-blue-300"><FaPen size={10} className="opacity-70" /> {times.updated}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mt-8 sm:mt-10">
              <a href={currentLink} target="_blank" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-3.5 rounded-2xl hover:bg-red-700 transition-all font-black shadow-xl active:scale-95 text-xs sm:text-base">
                <FaYoutube size={18} /> <span className="truncate max-w-[200px] sm:max-w-[300px] uppercase tracking-widest">{currentTitle}</span>
              </a>

              {totalSlides > 1 && (
                <div className="flex items-center gap-5 mt-1">
                  <button onClick={prevSlide} className="md:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md hidden"><FaChevronLeft size={10} /></button>
                  <div className="flex gap-2.5">
                    {thumbnails.map((_, idx) => (
                      <button key={idx} onClick={() => goToSlide(idx)} className={`transition-all duration-300 rounded-full ${idx === realActiveIndex ? "w-6 sm:w-10 h-1.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"}`} />
                    ))}
                  </div>
                  <button onClick={nextSlide} className="md:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md hidden"><FaChevronRight size={10} /></button>
                </div>
              )}
            </div>

            {isAdmin && (
              /* Admin Buttons Row (Single row on mobile) */
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/20">
                {[
                  { id: 'accepted', label: 'Queue', icon: FaCheck, color: 'blue' },
                  { id: 'in progress', label: 'Play', icon: FaPlay, color: 'yellow' },
                  { id: 'done', label: 'Done', icon: FaCheckDouble, color: 'green' }
                ].map(btn => (
                  <button key={btn.id} onClick={() => updateStatus(btn.id)} className={`py-3 px-1 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-tighter flex flex-col items-center justify-center gap-1.5 transition-all border shadow-sm ${ticket.status === btn.id ? `bg-${btn.color}-600 text-white border-${btn.color}-400 shadow-lg scale-105` : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/15'}`}>
                    <btn.icon size={11} /> <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Technicals & Instructions refined for mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="lg:col-span-2 bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#252525] rounded-[1.8rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl">
             <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><FaAlignLeft className="text-blue-500" /> Instructions</h3>
             <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{ticket.description || "No specific instructions provided."}</p>
           </motion.div>
           
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
             <div className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#252525] rounded-[1.8rem] sm:rounded-[2rem] p-6 shadow-xl">
               <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><FaTachometerAlt className="text-blue-500" /> Technicals</h3>
               <div className="space-y-4">
                 <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">{ticket.tracks?.[0]?.base_bpm || "?"} <FaLongArrowAltRight className="text-gray-400" /> {ticket.target_bpm || ticket.tracks?.[0]?.target_bpm || "?"} <span className="text-[10px] font-normal text-gray-500 uppercase tracking-widest ml-auto">bpm</span></p>
                 <p className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3"><FaCalendarAlt className="text-blue-500" /> {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : "No Deadline"}</p>
               </div>
             </div>

             <div className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#252525] rounded-[1.8rem] sm:rounded-[2rem] p-5 sm:p-6 shadow-xl">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex-shrink-0">
                   {ticket.profiles?.avatar_url ? <img src={ticket.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUser size={16} /></div>}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Requester</p>
                   {isAdmin && ticket.profiles?.id ? (
                     <Link
                       href={`/pages/admin/user/${ticket.profiles.id}`}
                       className="font-black text-sm text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                     >
                       {ticket.profiles?.full_name || "Account Owner"}
                     </Link>
                   ) : (
                     <p className="font-black text-sm text-gray-900 dark:text-white truncate">{isAdmin ? ticket.profiles?.full_name : "Account Owner"}</p>
                   )}
                 </div>
               </div>
             </div>
           </motion.div>
        </div>
      </div>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Confirm Deletion" message="This request will be permanently removed. This cannot be undone." confirmText="Delete Now" loading={deleting} />
    </div>
  );
}