"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  FaChevronLeft, 
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

// Helper for the visual montage
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
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  
  // 🔐 Permissions State
  const [isAdmin, setIsAdmin] = useState(false);

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

      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      // 2. Check Role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      const adminStatus = profile?.role === 'admin';
      setIsAdmin(adminStatus);

      // 3. Fetch Request Data
      const { data, error } = await supabase
        .from("song_requests")
        .select(`*, profiles (full_name, avatar_url, phone, id)`)
        .eq("id", id)
        .maybeSingle(); 

      if (error) {
        console.error("System Error:", error.message);
        return; 
      }

      if (!data) {
        setTicket(null); 
        return; 
      }

      // 4. Double-Check Ownership
      if (!adminStatus && data.user_id !== user.id) {
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
      console.error("Unexpected Error", error);
    } finally {
      setLoading(false);
    }
  }

  // 💾 SAVE CHANGES
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

  // 🔄 UPDATE STATUS
  async function updateStatus(newStatus: string) {
    if (!isAdmin) return;
    setTicket((prev: any) => ({ ...prev, status: newStatus }));
    const { error } = await supabase.from("song_requests").update({ status: newStatus }).eq("id", id);
    if (error) showToast("Failed to update status", "error");
    else showToast(`Status updated to ${newStatus}`, "success");
  }

  // 🗑️ DELETE REQUEST
  async function deleteTicket() {
    if (!isAdmin) return;
    if(!confirm("Are you sure you want to delete this request permanently?")) return;
    
    const { error } = await supabase.from("song_requests").delete().eq("id", id);
    if (error) {
        showToast("Failed to delete request", "error");
    } else {
        showToast("Request deleted", "info");
        router.push("/pages/admin");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <span className="bg-blue-900/80 text-blue-200 border border-blue-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaCheck /> Queue</span>;
      case 'in progress': return <span className="bg-yellow-900/80 text-yellow-200 border border-yellow-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaPlay /> Playing</span>;
      case 'completed': return <span className="bg-green-900/80 text-green-200 border border-green-500/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaCheckDouble /> Done</span>;
      default: return <span className="bg-gray-800/80 text-gray-300 border border-gray-600/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"><FaClock /> Pending</span>;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Loading...</div>;
  
  if (!ticket) return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center gap-6 p-4">
        <div className="bg-[#1a1a1a] border border-[#333] p-10 rounded-3xl text-center max-w-lg shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 text-3xl">!</div>
            <h2 className="text-3xl font-bold text-white mb-3">Request Not Found</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
               You do not have permission to view this request, or it may have been deleted. 
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <Link href="/" className="bg-[#222] hover:bg-[#333] border border-[#333] hover:border-gray-500 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-all group">
                   <FaHome className="text-gray-500 group-hover:text-blue-400 text-xl" />
                   <span className="text-sm font-bold">Home</span>
               </Link>
               <Link href="/pages/request" className="bg-[#222] hover:bg-[#333] border border-[#333] hover:border-gray-500 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-all group">
                   <FaPlus className="text-gray-500 group-hover:text-green-400 text-xl" />
                   <span className="text-sm font-bold">New Ticket</span>
               </Link>
               <Link href="/pages/user/my-tickets" className="bg-[#222] hover:bg-[#333] border border-[#333] hover:border-gray-500 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-all group">
                   <FaList className="text-gray-500 group-hover:text-purple-400 text-xl" />
                   <span className="text-sm font-bold">My Tickets</span>
               </Link>
            </div>
        </div>
    </div>
  );

  const links = Array.isArray(ticket.youtube_link) ? ticket.youtube_link : [ticket.youtube_link];
  const rawThumbnails = getYouTubeThumbnail(links);
  const thumbnails = Array.isArray(rawThumbnails) ? rawThumbnails : (rawThumbnails ? [rawThumbnails] : []);
  const isChoreo = (ticket.music_category || "").toLowerCase() === "choreo";

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans p-4 sm:p-6">
      
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <FaChevronLeft /> {isAdmin ? "Back to Board" : "Back to My Requests"}
        </button>
        {isAdmin && (
          <button onClick={deleteTicket} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition-colors" title="Delete Request">
              <FaTrash />
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 🎵 MAIN HERO CARD */}
        {/* 🚀 CHANGED: Reduced shadow-2xl to shadow-lg to fix overlap issue */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl shadow-lg shadow-black/50 relative z-20 overflow-hidden group min-h-[300px] flex flex-col justify-end">
            <div className="absolute inset-0 z-0">
               {isChoreo && thumbnails.length > 1 ? (
                 <ChoreoMontage images={thumbnails} />
               ) : (
                 <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${thumbnails[0]}')` }} />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
               <div className="absolute inset-0 bg-black/30" /> 
            </div>

            <div className="relative z-10 p-8">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="w-full">
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
                            <a href={links[0]} target="_blank" className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg backdrop-blur-md transition-colors shadow-lg">
                                <FaYoutube /> Open on YouTube
                            </a>
                        </div>
                    </div>
                    <div className="shrink-0 mb-1">{getStatusBadge(ticket.status)}</div>
                </div>

                {isAdmin ? (
                  <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10">
                      <button onClick={() => updateStatus('accepted')} className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg ${ticket.status === 'accepted' ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}><FaCheck /> Accept</button>
                      <button onClick={() => updateStatus('in progress')} className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg ${ticket.status === 'in progress' ? 'bg-yellow-600 text-white ring-2 ring-yellow-400' : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}><FaPlay /> Play</button>
                      <button onClick={() => updateStatus('completed')} className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-lg ${ticket.status === 'completed' ? 'bg-green-600 text-white ring-2 ring-green-400' : 'bg-black/40 text-gray-300 hover:bg-black/60 border border-white/10'}`}><FaCheckDouble /> Finish</button>
                  </div>
                ) : (
                  <div className="mt-8 pt-6 border-t border-white/10 text-gray-400 text-sm italic">
                    Status updates are managed by the admin. You will be notified when this changes.
                  </div>
                )}
            </div>
        </div>

        {/* 📝 DESCRIPTION CARD */}
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

        {/* Bottom Details Grid */}
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