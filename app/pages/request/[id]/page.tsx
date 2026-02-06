"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaClock, 
  FaCheck, 
  FaPlay, 
  FaCheckDouble, 
  FaTrash, 
  FaSave,
  FaCalendarAlt,
  FaTachometerAlt,
  FaLongArrowAltRight,
  FaYoutube,
  FaUser,
  FaHome,
  FaPlus,
  FaList,
  FaAlignLeft 
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { useToast } from "@/app/context/ToastContext";

// 🎨 COMPONENT: Montage Header (Static Background Collage)
const MontageHeader = ({ images }: { images: string[] }) => {
  const displayImages = images.length < 5 ? [...images, ...images, ...images] : images;
  
  return (
    <div className="absolute top-0 left-0 w-full h-[400px] z-0 overflow-hidden opacity-40 pointer-events-none select-none">
      <div className="absolute inset-0 flex w-full h-full">
        {displayImages.slice(0, 7).map((img, i) => (
          <div 
            key={i} 
            className="relative h-full flex-1 overflow-hidden transform -skew-x-12 scale-125 border-r border-black/30"
          >
            <img 
              src={img} 
              alt="header-part" 
              className="w-full h-full object-cover grayscale-[50%] opacity-70" 
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/20 via-[#121212]/80 to-[#121212]" />
    </div>
  );
};

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  
  // 🎢 INFINITE CAROUSEL STATE
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoTitles, setVideoTitles] = useState<Record<string, string>>({});

  // 👆 TOUCH STATE
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // 🔐 Permissions
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    base_bpm: "",
    target_bpm: "",
    deadline: ""
  });

  // --- 1. DATA PREPARATION (Must happen before any returns) ---
  const links = ticket ? (Array.isArray(ticket.youtube_link) ? ticket.youtube_link : [ticket.youtube_link]) : [];
  
  const rawThumbnails = getYouTubeThumbnail(links);
  let thumbnails = Array.isArray(rawThumbnails) ? rawThumbnails : (rawThumbnails ? [rawThumbnails] : []);
  // Upgrade to HD
  thumbnails = thumbnails.map(url => url.replace("hqdefault", "maxresdefault"));
  
  const totalSlides = thumbnails.length;
  const isChoreo = (ticket?.music_category || "").toLowerCase() === "choreo";

  // Infinite Loop Array: [Last, ...Originals, First]
  // We default to empty array if no data to prevent crash during loading
  const extendedThumbnails = totalSlides > 1 
    ? [thumbnails[totalSlides - 1], ...thumbnails, thumbnails[0]]
    : thumbnails;

  // Calculate Real Index
  let realActiveIndex = 0;
  if (totalSlides > 1) {
    if (currentIndex === 0) realActiveIndex = totalSlides - 1;
    else if (currentIndex === extendedThumbnails.length - 1) realActiveIndex = 0;
    else realActiveIndex = currentIndex - 1;
  }

  const currentLink = links[realActiveIndex] || links[0] || "#";
  const currentTitle = videoTitles[currentLink] || "Watch on YouTube";

  // --- 2. EFFECTS (Must be at top level) ---

  useEffect(() => {
    if (id) fetchRequestData();
  }, [id]);

  // Fetch YouTube Titles
  useEffect(() => {
    if (!ticket) return;
    const fetchTitles = async () => {
      const titles: Record<string, string> = {};
      await Promise.all(links.map(async (url: string) => {
        try {
          const res = await fetch(`https://noembed.com/embed?url=${url}`);
          const data = await res.json();
          if (data.title) titles[url] = data.title;
        } catch (err) {
          console.error("Failed to fetch title for", url);
        }
      }));
      setVideoTitles(prev => ({ ...prev, ...titles }));
    };
    if (links.length > 0) fetchTitles();
  }, [ticket]);

  // 👻 TELEPORTATION EFFECT (Moved UP before returns)
  useEffect(() => {
    if (!isTransitioning) return;

    const timeOut = setTimeout(() => {
      setIsTransitioning(false);
      if (currentIndex === 0) {
        setCurrentIndex(extendedThumbnails.length - 2);
      } 
      else if (currentIndex === extendedThumbnails.length - 1) {
        setCurrentIndex(1);
      }
    }, 700);

    return () => clearTimeout(timeOut);
  }, [currentIndex, isTransitioning, extendedThumbnails.length]);


  // --- 3. FUNCTIONS ---

  async function fetchRequestData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      const adminStatus = profile?.role === 'admin';
      setIsAdmin(adminStatus);

      const { data, error } = await supabase.from("song_requests").select(`*, profiles (full_name, avatar_url, phone, id)`).eq("id", id).maybeSingle(); 

      if (error || !data || (!adminStatus && data.user_id !== user.id)) {
        setTicket(null); 
        return; 
      }

      setTicket(data);
      setFormData({
        base_bpm: data.base_bpm || "",
        target_bpm: data.target_bpm || "",
        deadline: data.deadline || ""
      });
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    if (!isAdmin) return; 
    try {
      setSaving(true);
      const updates = {
        base_bpm: formData.base_bpm ? parseInt(formData.base_bpm) : null,
        target_bpm: formData.target_bpm ? parseInt(formData.target_bpm) : null,
        deadline: formData.deadline || null
      };
      const { error } = await supabase.from("song_requests").update(updates).eq("id", id);
      if (error) throw error;
      showToast("Changes saved successfully!", "success");
    } catch (error) {
      showToast("Error saving changes.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(newStatus: string) {
    if (!isAdmin) return;
    setTicket((prev: any) => ({ ...prev, status: newStatus }));
    const { error } = await supabase.from("song_requests").update({ status: newStatus }).eq("id", id);
    if (error) showToast("Failed to update status", "error");
    else showToast(`Status updated to ${newStatus}`, "success");
  }

  async function deleteTicket() {
    if (!isAdmin) return;
    if(!confirm("Delete this request?")) return;
    const { error } = await supabase.from("song_requests").delete().eq("id", id);
    if (error) showToast("Failed to delete", "error");
    else { showToast("Deleted", "info"); router.push("/pages/admin"); }
  }

  // 🎠 NAVIGATION
  const nextSlide = () => {
    if (totalSlides <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (totalSlides <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index + 1); 
  };

  // 👆 TOUCH HANDLERS
  const minSwipeDistance = 50;
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
    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <span className="bg-blue-900/80 text-blue-200 border border-blue-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaCheck /> Queue</span>;
      case 'in progress': return <span className="bg-yellow-900/80 text-yellow-200 border border-yellow-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaPlay /> Playing</span>;
      case 'completed': return <span className="bg-green-900/80 text-green-200 border border-green-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaCheckDouble /> Done</span>;
      default: return <span className="bg-gray-800/80 text-gray-300 border border-gray-600/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaClock /> Pending</span>;
    }
  };

  // --- 4. RENDER (Early returns happen HERE, after all hooks) ---

  if (loading) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Loading...</div>;
  if (!ticket) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Request Not Found</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans relative select-none">
      
      {/* 🖼️ MONTAGE HEADER */}
      {thumbnails.length > 0 && <MontageHeader images={thumbnails} />}

      {/* Navigation */}
      <div className="relative z-20 flex justify-between items-center mb-4 max-w-5xl mx-auto p-4 sm:p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <FaChevronLeft /> {isAdmin ? "Back to Board" : "Back"}
        </button>
        {isAdmin && (
          <button onClick={deleteTicket} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition-colors bg-black/30 backdrop-blur-md border border-white/10">
              <FaTrash />
          </button>
        )}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 p-4 sm:p-6 pt-0">
        
        {/* 🎵 MAIN HERO CARD */}
        <div 
            className="bg-[#1a1a1a] border border-[#333] rounded-3xl shadow-2xl shadow-black/50 relative z-20 overflow-hidden group min-h-[350px] flex flex-col justify-end touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            
            {/* 🖼️ INFINITE SLIDER */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
               <div 
                 className={`absolute inset-0 flex h-full ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
                 style={{ 
                   width: `${extendedThumbnails.length * 100}%`,
                   transform: `translateX(-${(currentIndex * 100) / extendedThumbnails.length}%)` 
                 }}
               >
                 {extendedThumbnails.map((img, idx) => (
                   <div 
                     key={idx}
                     className="h-full bg-cover bg-center flex-1 relative"
                     style={{ backgroundImage: `url('${img}')` }}
                   >
                      <div className="absolute inset-0 bg-black/20" />
                   </div>
                 ))}
               </div>
               
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
               <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="relative z-10 p-6 sm:p-8">
                
                <div className="absolute top-6 right-6 z-20">
                    {getStatusBadge(ticket.status)}
                </div>

                <div className="flex flex-col gap-4 pointer-events-none">
                    <div className="w-full pr-24 sm:pr-0">
                        <span className={`inline-block mb-3 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shadow-lg backdrop-blur-sm ${isChoreo ? 'bg-purple-600/80 text-purple-100 border-purple-400/50' : 'bg-blue-600/80 text-blue-100 border-blue-400/50'}`}>
                            {ticket.music_category || "Dance Class"}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                            {ticket.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm font-medium">
                            <span className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                <FaClock className="text-blue-400" /> {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 🚀 CONTROLS AREA */}
                <div className="flex flex-col items-center justify-center gap-3 mt-6 mb-4 pointer-events-auto">
                    
                    {/* YouTube Button */}
                    <a 
                      href={currentLink} 
                      target="_blank"
                      onTouchStart={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 bg-red-600/90 hover:bg-red-600 text-white px-6 py-2 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-red-900/50 border border-white/10 font-bold transform hover:-translate-y-0.5"
                    >
                        <FaYoutube size={18} /> 
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">
                          {currentTitle}
                        </span>
                    </a>

                    {/* Pagination */}
                    {totalSlides > 1 && (
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-white/80 hover:text-white transition-all backdrop-blur-sm"
                        >
                          <FaChevronLeft size={12} />
                        </button>

                        <div className="flex justify-center gap-2">
                          {thumbnails.map((_, idx) => (
                            <button 
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
                              onTouchStart={(e) => e.stopPropagation()}
                              className={`transition-all duration-300 rounded-full shadow-sm ${
                                idx === realActiveIndex 
                                  ? "w-2.5 h-2.5 bg-white scale-110" 
                                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
                              }`}
                            />
                          ))}
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-white/80 hover:text-white transition-all backdrop-blur-sm"
                        >
                          <FaChevronRight size={12} />
                        </button>
                      </div>
                    )}
                </div>

                {/* Admin Actions */}
                {isAdmin ? (
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 pointer-events-auto">
                      <button onClick={() => updateStatus('accepted')} className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg ${ticket.status === 'accepted' ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}><FaCheck /> Accept</button>
                      <button onClick={() => updateStatus('in progress')} className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg ${ticket.status === 'in progress' ? 'bg-yellow-600 text-white ring-2 ring-yellow-400' : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}><FaPlay /> Play</button>
                      <button onClick={() => updateStatus('completed')} className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg ${ticket.status === 'completed' ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}><FaCheckDouble /> Finish</button>
                  </div>
                ) : (
                  <div className="mt-6 pt-6 border-t border-white/10 text-gray-400 text-sm italic">
                    Status updates are managed by the admin.
                  </div>
                )}
            </div>
        </div>

        {/* 📝 DESCRIPTION */}
        {ticket.description && ticket.description.trim() !== "" && (
          <div className="relative z-10 bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 shadow-lg shadow-black/50">
             <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <FaAlignLeft className="text-blue-500" /> Description
             </h3>
             <p className="text-gray-200 leading-relaxed text-sm whitespace-pre-wrap font-light">
               {ticket.description}
             </p>
          </div>
        )}

        {/* DETAILS & USER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
                    <FaTachometerAlt className="text-blue-500" /> {isAdmin ? "Admin Data" : "Technical Details"}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">BPM Transition</label>
                        <div className="flex items-center gap-2">
                           {isAdmin ? (
                             <>
                               <input type="number" placeholder="Base" value={formData.base_bpm} onChange={(e) => setFormData({...formData, base_bpm: e.target.value})} className="w-full bg-[#222] border border-[#333] rounded-xl p-3 text-white focus:border-blue-500 outline-none" />
                               <FaLongArrowAltRight className="text-gray-500" />
                               <input type="number" placeholder="Target" value={formData.target_bpm} onChange={(e) => setFormData({...formData, target_bpm: e.target.value})} className="w-full bg-[#222] border border-[#333] rounded-xl p-3 text-white focus:border-blue-500 outline-none" />
                             </>
                           ) : (
                             <div className="w-full bg-[#222] border border-[#333] rounded-xl p-3 text-white flex items-center gap-2">
                                <span className="text-blue-400 font-bold">{ticket.base_bpm || "?"}</span> 
                                <span className="text-gray-500">to</span> 
                                <span className="text-purple-400 font-bold">{ticket.target_bpm || "?"}</span> 
                                <span className="text-xs text-gray-500 ml-auto">BPM</span>
                             </div>
                           )}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Deadline</label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-500" />
                            {isAdmin ? (
                               <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full bg-[#222] border border-[#333] rounded-xl p-3 pl-10 text-white focus:border-blue-500 outline-none appearance-none" style={{colorScheme: "dark"}} />
                            ) : (
                                <div className="w-full bg-[#222] border border-[#333] rounded-xl p-3 pl-10 text-white">
                                   {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : "No deadline set"}
                                </div>
                            )}
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={saveChanges} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all">
                            {saving ? "Saving..." : <><FaSave /> Save Details</>}
                        </button>
                    )}
                </div>
            </div>

            {isAdmin ? (
                <Link href={`/pages/admin/user/${ticket.user_id}?from=list`} className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 hover:border-gray-500 transition-colors group h-full block">
                    <UserCardContent ticket={ticket} isAdmin={true} />
                </Link>
            ) : (
                <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 h-full block">
                    <UserCardContent ticket={ticket} isAdmin={false} />
                </div>
            )}
        </div>
      </div>
    </main>
  );
}

function UserCardContent({ ticket, isAdmin }: { ticket: any, isAdmin: boolean }) {
    return (
        <>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
                <FaUser className="text-purple-500" /> {isAdmin ? "Requested By" : "Your Request"}
            </h2>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#2a2a2a] overflow-hidden border-2 border-[#333] group-hover:border-purple-500 transition-colors shrink-0">
                    {ticket.profiles?.avatar_url ? (
                        <img src={ticket.profiles.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-500"><FaUser /></div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-purple-400 transition-colors">
                        {isAdmin ? (ticket.profiles?.full_name || "Unknown") : "You"}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {isAdmin ? (ticket.profiles?.phone || "No phone number") : "Request Owner"}
                    </p>
                </div>
            </div>
            {isAdmin && <div className="mt-6 text-xs text-gray-500 text-center uppercase tracking-widest font-mono group-hover:text-white transition-colors">Click to view profile →</div>}
        </>
    )
}