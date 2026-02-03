"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  FaChevronLeft, 
  FaUser, 
  FaPhone, 
  FaFacebook, 
  FaInstagram, 
  FaMusic, 
  FaClock, 
  FaCheck, 
  FaPlay, 
  FaCheckDouble,
  FaExternalLinkAlt 
} from "react-icons/fa";

export default function AdminUserProfile() {
  const params = useParams(); // Safer access to params
  const id = params?.id as string; // Force string type
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
        fetchUserData();
    }
  }, [id]);

  async function fetchUserData() {
    try {
      setLoading(true);

      // 1. Check if YOU are an admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      
      const { data: currentUser } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (currentUser?.role !== 'admin') {
        router.push("/pages/user/my-tickets");
        return;
      }

      // 2. Fetch the TARGET User Profile
      // We use .maybeSingle() instead of .single() to prevent 0-row errors crashing the app
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle(); 

      if (profileError) throw profileError;
      if (!userProfile) {
        console.warn("User profile not found in database.");
        setProfile(null);
      } else {
        setProfile(userProfile);
      }

      // 3. Fetch User's Tickets
      const { data: userTickets, error: ticketError } = await supabase
        .from("song_requests")
        .select("*")
        .eq("user_id", id)
        .order('created_at', { ascending: false });

      if (ticketError) throw ticketError;
      setTickets(userTickets || []);

    } catch (error: any) {
      // 🐛 IMPROVED DEBUGGING LOGS
      console.error("FULL ERROR OBJECT:", error);
      console.error("ERROR MESSAGE:", error.message || "No message provided");
      console.error("ERROR DETAILS:", error.details || "No details provided");
    } finally {
      setLoading(false);
    }
  }

  // Helper for Status Badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <span className="text-blue-400 flex items-center gap-1"><FaCheck /> Queue</span>;
      case 'in progress': return <span className="text-yellow-400 flex items-center gap-1"><FaPlay /> Playing</span>;
      case 'completed': return <span className="text-green-400 flex items-center gap-1"><FaCheckDouble /> Done</span>;
      default: return <span className="text-gray-400 flex items-center gap-1"><FaClock /> New</span>;
    }
  };

  if (loading) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Loading Profile...</div>;
  
  // Show a nice error state if profile is missing
  if (!profile) return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center gap-4">
          <FaUser className="text-4xl text-gray-600" />
          <h2 className="text-xl font-bold text-gray-400">User Not Found</h2>
          <button onClick={() => router.back()} className="text-blue-500 hover:underline">Go Back</button>
      </div>
  );

  return (
    <main className="min-h-screen bg-[#121212] text-white font-sans p-6">
      
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <FaChevronLeft /> Back to Board
      </button>

      {/* 👤 USER PROFILE CARD */}
      <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-[#333] max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start">
        
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full bg-[#2a2a2a] border-4 border-[#333] overflow-hidden shrink-0 shadow-xl">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500"><FaUser /></div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div>
            <h1 className="text-3xl font-bold">{profile.full_name || "Unknown User"}</h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">User ID: {id.slice(0, 8)}...</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.phone && (
              <div className="bg-[#222] p-3 rounded-xl border border-[#333] flex items-center gap-3">
                <FaPhone className="text-gray-500" />
                <span className="text-sm">{profile.phone}</span>
              </div>
            )}
            
            {profile.facebook_link && (
              <a href={profile.facebook_link} target="_blank" className="bg-[#222] p-3 rounded-xl border border-[#333] flex items-center gap-3 hover:border-blue-600 transition-colors group">
                <FaFacebook className="text-blue-600" />
                <span className="text-sm text-gray-300 group-hover:text-white truncate">Facebook</span>
                <FaExternalLinkAlt className="text-xs text-gray-600 ml-auto group-hover:text-blue-500" />
              </a>
            )}

            {profile.instagram_link && (
              <a href={profile.instagram_link} target="_blank" className="bg-[#222] p-3 rounded-xl border border-[#333] flex items-center gap-3 hover:border-pink-600 transition-colors group">
                <FaInstagram className="text-pink-600" />
                <span className="text-sm text-gray-300 group-hover:text-white truncate">Instagram</span>
                <FaExternalLinkAlt className="text-xs text-gray-600 ml-auto group-hover:text-pink-500" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 🎟️ USER'S TICKETS LIST */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-[#333] pb-4">
          <FaMusic className="text-blue-500" /> 
          <span>{profile.full_name}'s Requests</span>
          <span className="bg-[#333] text-xs px-2 py-1 rounded-full text-gray-300">{tickets.length}</span>
        </h2>

        <div className="space-y-3">
          {tickets.length === 0 ? (
             <div className="text-gray-600 text-center py-10 italic">No tickets found for this user.</div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="bg-[#1e1e1e] p-4 rounded-xl border border-[#333] flex items-center justify-between hover:border-gray-600 transition-colors">
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${ticket.status === 'in progress' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[#2a2a2a] text-blue-500'}`}>
                    <FaMusic />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-200">{ticket.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      {ticket.base_bpm && <span className="border border-[#444] px-1.5 rounded">{ticket.base_bpm} BPM</span>}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold uppercase tracking-wider">
                  {getStatusBadge(ticket.status)}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </main>
  );
}