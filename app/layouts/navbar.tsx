"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import { 
  FaUser, 
  FaSignOutAlt, 
  FaTicketAlt, 
  FaCog,
  FaUserShield,
  FaPlusCircle
} from "react-icons/fa";
import ThemeToggle from "@/app/layouts/ThemeToggle";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
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
  }, []);

  async function fetchUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }
    } catch (error) {
      console.error("Error fetching navbar data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    router.push("/auth");
    setUser(null);
    setProfile(null);
  };

  if (pathname === "/auth") return null;

  return (
    <nav className="sticky top-0 w-full h-16 z-50 flex items-center justify-between px-6 transition-colors duration-300
      /* ⚪ Light Mode: Clean White with Blur */
      bg-white/80 backdrop-blur-md border-b border-gray-200 
      /* ⚫ Dark Mode: Dark Gray/Black */
      dark:bg-[#121212]/95 dark:border-white/5"
    >
      
      {/* LOGO */}
      <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
        SONG TAILOR
      </Link>

      {/* RIGHT SIDE ACTIONS */}
      <div className="flex items-center gap-4">
        
        {/* 🌞 THEME TOGGLE */}
        <ThemeToggle />

        {loading ? (
           <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#333] animate-pulse"></div>
        ) : user ? (
          <>
            {/* DESKTOP BUTTONS (Visible on md+) */}
            {profile?.role === 'admin' && (
              <Link 
                href="/pages/admin" 
                className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-500/20 dark:shadow-red-900/20"
              >
                <FaUserShield size={14} /> Dashboard
              </Link>
            )}

            <Link 
              href="/pages/request" 
              className="hidden md:flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-yellow-500/20 dark:shadow-yellow-900/20"
            >
              Ticket <FaTicketAlt />
            </Link>

            {/* DIVIDER */}
            <div className="h-6 w-px bg-gray-200 dark:bg-[#333] mx-2 hidden md:block"></div>

            {/* AVATAR DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-10 h-10 rounded-full transition-all overflow-hidden flex items-center justify-center border-2 
                  ${isDropdownOpen 
                    ? 'border-blue-500 ring-2 ring-blue-500/30' 
                    : 'border-gray-200 dark:border-[#333] hover:border-gray-400 dark:hover:border-gray-500'}
                  bg-gray-100 dark:bg-[#2a2a2a]`
                }
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-gray-400 text-sm" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-14 w-64 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200
                  /* Dropdown Background & Border */
                  bg-white border border-gray-200 
                  dark:bg-[#1e1e1e] dark:border-[#333]"
                >
                  
                  {/* HEADER */}
                  <div className="p-4 border-b bg-gray-50 border-gray-200 dark:bg-[#252525] dark:border-[#333]">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500 dark:text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{profile?.full_name || "User"}</p>
                    <p className="text-xs font-bold truncate text-gray-400">{user?.email}</p>
                  </div>

                  {/* 🛠️ GROUP 1: PERSONAL STUFF */}
                  <div className="p-2 space-y-1">
                    <Link 
                      href="/pages/user" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors
                        text-gray-700 hover:bg-gray-100 
                        dark:text-gray-300 dark:hover:bg-[#333] dark:hover:text-white"
                    >
                      <FaCog className="text-gray-400 dark:text-gray-500" /> Edit My Profile
                    </Link>
                    
                    <Link 
                      href="/pages/user/my-tickets" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors
                        text-gray-700 hover:bg-gray-100 
                        dark:text-gray-300 dark:hover:bg-[#333] dark:hover:text-white"
                    >
                      <FaTicketAlt className="text-blue-500" /> My Tickets
                    </Link>
                  </div>

                  {/* ➖ SEPARATOR */}
                  <div className="h-px mx-2 bg-gray-200 dark:bg-[#333]"></div>

                  {/* 🛠️ GROUP 2: ACTIONS */}
                  <div className="p-2 space-y-1">
                    {profile?.role === 'admin' && (
                        <Link 
                          href="/pages/admin" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold rounded-lg transition-colors
                            text-red-600 hover:bg-red-50 
                            dark:text-red-400 dark:hover:bg-red-900/10"
                        >
                          <FaUserShield /> Admin Dashboard
                        </Link>
                    )}

                    <Link 
                      href="/pages/request" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold rounded-lg transition-colors
                        text-yellow-600 hover:bg-yellow-50 
                        dark:text-yellow-500 dark:hover:bg-yellow-900/10"
                    >
                      <FaPlusCircle /> Create New Ticket
                    </Link>
                  </div>

                  {/* FOOTER: LOGOUT */}
                  <div className="p-2 border-t border-gray-200 dark:border-[#333]">
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold rounded-lg transition-colors
                        text-gray-500 hover:bg-red-50 hover:text-red-600
                        dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
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
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}