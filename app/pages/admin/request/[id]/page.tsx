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
  FaLongArrowAltRight
} from "react-icons/fa";

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
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
      
      // Convert empty strings to null for DB
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
      alert("Changes saved!");

    } catch (error) {
      alert("Error saving changes");
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  // 🔄 UPDATE STATUS
  async function updateStatus(newStatus: string) {
    // Optimistic UI update
    setTicket((prev: any) => ({ ...prev, status: newStatus }));
    await supabase.from("song_requests").update({ status: newStatus }).eq("id", id);
  }

  // 🗑️ DELETE REQUEST
  async function deleteTicket() {
    if(!confirm("Are you sure you want to delete this request permanently?")) return;
    await supabase.from("song_requests").delete().eq("id", id);
    router.push("/pages/admin");
  }

  // Helper for Status Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <span className="bg-blue-900/30 text-blue-400 border border-blue-800/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><FaCheck /> Queue</span>;
      case 'in progress': return <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><FaPlay /> Playing</span>;
      case 'completed': return <span className="bg-green-900/30 text-green-400 border border-green-800/50 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><FaCheckDouble /> Done</span>;
      default: return <span className="bg-zinc-800 text-gray-400 border border-zinc-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"><FaClock /> Pending</span>;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Loading Request...</div>;
  if (!ticket) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Request Not Found</div>;

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans p-6">
      
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <FaChevronLeft /> Back to Board
        </button>
        <button onClick={deleteTicket} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition-colors" title="Delete Request">
            <FaTrash />
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 🎵 MAIN CARD: Song Info & Status */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{ticket.title}</h1>
                    <div className="flex items-center gap-3 text-gray-500 text-sm font-mono">
                        <FaClock /> Requested: {new Date(ticket.created_at).toLocaleString()}
                    </div>
                </div>
                <div>{getStatusBadge(ticket.status)}</div>
            </div>

            {/* Status Control Buttons */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-[#333]">
                <button 
                    onClick={() => updateStatus('accepted')}
                    className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${ticket.status === 'accepted' ? 'bg-blue-600 text-white' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
                >
                    <FaCheck /> Accept
                </button>
                <button 
                    onClick={() => updateStatus('in progress')}
                    className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${ticket.status === 'in progress' ? 'bg-yellow-600 text-white' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
                >
                    <FaPlay /> Play
                </button>
                <button 
                    onClick={() => updateStatus('completed')}
                    className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${ticket.status === 'completed' ? 'bg-green-600 text-white' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
                >
                    <FaCheckDouble /> Finish
                </button>
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
            <Link href={`/pages/admin/user/${ticket.user_id}`} className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-6 hover:border-gray-500 transition-colors group h-full">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
                    <FaUser className="text-purple-500" /> Requested By
                </h2>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#2a2a2a] overflow-hidden border-2 border-[#333] group-hover:border-purple-500 transition-colors">
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
                
                <div className="mt-6 text-xs text-gray-500 text-center uppercase tracking-widest font-mono">
                    Click to view profile →
                </div>
            </Link>

        </div>
      </div>
    </main>
  );
}