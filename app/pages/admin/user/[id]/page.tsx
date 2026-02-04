"use client";
import { useEffect, useState, use } from "react"; 
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation"; // 👈 Added useSearchParams
import Link from "next/link";
import { 
  FaUser, FaArrowLeft, FaFacebook, FaInstagram, FaPhone, 
  FaMusic, FaClock, FaEdit, FaTimes, FaSave, FaGlobe, FaUserShield 
} from "react-icons/fa";
import { getYouTubeThumbnail } from "@/app/lib/utils";

// ... (Types stay the same) ...
type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  facebook_link: string;
  instagram_link: string;
  role: string;
};

type Ticket = {
  id: number;
  title: string;
  youtube_link: string;
  status: "new" | "queue" | "in progress" | "done";
  created_at: string;
  base_bpm: string;
  target_bpm: string;
  deadline: string;
};

export default function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 Get URL params
  const { id } = use(params);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // 🛠️ DYNAMIC BACK BUTTON LOGIC
  const fromSource = searchParams.get("from");
  const backLink = fromSource === "list" ? "/pages/admin/user" : "/pages/admin";
  const backText = fromSource === "list" ? "Back to User List" : "Back to Dashboard";

  // ... (Rest of state: showModal, formData, etc.) ...
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    facebook_user: "",
    instagram_user: "",
    role: "user"
  });

  useEffect(() => {
    if (id) fetchUserData(id);
  }, [id]);

  async function fetchUserData(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return; 
    }
    setProfile(profileData);

    const { data: ticketData, error: ticketError } = await supabase
      .from("song_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (ticketError) console.error("Error fetching tickets:", ticketError);
    else setTickets(ticketData as Ticket[]);

    setLoading(false);
  }

  const openEditModal = () => {
    if (!profile) return;
    
    let cleanFB = profile.facebook_link || "";
    cleanFB = cleanFB.replace(/(https?:\/\/)?(www\.)?facebook\.com\//, "").replace("profile.php?id=", "");
    
    const cleanInsta = profile.instagram_link 
      ? profile.instagram_link.replace(/(https?:\/\/)?(www\.)?instagram\.com\//, "").replace("/", "")
      : "";

    setFormData({
      phone: profile.phone || "",
      facebook_user: cleanFB,
      instagram_user: cleanInsta,
      role: profile.role || "user"
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    let finalFB = "";
    if (formData.facebook_user) {
      if (formData.facebook_user.includes("facebook.com")) {
        finalFB = formData.facebook_user;
      } else {
        const isNumericId = /^\d+$/.test(formData.facebook_user);
        finalFB = isNumericId 
          ? `https://www.facebook.com/profile.php?id=${formData.facebook_user}` 
          : `https://www.facebook.com/${formData.facebook_user}`;
      }
    }

    const finalInsta = formData.instagram_user 
      ? (formData.instagram_user.includes("instagram.com") ? formData.instagram_user : `https://www.instagram.com/${formData.instagram_user}`)
      : "";

    const { error } = await supabase
      .from("profiles")
      .update({
        phone: formData.phone,
        facebook_link: finalFB,
        instagram_link: finalInsta,
        role: formData.role
      })
      .eq("id", profile.id);

    if (error) {
      console.error("Update failed:", error);
      alert("Error saving: " + error.message);
    } else {
      setProfile({ 
        ...profile, 
        phone: formData.phone, 
        facebook_link: finalFB, 
        instagram_link: finalInsta,
        role: formData.role 
      });
      setShowModal(false);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center text-white">Loading Profile...</div>;
  if (!profile) return <div className="p-10 text-center text-white">User not found.</div>;

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto relative">
      
      {/* 🔙 DYNAMIC BACK BUTTON */}
      <Link href={backLink} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <FaArrowLeft size={14} /> {backText}
      </Link>

      {/* 👤 PERSONAL DATA CARD */}
      <div className="bg-[#1e1e1e] border border-[#333] rounded-2xl p-8 mb-8 shadow-xl flex flex-col md:flex-row items-start gap-8 relative group/card">
        
        {/* EDIT BUTTON */}
        <button 
            onClick={openEditModal}
            className="absolute top-6 right-6 text-gray-500 hover:text-blue-400 transition-colors p-2 bg-[#252525] rounded-lg border border-[#333] hover:border-blue-500/50 opacity-0 group-hover/card:opacity-100"
            title="Edit Profile"
        >
            <FaEdit size={16} />
        </button>

        {/* Avatar */}
        <div className="w-28 h-28 rounded-full overflow-hidden bg-[#252525] border-4 border-[#333] shrink-0 shadow-lg mt-2">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gradient-to-br from-gray-800 to-black">
              <FaUser size={40} />
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{profile.full_name || "Unnamed User"}</h1>
              
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border
                ${profile.role === 'admin' 
                  ? 'bg-red-900/30 text-red-400 border-red-800'
                  : 'bg-blue-900/30 text-blue-400 border-blue-800'
                }
              `}>
                 {profile.role}
              </span>
            </div>
            
            <div className="flex gap-4 text-center bg-[#252525] p-2 rounded-lg border border-[#333]">
              <div className="px-2">
                <p className="text-xl font-bold text-white">{tickets.length}</p>
                <p className="text-[10px] text-gray-500 uppercase">Requests</p>
              </div>
              <div className="w-px bg-[#444]"></div>
              <div className="px-2">
                <p className="text-xl font-bold text-green-500">{tickets.filter(t => t.status === 'done').length}</p>
                <p className="text-[10px] text-gray-500 uppercase">Completed</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-lg border border-[#333]">
              <div className="bg-[#333] p-2 rounded text-gray-400"><FaPhone size={14} /></div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Phone</p>
                <p className="text-sm text-gray-200">{profile.phone || "Not provided"}</p>
              </div>
            </div>

            {(profile.facebook_link || profile.instagram_link) ? (
              <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-lg border border-[#333]">
                <div className="bg-[#333] p-2 rounded text-gray-400"><FaGlobe size={14} /></div>
                <div className="flex gap-2">
                  {profile.facebook_link && (
                    <a href={profile.facebook_link} target="_blank" className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                      <FaFacebook /> Facebook
                    </a>
                  )}
                  {profile.instagram_link && (
                    <a href={profile.instagram_link} target="_blank" className="flex items-center gap-2 bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#C13584] hover:opacity-90 text-white px-3 py-1.5 rounded text-xs font-bold transition-opacity">
                      <FaInstagram /> Instagram
                    </a>
                  )}
                </div>
              </div>
            ) : (
                <div className="hidden md:block"></div> 
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaMusic className="text-blue-500" /> Request History
      </h2>

      <div className="space-y-4">
        {tickets.map((ticket) => {
          const thumbnail = getYouTubeThumbnail(ticket.youtube_link);
          return (
            <div key={ticket.id} className="bg-[#1e1e1e] border border-[#333] p-4 rounded-xl flex items-center gap-4 hover:border-gray-500 transition-colors group">
              <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[#2a2a2a] border border-[#444] relative">
                {thumbnail ? (
                  <img src={thumbnail} alt="Song" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500"><FaMusic /></div>
                )}
              </div>
              <div className="flex-1">
                <Link href={`/pages/admin/request/${ticket.id}`} className="hover:underline decoration-blue-500 font-bold text-white text-lg">
                  {ticket.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className={`px-2 py-0.5 rounded border uppercase font-bold tracking-wider
                    ${ticket.status === 'done' ? 'bg-green-900/20 text-green-400 border-green-800' : 
                      ticket.status === 'in progress' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800' :
                      'bg-[#252525] text-gray-400 border-[#333]'}
                  `}>
                    {ticket.status}
                  </span>
                  <span className="flex items-center gap-1"><FaClock size={10} /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
         {tickets.length === 0 && (
           <div className="text-center py-12 text-gray-500 bg-[#1e1e1e] rounded-xl border border-[#333] border-dashed">
             This user hasn't requested any songs yet.
           </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-[#333] w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <FaTimes size={18} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaEdit className="text-blue-500" /> Edit Profile
            </h2>

            <div className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">User Role</label>
                <div className="relative">
                    <FaUserShield className={`absolute left-3 top-3 ${formData.role === 'admin' ? 'text-red-500' : 'text-blue-500'}`} />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-[#252525] border border-[#444] text-white py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:border-gray-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 pl-1">
                  Admins have full access to the dashboard and user management.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <div className="relative">
                    <FaPhone className="absolute left-3 top-3 text-gray-500" />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+36 30 123 4567"
                      className="w-full bg-[#252525] border border-[#444] text-white py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook ID / Username</label>
                <div className="relative">
                    <FaFacebook className="absolute left-3 top-3 text-[#1877F2]" />
                    <input 
                      type="text" 
                      value={formData.facebook_user}
                      onChange={(e) => setFormData({...formData, facebook_user: e.target.value})}
                      placeholder="e.g. 100008730220164"
                      className="w-full bg-[#252525] border border-[#444] text-white py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram Handle</label>
                <div className="relative">
                    <FaInstagram className="absolute left-3 top-3 text-[#C13584]" />
                    <input 
                      type="text" 
                      value={formData.instagram_user}
                      onChange={(e) => setFormData({...formData, instagram_user: e.target.value})}
                      placeholder="e.g. david_vigh_official"
                      className="w-full bg-[#252525] border border-[#444] text-white py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
               <button 
                 onClick={() => setShowModal(false)}
                 className="flex-1 py-3 rounded-xl bg-[#2a2a2a] hover:bg-[#333] text-gray-300 font-bold transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSave}
                 disabled={saving}
                 className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
               >
                 {saving ? "Saving..." : <><FaSave /> Save Changes</>}
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}