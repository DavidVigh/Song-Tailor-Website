"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null); // State for the full name
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Function to fetch the profile from the database
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      setProfile(data);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchProfile(data.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="w-full bg-[#1a1a1a] border-b border-[#3b3b3b] px-6 py-4 sticky top-0 z-50">
      <div className="w-full flex items-center justify-between">
        {/* LEFT SIDE: LOGO */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-white rounded-lg flex items-center justify-center font-black text-[#1a1a1a] text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            ST
          </div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase hidden sm:inline">
            Song <span className="text-blue-500">Tailor</span>
          </span>
        </Link>

        {/* RIGHT SIDE: DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              <Link
                href="/pages/request"
                className="text-sm font-bold text-gray-300 hover:text-white transition-colors"
              >
                Create a Ticket 🎫
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-[#2b2b2b] border border-[#3b3b3b] flex items-center justify-center hover:border-blue-500 text-xl transition-all"
                >
                  👤
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-[#2b2b2b] border border-[#3b3b3b] rounded-xl shadow-2xl overflow-hidden z-[60]">
                    <div className="px-4 py-3 border-b border-[#3b3b3b] bg-[#222222]">
                      <p className="text-xs text-gray-500 uppercase font-black mb-1">
                        Signed in as
                      </p>
                      {/* Displays Full Name and Email */}
                      <p className="text-sm truncate text-blue-400 font-medium">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/pages/user"
                      className="block px-4 py-3 text-sm text-gray-200 hover:bg-[#1f538d] transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      ⚙️ Edit My Profile
                    </Link>
                    <Link
                      href="/pages/user/my-tickets"
                      className="block px-4 py-3 text-sm text-gray-200 hover:bg-[#1f538d] transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      🎫 Manage My Tickets
                    </Link>
                    <button
                      onClick={() => {
                        supabase.auth.signOut();
                        setShowDropdown(false);
                        router.push("/auth");
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 border-t border-[#3b3b3b] transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth"
                className="px-5 py-2 text-sm font-bold text-white hover:text-blue-400 transition-colors"
              >
                LOG IN
              </Link>
              <Link
                href="/auth"
                className="px-6 py-2.5 text-sm font-bold bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30"
              >
                SIGN UP
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white text-3xl focus:outline-none p-1"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-[#3b3b3b] pt-4 animate-in slide-in-from-top-2">
          {user && (
            <div className="px-4 py-3 border-b border-[#3b3b3b] mb-2">
              <p className="text-xs text-gray-500 uppercase font-black mb-1">
                Signed in as
              </p>
              <div className="flex items-baseline gap-2 overflow-hidden">
                {/* Full Name in Blue */}
                <span className="text-blue-400 font-bold truncate">
                  {profile?.full_name || "User"}
                </span>
                {/* Email next to name, small and gray */}
                <span className="text-[10px] text-gray-500 truncate shrink-0">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          {user ? (
            <>
              <Link
                href="/pages/request"
                className="block px-4 py-3 text-gray-300 hover:bg-[#2b2b2b] rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create a Ticket 🎫
              </Link>
              <Link
                href="/pages/user"
                className="block px-4 py-3 text-gray-300 hover:bg-[#2b2b2b] rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ⚙️ Profile
              </Link>
              <Link
                href="/pages/user/my-tickets"
                className="block px-4 py-3 text-gray-300 hover:bg-[#2b2b2b] rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎫 My Tickets
              </Link>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  setIsMobileMenuOpen(false);
                  router.push("/auth");
                }}
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 px-4">
              <Link
                href="/auth"
                className="w-full text-center py-3 text-gray-300 border border-[#3b3b3b] rounded-lg font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                LOG IN
              </Link>
              <Link
                href="/auth"
                className="w-full text-center py-3 bg-blue-600 rounded-lg font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
