"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { 
  FaUser, 
  FaPhone, 
  FaFacebook, 
  FaInstagram, 
  FaArrowLeft, 
  FaTicketAlt,
  FaExternalLinkAlt,
  FaPen,
  FaTimes,
  FaSave,
  FaShieldAlt,
  FaIdBadge
} from "react-icons/fa";
import { useToast } from "@/app/context/ToastContext";

// ♻️ REUSABLE COMPONENTS
import TicketCard from "@/app/components/TicketCard";
import { Ticket } from "@/app/types";

// --- TYPES ---
interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  avatar_url: string;
  facebook_link: string;
  instagram_link: string;
  role: string;
}

// --- HELPER FUNCTIONS FOR URL PARSING ---
const extractHandle = (url: string, type: 'facebook' | 'instagram') => {
  if (!url) return "";
  
  if (type === 'facebook') {
    // Handle: profile.php?id=123456
    if (url.includes("profile.php?id=")) {
      return url.split("id=")[1];
    }
    // Handle: facebook.com/username
    return url.replace(/^(?:https?:\/\/)?(?:www\.)?facebook\.com\//i, "").replace(/\/$/, "");
  }
  
  if (type === 'instagram') {
    return url.replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\//i, "").replace(/\/$/, "");
  }
  
  return url;
};

const buildUrl = (handle: string, type: 'facebook' | 'instagram') => {
  const cleanHandle = handle.trim();
  if (!cleanHandle) return "";
  if (cleanHandle.startsWith("http")) return cleanHandle; // Already a URL

  if (type === 'facebook') {
    // If it's purely numbers, assume it's a Profile ID
    if (/^\d+$/.test(cleanHandle)) {
      return `https://www.facebook.com/profile.php?id=${cleanHandle}`;
    }
    // Otherwise assume it's a username
    return `https://www.facebook.com/${cleanHandle}`;
  }

  if (type === 'instagram') {
    return `https://www.instagram.com/${cleanHandle}`;
  }

  return cleanHandle;
};

// --- EDIT MODAL COMPONENT ---
function EditUserModal({ 
  isOpen, 
  onClose, 
  user, 
  onUpdate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  user: UserProfile; 
  onUpdate: (updatedData: Partial<UserProfile>) => Promise<void>;
}) {
  // We use a local form state that might differ slightly from the raw DB data
  // specifically for the social fields (showing handles instead of full URLs)
  const [formData, setFormData] = useState({ ...user });
  const [saving, setSaving] = useState(false);

  // Initialize form data when user prop loads
  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        facebook_link: extractHandle(user.facebook_link, 'facebook'),
        instagram_link: extractHandle(user.instagram_link, 'instagram')
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Reconstruct full URLs before saving
    const payload = {
      ...formData,
      facebook_link: buildUrl(formData.facebook_link, 'facebook'),
      instagram_link: buildUrl(formData.instagram_link, 'instagram'),
    };

    await onUpdate(payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]
        bg-white text-gray-900
        dark:bg-[#1e1e1e] dark:text-white"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center border-gray-100 dark:border-[#333]">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FaPen className="text-blue-500" /> Edit User Profile
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.full_name || ""} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full pl-10 p-3 rounded-xl border outline-none focus:border-blue-500 transition-colors
                    bg-gray-50 border-gray-200 text-gray-900
                    dark:bg-[#252525] dark:border-[#333] dark:text-white"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">User Role</label>
              <div className="relative">
                <FaShieldAlt className="absolute left-3 top-3.5 text-gray-400" />
                <select 
                  value={formData.role || "user"} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full pl-10 p-3 rounded-xl border outline-none focus:border-blue-500 transition-colors appearance-none
                    bg-gray-50 border-gray-200 text-gray-900
                    dark:bg-[#252525] dark:border-[#333] dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.phone || ""} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 p-3 rounded-xl border outline-none focus:border-blue-500 transition-colors
                    bg-gray-50 border-gray-200 text-gray-900
                    dark:bg-[#252525] dark:border-[#333] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Facebook */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Facebook</label>
                <div className="relative">
                  <FaFacebook className="absolute left-3 top-3.5 text-blue-600" />
                  <input 
                    type="text" 
                    value={formData.facebook_link || ""} 
                    onChange={(e) => setFormData({...formData, facebook_link: e.target.value})}
                    placeholder="Username or ID"
                    className="w-full pl-10 p-3 rounded-xl border outline-none focus:border-blue-500 transition-colors
                      bg-gray-50 border-gray-200 text-gray-900
                      dark:bg-[#252525] dark:border-[#333] dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Type ID (numbers) or Username</p>
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Instagram</label>
                <div className="relative">
                  <FaInstagram className="absolute left-3 top-3.5 text-pink-500" />
                  <input 
                    type="text" 
                    value={formData.instagram_link || ""} 
                    onChange={(e) => setFormData({...formData, instagram_link: e.target.value})}
                    placeholder="Username"
                    className="w-full pl-10 p-3 rounded-xl border outline-none focus:border-blue-500 transition-colors
                      bg-gray-50 border-gray-200 text-gray-900
                      dark:bg-[#252525] dark:border-[#333] dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">Username only (no @)</p>
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end gap-3 border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#252525]">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-bold transition-colors text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-[#333]"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-user-form"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : <><FaSave /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function AdminUserDetailPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile", profileError);
    } else {
      setProfile(profileData);
    }

    const { data: ticketData, error: ticketError } = await supabase
      .from("song_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (ticketError) {
      console.error("Error fetching tickets", ticketError);
    } else {
      setTickets(ticketData as Ticket[]);
    }
    
    setLoading(false);
  }

  async function handleUpdateUser(updatedData: Partial<UserProfile>) {
    const { error } = await supabase
      .from("profiles")
      .update(updatedData)
      .eq("id", userId);

    if (error) {
      showToast("Failed to update profile", "error");
    } else {
      showToast("Profile updated successfully", "success");
      setProfile({ ...profile!, ...updatedData });
    }
  }

  // Display helper: always shows full link in the main card, 
  // but we use the helper to ensure it's a clickable URL.
  const getSocialUrl = (input: string, domain: string) => {
    return buildUrl(input, domain as 'facebook' | 'instagram');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
      Loading User Profile...
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto font-sans
      bg-gray-50 text-gray-900
      dark:bg-[#121212] dark:text-white"
    >
      
      {/* --- HEADER --- */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 mb-6 font-bold transition-colors text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
      >
        <FaArrowLeft /> Back to Users
      </button>

      {/* --- FANCY PROFILE CARD --- */}
      <div className="w-full rounded-3xl shadow-xl overflow-hidden mb-12 relative group
        bg-white border border-gray-200
        dark:bg-[#1e1e1e] dark:border-[#333]"
      >
        {/* Gradient Banner */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative">
           <button 
             onClick={() => setIsEditModalOpen(true)}
             className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white p-3 rounded-xl transition-all shadow-lg border border-white/10 group-hover:scale-105"
             title="Edit User Info"
           >
             <FaPen size={14} />
           </button>
        </div>

        <div className="px-6 sm:px-10 pb-8 relative">
          
          {/* Overlapping Avatar */}
          <div className="flex flex-col sm:flex-row gap-6 items-start -mt-12 sm:-mt-16 mb-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-white dark:bg-[#1e1e1e] shadow-2xl relative shrink-0">
               <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100 dark:border-[#333] relative bg-gray-100 dark:bg-[#2b2b2b]">
                 {profile?.avatar_url ? (
                   <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                     <FaUser />
                   </div>
                 )}
               </div>
               
               {/* Role Badge */}
               <div className={`absolute bottom-0 right-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-md
                 ${profile?.role === 'admin' 
                   ? "bg-red-500 text-white border-red-400" 
                   : "bg-blue-500 text-white border-blue-400"}`}
               >
                 {profile?.role || "USER"}
               </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 mt-2 sm:mt-16 space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {profile?.full_name || "Unknown User"}
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-gray-100 dark:bg-[#252525] w-fit px-2 py-1 rounded border border-gray-200 dark:border-[#333]">
                <FaIdBadge /> {profile?.id}
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            
            {/* Phone */}
            <div className="p-4 rounded-2xl border flex items-center gap-4 transition-colors
              bg-gray-50 border-gray-100
              dark:bg-[#252525] dark:border-[#333]"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-[#333] text-gray-500 dark:text-gray-400">
                <FaPhone />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">Phone</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{profile?.phone || "N/A"}</p>
              </div>
            </div>

            {/* Facebook */}
            <a href={getSocialUrl(profile?.facebook_link || "", "facebook.com")} target="_blank"
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all group
                ${profile?.facebook_link 
                  ? "bg-blue-50 border-blue-100 hover:border-blue-300 dark:bg-blue-900/10 dark:border-blue-900/30 dark:hover:border-blue-600/50 cursor-pointer" 
                  : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed dark:bg-[#252525] dark:border-[#333]"}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <FaFacebook />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase font-bold text-gray-400">Facebook</p>
                <p className="font-semibold text-blue-700 dark:text-blue-300 truncate">
                  {profile?.facebook_link ? extractHandle(profile.facebook_link, 'facebook') : "Not Linked"}
                </p>
              </div>
              {profile?.facebook_link && <FaExternalLinkAlt className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs" />}
            </a>

            {/* Instagram */}
            <a href={getSocialUrl(profile?.instagram_link || "", "instagram.com")} target="_blank"
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all group
                ${profile?.instagram_link 
                  ? "bg-pink-50 border-pink-100 hover:border-pink-300 dark:bg-pink-900/10 dark:border-pink-900/30 dark:hover:border-pink-600/50 cursor-pointer" 
                  : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed dark:bg-[#252525] dark:border-[#333]"}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                <FaInstagram />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase font-bold text-gray-400">Instagram</p>
                <p className="font-semibold text-pink-700 dark:text-pink-300 truncate">
                  {profile?.instagram_link ? extractHandle(profile.instagram_link, 'instagram') : "Not Linked"}
                </p>
              </div>
              {profile?.instagram_link && <FaExternalLinkAlt className="text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs" />}
            </a>

          </div>
        </div>
      </div>

      {/* --- TICKETS SECTION --- */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
          <FaTicketAlt />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Request History 
        </h2>
        <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-[#333] dark:text-gray-400 border border-gray-300 dark:border-[#444]">
          {tickets.length} Requests
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border-2 border-dashed
          bg-white border-gray-200
          dark:bg-[#1e1e1e] dark:border-[#333]"
        >
          <p className="text-gray-500">This user hasn't made any requests yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {profile && (
        <EditUserModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          user={profile} 
          onUpdate={handleUpdateUser} 
        />
      )}

    </div>
  );
}