"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, Variants } from "framer-motion";
import { 
  FaChevronLeft, FaClock, FaCheck, FaPlay, 
  FaCheckDouble, FaTrash, FaSave, FaCalendarAlt, FaTachometerAlt, 
  FaLongArrowAltRight, FaYoutube, FaUser, FaAlignLeft, FaFire, FaMusic, FaPen, FaPlusCircle,
  FaChevronRight
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
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}w ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

// 🎨 COMPONENT: Montage Header (Diagonal Cut, No Repeat)
const MontageHeader = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="absolute top-0 left-0 w-full h-[300px] sm:h-[450px] z-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 flex w-[110%] -left-[5%] h-full">
        {images.map((img, i) => (
          <div 
            key={i} 
            className="relative h-full flex-1 overflow-hidden"
            style={{
              clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0% 100%)',
              marginLeft: i === 0 ? '0' : '-4%' 
            }}
          >
            <img 
              src={img} 
              alt="bg-part" 
              className="w-full h-full object-cover filter brightness-110 contrast-110 opacity-90 dark:opacity-60 dark:brightness-110 dark:contrast-110 dark:grayscale-[0.1]" 
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
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({ base_bpm: "", target_bpm: "", deadline: "" });
  const [times, setTimes] = useState({ created: "", updated: "" });

  const links = ticket ? (Array.isArray(ticket.youtube_link) ? ticket.youtube_link : [ticket.youtube_link]) : [];
  const rawThumbnails = getYouTubeThumbnail(links);
  let thumbnails = (Array.isArray(rawThumbnails) ? rawThumbnails : [rawThumbnails])
    .filter((url): url is string => url !== null && url !== undefined)
    .map(url => url.replace("hqdefault", "maxresdefault"));
  
  const totalSlides = thumbnails.length;
  const isChoreo = (ticket?.music_category || "").toLowerCase() === "choreo";
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
      setFormData({ base_bpm: data.base_bpm || "", target_bpm: data.target_bpm || "", deadline: data.deadline || "" });
    } catch (error) {
    } finally { setIsPageLoading(false); }
  }

  async function updateStatus(newStatus: string) {
    if (!isAdmin) return;
    setTicket((prev: any) => ({ ...prev, status: newStatus }));
    const { error } = await supabase.from("song_requests").update({ status: newStatus }).eq("id", id);
    if (error) showToast("Failed update", "error");
    else showToast(`Status: ${newStatus}`, "success");
  }

  // ✅ FIXED: confirmDelete function defined within scope
  async function confirmDelete() {
    try {
      setDeleting(true);
      const { error } = await supabase.from("song_requests").delete().eq("id", id);
      if (error) throw error;
      showToast("Deleted successfully", "info"); 
      router.push(isAdmin ? "/pages/admin" : "/pages/user/my-tickets"); 
    } catch (err) { 
      showToast("Error deleting", "error");
      setDeleting(false); 
      setIsDeleteModalOpen(false); 
    }
  }

  const nextSlide = () => { if (totalSlides > 1 && !isTransitioning) { setIsTransitioning(true); setCurrentIndex(prev => prev + 1); } };
  const prevSlide = () => { if (totalSlides > 1 && !isTransitioning) { setIsTransitioning(true); setCurrentIndex(prev => prev - 1); } };
  const goToSlide = (index: number) => { if (isTransitioning || totalSlides <= 1) return; setIsTransitioning(true); setCurrentIndex(index + 1); };

  const onTouchStart = (e: React.TouchEvent) => { touchEndX.current = null; touchStartX.current = e.targetTouches[0].clientX; };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.targetTouches[0].clientX; };
  const onTouchEnd = () => { if (!touchStartX.current || !touchEndX.current) return; const distance = touchStartX.current - touchEndX.current; if (distance > 50) nextSlide(); if (distance < -50) prevSlide(); };

  if (isPageLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-6">
      <div className="relative"><div className="w-16 h-16 border-4 border-blue-600/20 rounded-full" /><div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      <div className="flex flex-col items-center space-y-2"><FaMusic className="text-blue-500 text-2xl animate-bounce" /><p className="text-gray-400 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Request...</p></div>
    </div>
  );

  if (!ticket) return <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">Request Not Found</div>;

  return (
    <div className="min-h-screen w-full transition-colors duration-500 bg-gray-50 dark:bg-[#0a0a0a] overflow-x-hidden relative selection:bg-blue-500/30">
      {thumbnails.length > 0 && <MontageHeader images={thumbnails} />}
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        
        {/* 🔙 ENHANCED BACK BUTTON */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 font-bold transition-all px-5 py-2.5 rounded-2xl shadow-2xl
              /* Light/Dark high-contrast glass style */
              bg-black/40 dark:bg-black/60 backdrop-blur-xl border border-white/20 text-white
              hover:bg-black/60 dark:hover:bg-black/80 hover:scale-105 active:scale-95"
          >
            <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden xs:inline">{isAdmin ? "Dashboard" : "Back"}</span>
          </button>
          
          {isAdmin && (
            <button onClick={() => setIsDeleteModalOpen(true)} className="p-3 rounded-2xl bg-red-600 text-white hover:bg-red-500 transition-all active:scale-90 shadow-xl shadow-red-900/20">
              <FaTrash size={16} />
            </button>
          )}
        </div>

        {/* 🎵 MAIN HERO CARD */}
        <motion.div 
          initial="hidden" animate="visible" variants={fadeInUp}
          className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-20 overflow-hidden flex flex-col justify-end min-h-[400px] sm:min-h-[500px] touch-pan-y group"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className={`absolute inset-0 flex h-full ${isTransitioning ? 'transition-transform duration-700' : ''}`} style={{ width: `${extendedThumbnails.length * 100}%`, transform: totalSlides > 1 ? `translateX(-${(currentIndex * 100) / extendedThumbnails.length}%)` : `translateX(0%)` }}>
              {extendedThumbnails.map((img, idx) => (
                <div key={idx} className="h-full bg-cover bg-center flex-1 filter brightness-110 contrast-105 dark:opacity-80 dark:grayscale-[0.1]" style={{ backgroundImage: `url('${img}')` }} />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-12">
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
               {/* Larger Badges */}
               <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-lg backdrop-blur-md
                ${ticket.status === 'done' ? 'bg-green-600 text-white border-green-500' : 
                  ticket.status === 'in progress' ? 'bg-yellow-500 text-white border-yellow-400' : 
                  'bg-blue-600 text-white border-blue-500'}`}>
                {ticket.status === 'done' ? <FaCheckDouble className="inline mr-2" /> : ticket.status === 'in progress' ? <FaPlay className="inline mr-2" /> : <FaClock className="inline mr-2" />}
                {ticket.status}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:gap-4">
              <div className="flex gap-2">
                <span className="px-4 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest border shadow-sm bg-purple-600 text-white border-purple-500">{ticket.music_category || "CHOREO"}</span>
                {ticket.hype && <span className="px-4 py-1 rounded-lg text-[11px] font-black uppercase flex items-center gap-1 shadow-sm border bg-red-600 text-white border-red-500"><FaFire size={11} /> Hype</span>}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter max-w-[85%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">{ticket.title}</h1>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/90 text-[10px] sm:text-xs font-bold drop-shadow-md bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="flex items-center gap-1.5"><FaClock className="text-blue-400" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                <span className="opacity-40">|</span>
                <span className="flex items-center gap-1.5"><FaPlusCircle size={10} className="opacity-70" /> {times.created}</span>
                {ticket.updated_at && (
                  <>
                    <span className="opacity-40">|</span>
                    <span className="flex items-center gap-1.5 text-blue-300"><FaPen size={10} className="opacity-70" /> {times.updated}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mt-8 sm:mt-10">
              <a href={currentLink} target="_blank" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-3.5 rounded-2xl hover:bg-red-700 transition-all font-bold shadow-xl active:scale-95">
                <FaYoutube size={20} /> <span className="truncate max-w-[200px] sm:max-w-[300px]">{currentTitle}</span>
              </a>

              {totalSlides > 1 && (
                <div className="flex items-center gap-6 mt-2">
                  <button onClick={prevSlide} className="md:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-md"><FaChevronLeft size={10} /></button>
                  <div className="flex gap-2">
                    {thumbnails.map((_, idx) => (
                      <button key={idx} onClick={() => goToSlide(idx)} className={`transition-all duration-300 rounded-full ${idx === realActiveIndex ? "w-5 sm:w-8 h-1.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"}`} />
                    ))}
                  </div>
                  <button onClick={nextSlide} className="md:flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-md"><FaChevronRight size={10} /></button>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-white/20">
                {[
                  { id: 'accepted', label: 'Queue', icon: FaCheck, color: 'blue' },
                  { id: 'in progress', label: 'Play', icon: FaPlay, color: 'yellow' },
                  { id: 'done', label: 'Done', icon: FaCheckDouble, color: 'green' }
                ].map(btn => (
                  <button key={btn.id} onClick={() => updateStatus(btn.id)} className={`py-3 px-1 rounded-xl font-black text-[10px] uppercase flex flex-col items-center justify-center gap-1 transition-all border shadow-sm ${ticket.status === btn.id ? `bg-${btn.color}-600 text-white border-${btn.color}-400 shadow-lg` : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'}`}>
                    <btn.icon size={12} /> <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ... (Lower sections: Instructions & Technicals) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="lg:col-span-2 bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#252525] rounded-[2rem] p-8 shadow-xl">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FaAlignLeft className="text-blue-500" /> Instructions</h3>
             <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{ticket.description || "No specific instructions provided."}</p>
           </motion.div>
           
           <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
             {/* Technicals and Profile cards remain as per previous logic, ensuring consistent rounded-[2rem] */}
             <div className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#252525] rounded-[2rem] p-6 shadow-xl">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FaTachometerAlt className="text-blue-500" /> Technicals</h3>
               <div className="space-y-4">
                 <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{ticket.base_bpm || "?"} <FaLongArrowAltRight className="inline mx-2 text-gray-400" /> {ticket.target_bpm || "?"} <span className="text-xs font-normal text-gray-500 lowercase ml-1">bpm</span></p>
                 <p className="text-sm font-bold text-gray-900 dark:text-white"><FaCalendarAlt className="inline mr-2 text-blue-500" /> {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : "Flexible"}</p>
               </div>
             </div>

             <div className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#252525] rounded-[2rem] p-6 shadow-xl">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex-shrink-0">
                   {ticket.profiles?.avatar_url ? <img src={ticket.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUser size={14} /></div>}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">Requester</p>
                   <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{isAdmin ? ticket.profiles?.full_name : "You"}</p>
                 </div>
               </div>
             </div>
           </motion.div>
        </div>
      </div>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Request?" message="This will permanently remove this song request from the server. This action cannot be undone." confirmText="Delete Forever" loading={deleting} />
    </div>
  );
}