"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  FaHome, 
  FaMusic, 
  FaSignOutAlt, 
  FaUserCog, 
  FaPlusCircle,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useToast } from "@/app/context/ToastContext"; // 👈 Import Hook

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast(); // 👈 Use Hook
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  useEffect(() => {
    checkUserRole();
  }, []);

  async function checkUserRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (data?.role === "admin") setIsAdmin(true);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    showToast("Logged out successfully", "info"); // 👈 Toast
    router.push("/auth");
  }

  // Hide sidebar on Auth page
  if (pathname === "/auth") return null;

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, href: "/" },
    { name: "My Requests", icon: <FaMusic />, href: "/pages/user/my-tickets" },
    { name: "New Request", icon: <FaPlusCircle />, href: "/pages/request" },
  ];

  if (isAdmin) {
    menuItems.push({ name: "Admin Panel", icon: <FaUserCog />, href: "/pages/admin" });
  }

  return (
    <>
      {/* MOBILE HEADER (Visible on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-bold text-blue-500">SONG TAILOR</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* SIDEBAR (Desktop: Fixed left / Mobile: Overlay) */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-[#1e1e1e] border-r border-[#333] text-white flex flex-col z-40 transition-transform duration-300 ease-in-out
        w-64 pt-20 md:pt-6
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        {/* LOGO (Desktop only) */}
        <div className="hidden md:block px-6 mb-8">
          <h1 className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            SONG TAILOR
          </h1>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Close menu on mobile click
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"}
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-[#333]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all font-medium"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </aside>

      {/* OVERLAY (Mobile only - closes menu when clicking outside) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
        />
      )}
    </>
  );
}