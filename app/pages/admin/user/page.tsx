"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
// 🛠️ Added FaArrowLeft to imports
import { FaSearch, FaUser, FaUserShield, FaArrowRight, FaArrowLeft } from "react-icons/fa";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
  email?: string;
};

export default function UserListPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    (user.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      
      {/* 🔙 BACK BUTTON (Static) */}
      <Link href="/pages/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <FaArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
          <p className="text-sm text-gray-400">Manage access and view user profiles</p>
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#333] text-white py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1e1e1e] rounded-xl animate-pulse border border-[#333]"></div>
          ))}
        </div>
      )}

      {/* USER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && filteredUsers.map((user) => (
          <Link 
            key={user.id} 
            // 🛠️ Keep the dynamic link for the individual user profile
            href={`/pages/admin/user/${user.id}?from=list`}
            className="bg-[#1e1e1e] border border-[#333] rounded-xl p-5 hover:border-gray-500 transition-all hover:translate-y-[-2px] hover:shadow-lg group flex items-center gap-4"
          >
            {/* AVATAR */}
            <div className="shrink-0 relative">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[#252525] border-2 border-[#333] group-hover:border-gray-500 transition-colors">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gradient-to-br from-gray-800 to-black">
                    <FaUser size={20} />
                  </div>
                )}
              </div>
              
              {/* ADMIN BADGE */}
              {user.role === 'admin' && (
                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full border-2 border-[#1e1e1e]" title="Admin">
                  <FaUserShield size={10} />
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white truncate text-lg group-hover:text-blue-400 transition-colors">
                  {user.full_name || "Unnamed User"}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider
                   ${user.role === 'admin' 
                     ? 'bg-red-900/20 text-red-400 border-red-800' 
                     : 'bg-blue-900/20 text-blue-400 border-blue-800'}
                 `}>
                   {user.role}
                 </span>
              </div>
            </div>

            {/* ARROW ICON */}
            <div className="text-gray-600 group-hover:text-white transition-colors">
              <FaArrowRight />
            </div>

          </Link>
        ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <FaUser size={40} className="mx-auto mb-4 opacity-20" />
          <p>No users found matching "{search}"</p>
        </div>
      )}

    </div>
  );
}