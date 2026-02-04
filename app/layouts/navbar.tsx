"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { 
  FaUser, 
  FaSignOutAlt, 
  FaTicketAlt, 
  FaCog 
} from "react-icons/fa";

export default function Navbar() {
  // 1. ALL HOOKS MUST BE DECLARED AT THE TOP
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 2. useEffects must always run, regardless of the page
  useEffect(() => {
    // Only fetch if we are NOT on the auth page to save resources
    if (pathname !== "/auth") {
      fetchUser();
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchUser(); // Refresh data on login
      }
    });

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname]); // Re-run if path changes (safe way)

  async function fetchUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return; 
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) setProfile(profile);

    } catch (error) {
      console.error("Error fetching navbar data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    setUser(null);
    setProfile(null);
    router.push("/auth");
  };

  // 3. 🛑 NOW YOU CAN RETURN NULL (After all hooks are done)
  if (pathname === "/auth") return null;

  // 4. Render the Navbar
  return (
    <nav className="sticky top-0 w-full h-16 bg-[#121212] flex items-center justify-between px-6 z-50 border-b border-transparent">
      
      {/* LOGO */}
      <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
        SONG TAILOR
      </Link>

      {/* RIGHT SIDE ACTIONS */}
      <div className="flex items-center gap-4">
        
        {loading ? (
           <div className="w-8 h-8 rounded-full bg-[#333] animate-pulse"></div>
        ) : user ? (
          <>
            {/* Create Ticket Button */}
            <Link 
              href="/" 
              className="hidden md:flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-yellow-900/20"
            >
              Create a Ticket <FaTicketAlt />
            </Link>

            <div className="h-6 w-px bg-[#333] mx-2 hidden md:block"></div>

            {/* Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-10 h-10 rounded-full bg-[#2a2a2a] border-2 transition-all overflow-hidden flex items-center justify-center ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-[#333] hover:border-gray-500'}`}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-gray-400 text-sm" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-14 w-60 bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-[#333] bg-[#252525]">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{profile?.full_name || "User"}</p>
                    <p className="text-xs font-bold text-gray-400 truncate">{user.email}</p>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link 
                      href="/pages/user" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded-lg transition-colors"
                    >
                      <FaCog className="text-gray-500" /> Edit My Profile
                    </Link>
                    
                    <Link 
                      href="/pages/user/my-tickets" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:bg-[#333] hover:text-white rounded-lg transition-colors"
                    >
                      <FaTicketAlt className="text-yellow-500" /> My Tickets
                    </Link>
                  </div>

                  <div className="p-2 border-t border-[#333]">
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors font-bold"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link 
            href="/auth" 
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
