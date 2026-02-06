"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  FaChevronLeft, 
  FaMusic, 
  FaUser, 
  FaClock, 
  FaCheck, 
  FaPlay, 
  FaCheckDouble, 
  FaTrash, 
  FaSave,
  FaCalendarAlt,
  FaTachometerAlt,
  FaLongArrowAltRight,
  FaYoutube
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";
import { useToast } from "@/app/context/ToastContext"; // 👈 Import Hook

// Helper component for the Choreo Diagonal Montage
const ChoreoMontage = ({ images }: { images: string[] }) => {
  return (
    <div className="absolute inset-0 flex w-full h-full overflow-hidden">
      {images.map((img, i) => (
        <div 
          key={i} 
          className="relative h-full flex-1 overflow-hidden transform -skew-x-12 scale-110 border-r-4 border-black/50 last:border-r-0"
        >
          <img 
            src={img} 
            alt="montage-part" 
            className="w-full h-full object-cover transform skew-x-12 scale-125 opacity-80" 
          />
        </div>
      ))}
    </div>
  );
};

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast(); // 👈 Use Hook
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ticket, setTicket] = useState<any>(null);

  // Form State for Admin Edits
  const [formData, setFormData] = useState({
    base_bpm: "",
    target_bpm: "",
    deadline: ""
  });

  useEffect(() => {
    if (id) fetchRequestData();
  }, [id]);

  async function fetchRequestData() {
    try {
      setLoading(true);

      // 1. Check Admin Permission
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      
      const { data: adminCheck } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (adminCheck?.role !== 'admin') {
        router.push("/pages/user/my-tickets");
        return;
      }

      // 2. Fetch Request + User Profile
      const { data, error } = await supabase
        .from("song_requests")
        .select(`
          *,
          profiles (full_name, avatar_url, phone, id)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setTicket(data);
      
      // Initialize form with existing data
      setFormData({
        base_bpm: data.base_bpm || "",
        target_bpm: data.target_bpm || "",
        deadline: data.deadline || ""
      });

    } catch (error) {
      console.error("Error loading request:", error);
    } finally {
      setLoading(false);
    }
  }

  // 💾 SAVE CHANGES (BPM / Deadline)
  async function saveChanges() {
    try {
      setSaving(true);
      
      const updates = {
        base_bpm: formData.base_bpm ? parseInt(formData.base_bpm) : null,
        target_bpm: formData.target_bpm ? parseInt(formData.target_bpm) : null,
        deadline: formData.deadline || null
      };

      const { error } = await supabase
        .from("song_requests")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      showToast("Changes saved successfully!", "success"); // 👈 Use Toast

    } catch (error) {
      showToast("Error saving changes.", "error"); // 👈 Use Toast
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  // 🔄 UPDATE STATUS
  async function updateStatus(newStatus: string) {
    setTicket((prev: any) => ({ ...prev, status: newStatus }));
    const { error } = await supabase.from("song_requests").update({ status: newStatus }).eq("id", id);
    if (error) {
       showToast("Failed to update status", "error");
    } else {
       showToast(`Status updated to ${newStatus}`, "success");
    }
  }

  // 🗑️ DELETE REQUEST
  async function deleteTicket() {
    if(!confirm("Are you sure you want to delete this request permanently?")) return;
    const { error } = await supabase.from("song_requests").delete().eq("id", id);
    if (error) {
        showToast("Failed to delete request", "error");
    } else {
        showToast("Request deleted", "info");
        router.push("/pages/admin");
    }
  }

  // Helper for Status Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <span className="bg-blue-900/80 text-blue-200 border border-blue-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaCheck /> Queue</span>;
      case 'in progress': return <span className="bg-yellow-900/80 text-yellow-200 border border-yellow-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaPlay /> Playing</span>;
      case 'completed': return <span className="bg-green-900/80 text-green-200 border border-green-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaCheckDouble /> Done</span>;
      default: return <span className="bg-gray-800/80 text-gray-300 border border-gray-600/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaClock /> Pending</span>;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Loading Request...</div>;
  if (!ticket) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Request Not Found</div>;

  // 🎨 PREPARE IMAGES
  const links = Array.isArray(ticket.youtube_link) ? ticket.youtube_link : [ticket.youtube_link];
  const rawThumbnails = getYouTubeThumbnail(links);
  const thumbnails = Array.isArray(rawThumbnails) ? rawThumbnails : (rawThumbnails ? [rawThumbnails] : []);
  const isChoreo = (ticket.music_category || "").toLowerCase() === "choreo";

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans p-4 sm:p-6">
      
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <FaChevronLeft /> Back to Board
        </button>
        <button onClick={deleteTicket} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition-colors" title="Delete Request">
            <FaTrash />
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 🎵 MAIN CARD: Song Info & Status */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl shadow-2xl relative overflow-hidden group min-h-[300px] flex flex-col justify-end">
            
            {/* 🖼️ DYNAMIC BACKGROUND LAYER */}
            <div className="absolute inset-0 z-0">
               {isChoreo && thumbnails.length > 1 ? (
                 // Option A: Choreo Diagonal Montage
                 <ChoreoMontage images={thumbnails} />
               ) : (
                 // Option B: Standard Single Wallpaper
                 <div 
                   className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                   style={{ backgroundImage: `url('${thumbnails[0]}')` }}
                 />
               )}
               {/* Dark Overlay Gradient for text readability */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
               <div className="absolute inset-0 bg-black/30" /> 
            </div>

            {/* CONTENT LAYER */}
            <div className="relative z-10 p-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="w-full">
                        {/* Category Tag */}
                        <span className={`inline-block mb-3 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shadow-lg backdrop-blur-sm
                            ${isChoreo 
                                ? 'bg-purple-600/80 text-purple-100 border-purple-400/50' 
                                : 'bg-blue-600/80 text-blue-100 border-blue-400/50'}
                        `}>
                            {ticket.music_category || "Dance Class"}
                        </span>

                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                            {ticket.title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm font-medium">
                            <span className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                <FaClock className="text-blue-400" /> {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                            <a href={links[0]} target="_blank" className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg backdrop-blur-md transition-colors shadow-lg">
                                <FaYoutube /> Open on YouTube
                            </a>
                        </div>
                    </div>
                    
                    <div className="shrink-0 mb-1">
                        {getStatusBadge(ticket.status)}
                    </div>
                </div>

                {/* Status Control Buttons (Glassmorphism style) */}
                <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10">
                    <button 
                        onClick={() => updateStatus('accepted')}
                        className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg
                            ${ticket.status === 'accepted' 
                                ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-black' 
                                : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}
                    >
                        <FaCheck /> Accept
                    </button>
                    <button 
                        onClick={() => updateStatus('in progress')}
                        className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg
                            ${ticket.status === 'in progress' 
                                ? 'bg-yellow-600 text-white ring-2 ring-yellow-400 ring-offset-2 ring-offset-black' 
                                : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}
                    >
                        <FaPlay /> Play
                    </button>
                    <button 
                        onClick={() => updateStatus('completed')}
                        className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg
                            ${ticket.status === 'completed' 
                                ? 'bg-green-600 text-white ring-2 ring-green-400 ring-offset-2 ring-offset-black' 
                                : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}
                    >
                        <FaCheckDouble /> Finish
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ⚙️ DJ DATA (Edit Form) */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
                    <FaTachometerAlt className="text-blue-500" /> Admin Data
                </h2>
                
                <div className="space-y-4">
                    {/* BPM Row */}
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">BPM Transition</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="Base"
                                value={formData.base_bpm}
                                onChange={(e) => setFormData({...formData, base_bpm: e.target.value})}
                                className="w-full bg-[#222] border border-[#333] rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors"
                            />
                            <FaLongArrowAltRight className="text-gray-500" />
                            <input 
                                type="number" 
                                placeholder="Target"
                                value={formData.target_bpm}
                                onChange={(e) => setFormData({...formData, target_bpm: e.target.value})}
                                className="w-full bg-[#222] border border-[#333] rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">Deadline</label>
                        <div className="relative">
                            <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-500" />
                            <input 
                                type="date" 
                                value={formData.deadline}
                                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                className="w-full bg-[#222] border border-[#333] rounded-xl p-3 pl-10 text-white focus:border-blue-500 outline-none transition-colors appearance-none" 
                                style={{colorScheme: "dark"}}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={saveChanges}
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all"
                    >
                        {saving ? "Saving..." : <><FaSave /> Save Details</>}
                    </button>
                </div>
            </div>

            {/* 👤 REQUESTED BY (User Card) */}
            <Link href={`/pages/admin/user/${ticket.user_id}?from=list`} className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 hover:border-gray-500 transition-colors group h-full block">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
                    <FaUser className="text-purple-500" /> Requested By
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
                        <h3 className="font-bold text-xl text-white group-hover:text-purple-400 transition-colors">{ticket.profiles?.full_name || "Unknown"}</h3>
                        <p className="text-sm text-gray-500">{ticket.profiles?.phone || "No phone number"}</p>
                    </div>
                </div>
                
                <div className="mt-6 text-xs text-gray-500 text-center uppercase tracking-widest font-mono group-hover:text-white transition-colors">
                    Click to view profile →
                </div>
            </Link>

        </div>
      </div>
    </main>
  );
}