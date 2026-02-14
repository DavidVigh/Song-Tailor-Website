"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  FaSearch,
  FaUser,
  FaUserShield,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import UserListLoadingGrid from "@/app/layouts/UserListLoadingGrid";

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
    (user.full_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen p-8 max-w-6xl mx-auto font-sans
      /* ☀️ Light Mode */
      bg-gray-50 text-gray-900
      /* 🌙 Dark Mode */
      dark:bg-[#121212] dark:text-white"
    >
      {/* 🔙 BACK BUTTON */}
      <Link
        href="/pages/admin"
        className="inline-flex items-center gap-2 mb-6 transition-colors font-semibold
        text-gray-500 hover:text-blue-600
        dark:text-gray-400 dark:hover:text-white"
      >
        <FaArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage access and view user profiles
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:border-blue-500 transition-colors border
              /* ☀️ Light Mode */
              bg-white border-gray-300 text-gray-900 placeholder-gray-400
              /* 🌙 Dark Mode */
              dark:bg-[#1e1e1e] dark:border-[#333] dark:text-white dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && <UserListLoadingGrid />}

      {/* USER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading &&
          filteredUsers.map((user) => (
            <Link
              key={user.id}
              href={`/pages/admin/user/${user.id}?from=list`}
              className="rounded-xl p-5 transition-all hover:translate-y-[-2px] hover:shadow-lg group flex items-center gap-4 border
              /* ☀️ Light Mode */
              bg-white border-gray-200 hover:border-gray-300
              /* 🌙 Dark Mode */
              dark:bg-[#1e1e1e] dark:border-[#333] dark:hover:border-gray-500"
            >
              {/* AVATAR - Dynamic Border Color */}
              <div className="shrink-0 relative">
                <div
                  className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-colors
                ${
                  user.role === "admin"
                    ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/20"
                    : "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                }
              `}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center 
                    ${user.role === "admin" ? "text-red-500" : "text-blue-500"}`}
                    >
                      <FaUser size={20} />
                    </div>
                  )}
                </div>

                {/* ADMIN BADGE (Avatar Corner) */}
                {user.role === "admin" && (
                  <div
                    className="absolute -bottom-1 -right-1 text-white p-1 rounded-full border-2 shadow-sm
                  bg-red-500 border-white
                  dark:bg-red-600 dark:border-[#1e1e1e]"
                    title="Admin"
                  >
                    <FaUserShield size={10} />
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3
                    className="font-bold truncate text-lg transition-colors
                  text-gray-800 group-hover:text-blue-600
                  dark:text-white dark:group-hover:text-blue-400"
                  >
                    {user.full_name || "Unnamed User"}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider
                   ${
                     user.role === "admin"
                       ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                       : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                   }
                 `}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* ARROW ICON */}
              <div
                className="transition-colors
              text-gray-300 group-hover:text-blue-500
              dark:text-gray-600 dark:group-hover:text-white"
              >
                <FaArrowRight />
              </div>
            </Link>
          ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <FaUser size={40} className="mx-auto mb-4 opacity-20" />
          <p>No users found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
