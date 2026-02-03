"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { 
  FaCamera, 
  FaChevronLeft, 
  FaSave, 
  FaTicketAlt, 
  FaSignOutAlt, 
  FaEnvelope, 
  FaUser, 
  FaPhone, 
  FaFacebook, 
  FaInstagram, 
  FaChevronRight,
  FaExternalLinkAlt,
  FaQuestionCircle,
  FaTimes
} from "react-icons/fa";

// --- HELP MODAL COMPONENT (Unchanged) ---
function SocialHelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
      <div className="bg-[#222] border border-[#333] w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <FaTimes className="text-xl" />
        </button>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FaQuestionCircle className="text-blue-500" />
          <span>How to find your info</span>
        </h3>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold text-sm uppercase tracking-wide">
            <FaFacebook /> Facebook (2 Ways)
          </div>
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1">Option 1: Username</p>
            <div className="bg-[#111] p-2 rounded-lg border border-[#333] font-mono text-[10px] text-gray-500 break-all">
              facebook.com/<span className="text-green-400 font-bold">david.vigh</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Option 2: Profile ID</p>
            <div className="bg-[#111] p-2 rounded-lg border border-[#333] font-mono text-[10px] text-gray-500 break-all">
              facebook.com/profile.php?id=<span className="text-green-400 font-bold">1000123456789</span>
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-[#333] mb-6"></div>
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2 text-pink-400 font-bold text-sm uppercase tracking-wide">
            <FaInstagram /> Instagram
          </div>
          <p className="text-sm text-gray-400 mb-2">
            Just enter your <strong>Instagram Handle</strong> (without the @).
          </p>
          <div className="bg-[#111] p-3 rounded-lg border border-[#333] font-mono text-xs text-gray-500">
            @<span className="text-green-400 font-bold">your_username</span>
          </div>
        </div>
        <button onClick={onClose} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">
          Got it!
        </button>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    facebook: "",
    instagram: "",
    avatarUrl: "",
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const extractUsername = (url: string | null, domain: string) => {
    if (!url) return "";
    if (domain === "facebook.com" && url.includes("profile.php?id=")) {
        return url.split("id=")[1];
    }
    return url.replace(new RegExp(`^(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/`, 'i'), '');
  };

  const buildUrl = (input: string, domain: string) => {
    if (!input) return "";
    const cleanInput = input.trim();
    if (cleanInput.startsWith("http")) return cleanInput;
    if (domain === "facebook.com" && /^\d+$/.test(cleanInput)) {
        return `https://www.facebook.com/profile.php?id=${cleanInput}`;
    }
    return `https://www.${domain}/${cleanInput}`;
  };

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, facebook_link, instagram_link, avatar_url")
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData({
          fullName: data.full_name || "",
          phone: data.phone || "",
          facebook: extractUsername(data.facebook_link, "facebook.com"),
          instagram: extractUsername(data.instagram_link, "instagram.com"),
          avatarUrl: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.log("Error loading user data!");
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      setMessage(null);
      if (!event.target.files || event.target.files.length === 0) throw new Error("No file selected.");

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('profiles').upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
      });
      if (updateError) throw updateError;

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      setMessage({ type: 'success', text: "Avatar updated successfully!" });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Error uploading!" });
    } finally {
      setUploadingImage(false);
    }
  };

  async function updateProfile() {
    try {
      setUpdating(true);
      setMessage(null);
      const fullFacebook = buildUrl(formData.facebook, "facebook.com");
      const fullInstagram = buildUrl(formData.instagram, "instagram.com");

      const { error } = await supabase.from("profiles").upsert({
          id: user?.id as string,
          full_name: formData.fullName,
          phone: formData.phone,
          facebook_link: fullFacebook,
          instagram_link: fullInstagram,
          updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setMessage({ type: 'success', text: "Changes saved!" });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: "Error updating profile!" });
    } finally {
      setUpdating(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getInitials = () => {
    const name = formData.fullName || user?.email || "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white font-sans">
      <SocialHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Header */}
      <div className="relative h-48 bg-gradient-to-r from-blue-900 to-[#1a1a1a]">
        <div className="absolute top-6 left-6 cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => router.back()}>
          <FaChevronLeft className="text-xl" />
        </div>
        <div className="absolute w-full top-8 text-center font-bold text-lg tracking-wide uppercase pointer-events-none">
          Profile
        </div>
      </div>

      <div className="relative -mt-20 px-6 pb-12 flex flex-col items-center">
        
        {/* Avatar */}
        <div className="relative group cursor-pointer" onClick={() => !uploadingImage && fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full bg-[#2b2b2b] border-4 border-[#1a1a1a] flex items-center justify-center shadow-xl mb-3 overflow-hidden group-hover:border-blue-500/50 transition-colors">
            {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
            ) : (
                <span className="text-4xl font-bold text-blue-500">{getInitials()}</span>
            )}
            <div className="absolute inset-0 bg-black/0 transition-colors" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
            <div className="absolute bottom-4 right-0 bg-[#3b3b3b] p-2 rounded-full border border-[#1a1a1a] transition-all shadow-sm group-hover:opacity-0 flex items-center justify-center">
                {uploadingImage ? <span className="text-xs animate-pulse">...</span> : <FaCamera className="text-sm text-gray-300" />}
            </div>
        </div>

        <h2 className="text-xl font-bold">{formData.fullName || "User"}</h2>
        <p className="text-gray-500 text-sm mb-6">{formData.phone || "No phone added"}</p>

        {/* Info Card */}
        <div className="w-full max-w-md bg-[#222222] rounded-3xl p-6 shadow-2xl border border-[#333]">
          
          {/* Email */}
          <div className="flex justify-between items-center py-4 border-b border-[#333]">
            <div className="flex items-center gap-3">
                <FaEnvelope className="text-gray-500" />
                <span className="text-sm font-bold text-gray-400">Email</span>
            </div>
            <span className="text-sm text-gray-500 truncate max-w-[180px]">{user?.email}</span>
          </div>

          {/* Name */}
          <div className="flex justify-between items-center py-4 border-b border-[#333]">
            <div className="flex items-center gap-3">
                <FaUser className="text-gray-500" />
                <span className="text-sm font-bold text-gray-400">Name</span>
            </div>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your Name"
              className="bg-transparent text-right text-sm font-semibold text-blue-400 outline-none w-2/3 placeholder-gray-600 focus:text-white transition-colors"/>
          </div>

          {/* Phone */}
          <div className="flex justify-between items-center py-4 border-b border-[#333]">
            <div className="flex items-center gap-3">
                <FaPhone className="text-gray-500" />
                <span className="text-sm font-bold text-gray-400">Phone</span>
            </div>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+36..."
              className="bg-transparent text-right text-sm text-gray-300 outline-none w-2/3 placeholder-gray-600 focus:text-white transition-colors"/>
          </div>

          {/* Facebook */}
          <div className="flex justify-between items-center py-4 border-b border-[#333]">
            <div className="flex items-center gap-2">
                <FaFacebook className="text-blue-600 text-lg" />
                <span className="text-sm font-bold text-gray-400 hidden sm:block">Facebook</span>
                <FaQuestionCircle className="text-gray-600 hover:text-white cursor-pointer text-xs" onClick={() => setShowHelp(true)} />
            </div>
            
            <div className="flex items-center gap-2 w-2/3 justify-end">
                <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Username or ID"
                  className="bg-transparent text-right text-sm text-blue-600 outline-none w-full placeholder-gray-600 focus:text-blue-400 transition-colors"/>
                
                {/* 🆕 OPEN LINK BUTTON */}
                {formData.facebook && (
                    <a 
                      href={buildUrl(formData.facebook, "facebook.com")} 
                      target="_blank" 
                      className="bg-blue-900/40 p-1.5 rounded-md text-blue-400 hover:bg-blue-600 hover:text-white transition-all ml-1"
                      title="Open Profile"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                )}
            </div>
          </div>

          {/* Instagram */}
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
                <FaInstagram className="text-pink-600 text-lg" />
                <span className="text-sm font-bold text-gray-400 hidden sm:block">Instagram</span>
                <FaQuestionCircle className="text-gray-600 hover:text-white cursor-pointer text-xs" onClick={() => setShowHelp(true)} />
            </div>
            
            <div className="flex items-center gap-2 w-2/3 justify-end">
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Username"
                  className="bg-transparent text-right text-sm text-pink-600 outline-none w-full placeholder-gray-600 focus:text-pink-400 transition-colors"/>
                
                {/* 🆕 OPEN LINK BUTTON */}
                {formData.instagram && (
                    <a 
                      href={buildUrl(formData.instagram, "instagram.com")} 
                      target="_blank" 
                      className="bg-pink-900/40 p-1.5 rounded-md text-pink-400 hover:bg-pink-600 hover:text-white transition-all ml-1"
                      title="Open Profile"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                )}
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="w-full max-w-md mt-6 space-y-3">
          {message && <div className={`text-center text-xs font-bold py-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</div>}

          <button onClick={updateProfile} disabled={updating}
            className="w-full flex items-center justify-between bg-[#2b2b2b] hover:bg-[#333] p-4 rounded-2xl transition-all border border-[#333] group">
            <div className="flex items-center gap-3">
                <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400"><FaSave /></div>
                <span className="font-bold text-sm">Save Changes</span>
            </div>
            <FaChevronRight className="text-gray-500 group-hover:text-white transition-colors text-xs" />
          </button>

          <button onClick={() => router.push("/pages/user/my-tickets")}
            className="w-full flex items-center justify-between bg-[#2b2b2b] hover:bg-[#333] p-4 rounded-2xl transition-all border border-[#333] group">
            <div className="flex items-center gap-3">
                <div className="bg-green-900/30 p-2 rounded-lg text-green-400"><FaTicketAlt /></div>
                <span className="font-bold text-sm">My Tickets</span>
            </div>
            <FaChevronRight className="text-gray-500 group-hover:text-white transition-colors text-xs" />
          </button>

          <button onClick={() => supabase.auth.signOut().then(() => router.push("/auth"))}
            className="w-full flex items-center justify-between bg-[#2b2b2b] hover:bg-red-950/20 p-4 rounded-2xl transition-all border border-[#333] group mt-4">
            <div className="flex items-center gap-3">
                <div className="bg-red-900/20 p-2 rounded-lg text-red-400"><FaSignOutAlt /></div>
                <span className="font-bold text-sm text-red-400">Log Out</span>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}